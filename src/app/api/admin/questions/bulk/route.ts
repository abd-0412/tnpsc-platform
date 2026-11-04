import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logBulkAuditEvents, AuditLogEntry } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const { action, questionIds, reason, targetStatus, selectAllMatching, filters, excludedIds } = body;

    let resolvedQuestionIds: string[] = [];

    if (selectAllMatching && filters) {
      const { tab, q: search, exam, subject, term, unit, lesson, difficulty, kind, status } = filters;
      let qQuery = supabase.from('questions').select('id');

      if (tab === 'archived') {
        qQuery = qQuery.eq('is_archived', true).is('deleted_at', null);
      } else if (tab === 'deleted') {
        qQuery = qQuery.not('deleted_at', 'is', null);
      } else if (tab === 'rejected') {
        qQuery = qQuery.eq('workflow->>status', 'rejected').is('deleted_at', null);
      } else {
        // Default: active
        qQuery = qQuery.eq('is_archived', false).is('deleted_at', null).neq('workflow->>status', 'rejected');
      }

      if (difficulty) qQuery = qQuery.eq('difficulty', difficulty);
      if (kind) qQuery = qQuery.eq('kind', kind);
      if (status && status !== 'all') {
        if (status === 'under_revision' || status === 'under_review') {
          qQuery = qQuery.or('workflow->>status.eq.under_revision,workflow->>status.eq.under_review');
        } else {
          qQuery = qQuery.eq('workflow->>status', status);
        }
      }
      if (exam) {
        if (exam === 'all_groups') {
          qQuery = qQuery.or('syllabus->>exam_scope.eq.all_groups');
        } else {
          qQuery = qQuery.or(`syllabus->>exam_scope.eq.all_groups,exam_mappings.cs.[{"exam_id":"${exam}"}]`);
        }
      }
      if (subject) qQuery = qQuery.eq('syllabus->>subject_id', subject);
      if (term) {
        if (term === 'all') qQuery = qQuery.or('syllabus->>term_scope.eq.all');
        else qQuery = qQuery.or(`syllabus->>term_id.eq.${term},syllabus->>term_scope.eq.all`);
      }
      if (unit) {
        if (unit === 'all') qQuery = qQuery.or('syllabus->>unit_scope.eq.all,syllabus->>term_scope.eq.all');
        else qQuery = qQuery.or(`syllabus->>unit_id.eq.${unit},syllabus->>unit_scope.eq.all,syllabus->>term_scope.eq.all`);
      }
      if (lesson) {
        if (lesson === 'all') qQuery = qQuery.or('syllabus->>lesson_scope.eq.all,syllabus->>unit_scope.eq.all,syllabus->>term_scope.eq.all');
        else qQuery = qQuery.or(`syllabus->>lesson_id.eq.${lesson},syllabus->>lesson_scope.eq.all,syllabus->>unit_scope.eq.all,syllabus->>term_scope.eq.all`);
      }
      if (search) {
        qQuery = qQuery.or(`texts->ta->>question.ilike.%${search}%,texts->en->>question.ilike.%${search}%,id.ilike.%${search}%`);
      }

      const { data: matchedRows, error: matchErr } = await qQuery;
      if (matchErr) {
        return NextResponse.json({ error: matchErr.message }, { status: 500 });
      }

      const excludedSet = new Set(excludedIds || []);
      resolvedQuestionIds = (matchedRows || []).map((r: any) => r.id).filter((id: string) => !excludedSet.has(id));
    } else {
      resolvedQuestionIds = Array.isArray(questionIds) ? questionIds : [];
    }

    if (!resolvedQuestionIds || resolvedQuestionIds.length === 0) {
      return NextResponse.json({ error: 'At least one Question ID is required or matching filters yielded 0 questions.' }, { status: 400 });
    }

    const validActions = [
      'archive',
      'restore',
      'soft_delete',
      'restore_deleted',
      'permanent_delete',
      'bulk_publish',
      'bulk_reject',
      'bulk_revision',
      'bulk_resubmit',
    ];

    if (!validActions.includes(action)) {
      return NextResponse.json({ error: `Invalid bulk action: ${action}` }, { status: 400 });
    }

    // Bulk Rejection strictly requires a non-empty reason
    if (action === 'bulk_reject' && (!reason || typeof reason !== 'string' || !reason.trim())) {
      return NextResponse.json(
        { error: 'Rejection reason is mandatory for bulk rejection.' },
        { status: 400 }
      );
    }

    const adminName = profile.full_name || 'Admin';
    const now = new Date().toISOString();

    // Fetch target questions (chunks of 1000 if needed)
    let existingQuestions: any[] = [];
    const chunkSize = 1000;
    for (let i = 0; i < resolvedQuestionIds.length; i += chunkSize) {
      const chunk = resolvedQuestionIds.slice(i, i + chunkSize);
      const { data: chunkData, error: fetchError } = await supabase
        .from('questions')
        .select('id, workflow, is_archived, deleted_at, texts')
        .in('id', chunk);

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }
      if (chunkData) {
        existingQuestions.push(...chunkData);
      }
    }

    const existingMap = new Map((existingQuestions || []).map((q) => [q.id, q]));
    const auditLogs: AuditLogEntry[] = [];
    const successfulIds: string[] = [];
    const failedRecords: Array<{ id: string; reason: string }> = [];

    // Permanent Deletion check: Verify foreign keys in test_attempt_items
    let protectedIdsSet = new Set<string>();
    if (action === 'permanent_delete') {
      for (let i = 0; i < resolvedQuestionIds.length; i += chunkSize) {
        const chunk = resolvedQuestionIds.slice(i, i + chunkSize);
        const { data: referencedAttempts } = await supabase
          .from('test_attempt_items')
          .select('question_id')
          .in('question_id', chunk);

        if (referencedAttempts && referencedAttempts.length > 0) {
          referencedAttempts.forEach((r) => protectedIdsSet.add(r.question_id));
        }
      }
    }

    for (const qId of resolvedQuestionIds) {
      const q = existingMap.get(qId);
      if (!q) {
        failedRecords.push({ id: qId, reason: 'Question not found in database' });
        continue;
      }

      const currentWorkflow = q.workflow || { status: 'draft', verification_comments: [] };
      const currentStatus = currentWorkflow.status || 'draft';
      const history = Array.isArray(currentWorkflow.history) ? [...currentWorkflow.history] : [];
      const comments = Array.isArray(currentWorkflow.verification_comments)
        ? [...currentWorkflow.verification_comments]
        : [];

      try {
        if (action === 'archive') {
          history.push({
            from_status: currentStatus,
            to_status: 'archived',
            action: 'archive',
            by_id: user.id,
            by_name: adminName,
            reason: reason || 'Archived by admin',
            timestamp: now,
          });

          await supabase
            .from('questions')
            .update({
              is_archived: true,
              archived_at: now,
              archived_by: user.id,
              archive_reason: reason || null,
              workflow: {
                ...currentWorkflow,
                history,
              },
              updated_at: now,
            })
            .eq('id', qId);

          auditLogs.push({
            userId: user.id,
            action: 'question_archive',
            entityType: 'question',
            entityId: qId,
            details: { previous_status: currentStatus, reason },
          });
          successfulIds.push(qId);
        } else if (action === 'restore') {
          // Restore unarchives question; target status defaults to 'draft' unless explicitly requested
          const restoredStatus = targetStatus === 'published' ? 'published' : 'draft';
          history.push({
            from_status: 'archived',
            to_status: restoredStatus,
            action: 'restore',
            by_id: user.id,
            by_name: adminName,
            reason: reason || 'Restored from archive',
            timestamp: now,
          });

          await supabase
            .from('questions')
            .update({
              is_archived: false,
              archived_at: null,
              archived_by: null,
              archive_reason: null,
              workflow: {
                ...currentWorkflow,
                status: restoredStatus,
                history,
              },
              updated_at: now,
            })
            .eq('id', qId);

          auditLogs.push({
            userId: user.id,
            action: 'question_restore',
            entityType: 'question',
            entityId: qId,
            details: { restored_status: restoredStatus },
          });
          successfulIds.push(qId);
        } else if (action === 'soft_delete') {
          history.push({
            from_status: currentStatus,
            to_status: 'deleted',
            action: 'soft_delete',
            by_id: user.id,
            by_name: adminName,
            reason: reason || 'Soft deleted by admin',
            timestamp: now,
          });

          await supabase
            .from('questions')
            .update({
              deleted_at: now,
              deleted_by: user.id,
              deletion_reason: reason || 'Deleted by admin',
              workflow: {
                ...currentWorkflow,
                history,
              },
              updated_at: now,
            })
            .eq('id', qId);

          auditLogs.push({
            userId: user.id,
            action: 'question_soft_delete',
            entityType: 'question',
            entityId: qId,
            details: { reason },
          });
          successfulIds.push(qId);
        } else if (action === 'restore_deleted') {
          history.push({
            from_status: 'deleted',
            to_status: currentStatus,
            action: 'restore_deleted',
            by_id: user.id,
            by_name: adminName,
            reason: 'Restored from deleted',
            timestamp: now,
          });

          await supabase
            .from('questions')
            .update({
              deleted_at: null,
              deleted_by: null,
              deletion_reason: null,
              workflow: {
                ...currentWorkflow,
                history,
              },
              updated_at: now,
            })
            .eq('id', qId);

          auditLogs.push({
            userId: user.id,
            action: 'question_restore_deleted',
            entityType: 'question',
            entityId: qId,
            details: { restored_status: currentStatus },
          });
          successfulIds.push(qId);
        } else if (action === 'permanent_delete') {
          if (protectedIdsSet.has(qId)) {
            failedRecords.push({
              id: qId,
              reason: 'Cannot be permanently deleted: referenced by historical student test attempts.',
            });
            continue;
          }

          const { error: delError } = await supabase.from('questions').delete().eq('id', qId);
          if (delError) {
            failedRecords.push({ id: qId, reason: delError.message });
          } else {
            auditLogs.push({
              userId: user.id,
              action: 'question_permanent_delete',
              entityType: 'question',
              entityId: qId,
              details: { deleted_permanently: true },
            });
            successfulIds.push(qId);
          }
        } else if (action === 'bulk_publish') {
          if (currentStatus === 'rejected') {
            failedRecords.push({
              id: qId,
              reason: 'Cannot directly publish a rejected question. It must be resubmitted to Draft or Revision first.',
            });
            continue;
          }
          history.push({
            from_status: currentStatus,
            to_status: 'published',
            action: 'approve_publish',
            by_id: user.id,
            by_name: adminName,
            timestamp: now,
          });

          await supabase
            .from('questions')
            .update({
              is_archived: false,
              workflow: {
                ...currentWorkflow,
                status: 'published',
                verification_status: 'verified',
                verified_by: adminName,
                verified_at: now,
                history,
              },
              updated_at: now,
            })
            .eq('id', qId);

          auditLogs.push({
            userId: user.id,
            action: 'question_verification_publish',
            entityType: 'question',
            entityId: qId,
            details: { from_status: currentStatus, to_status: 'published' },
          });
          successfulIds.push(qId);
        } else if (action === 'bulk_reject') {
          comments.push({
            author_id: user.id,
            author_name: adminName,
            comment: reason,
            created_at: now,
          });

          history.push({
            from_status: currentStatus,
            to_status: 'rejected',
            action: 'reject',
            by_id: user.id,
            by_name: adminName,
            reason: reason,
            timestamp: now,
          });

          await supabase
            .from('questions')
            .update({
              workflow: {
                ...currentWorkflow,
                status: 'rejected',
                verification_status: 'rejected',
                rejection_reason: reason,
                verification_comments: comments,
                history,
              },
              updated_at: now,
            })
            .eq('id', qId);

          auditLogs.push({
            userId: user.id,
            action: 'question_verification_reject',
            entityType: 'question',
            entityId: qId,
            details: { from_status: currentStatus, to_status: 'rejected', reason },
          });
          successfulIds.push(qId);
        } else if (action === 'bulk_revision') {
          if (reason) {
            comments.push({
              author_id: user.id,
              author_name: adminName,
              comment: reason,
              created_at: now,
            });
          }

          history.push({
            from_status: currentStatus,
            to_status: 'under_revision',
            action: 'request_revision',
            by_id: user.id,
            by_name: adminName,
            reason: reason || 'Requested revision',
            timestamp: now,
          });

          await supabase
            .from('questions')
            .update({
              workflow: {
                ...currentWorkflow,
                status: 'under_revision',
                verification_status: 'in_review',
                verification_comments: comments,
                history,
              },
              updated_at: now,
            })
            .eq('id', qId);

          auditLogs.push({
            userId: user.id,
            action: 'question_verification_revision',
            entityType: 'question',
            entityId: qId,
            details: { from_status: currentStatus, to_status: 'under_revision', reason },
          });
          successfulIds.push(qId);
        } else if (action === 'bulk_resubmit') {
          history.push({
            from_status: currentStatus,
            to_status: 'draft',
            action: 'resubmit_to_draft',
            by_id: user.id,
            by_name: adminName,
            timestamp: now,
          });

          await supabase
            .from('questions')
            .update({
              workflow: {
                ...currentWorkflow,
                status: 'draft',
                verification_status: 'pending',
                history,
              },
              updated_at: now,
            })
            .eq('id', qId);

          auditLogs.push({
            userId: user.id,
            action: 'question_verification_resubmit',
            entityType: 'question',
            entityId: qId,
            details: { from_status: currentStatus, to_status: 'draft' },
          });
          successfulIds.push(qId);
        }
      } catch (err: any) {
        failedRecords.push({ id: qId, reason: err.message });
      }
    }

    // Persist all generated audit logs
    if (auditLogs.length > 0) {
      await logBulkAuditEvents(supabase, auditLogs);
    }

    return NextResponse.json({
      success: true,
      action,
      processedCount: successfulIds.length,
      failedCount: failedRecords.length,
      successfulIds,
      failedRecords,
      message: `Successfully processed ${successfulIds.length} question(s) with action: ${action}${
        failedRecords.length > 0 ? ` (${failedRecords.length} failed/protected)` : ''
      }`,
    });
  } catch (err: any) {
    console.error('Error in POST /api/admin/questions/bulk:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

