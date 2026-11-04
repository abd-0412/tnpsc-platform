import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logBulkAuditEvents, AuditLogEntry } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'draft';
    const search = searchParams.get('q') || '';
    const subject = searchParams.get('subject') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .eq('is_archived', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      if (status === 'under_revision' || status === 'under_review') {
        query = query.or('workflow->>status.eq.under_revision,workflow->>status.eq.under_review');
      } else {
        query = query.eq('workflow->>status', status);
      }
    }

    if (subject) {
      query = query.eq('syllabus->>subject_id', subject);
    }

    if (search) {
      query = query.or(
        `texts->ta->>question.ilike.%${search}%,texts->en->>question.ilike.%${search}%,id.ilike.%${search}%`
      );
    }

    const { data: questions, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Counts for tabs
    const [
      { count: draftCount },
      { count: revisionCount },
      { count: publishedCount },
      { count: rejectedCount },
    ] = await Promise.all([
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('workflow->>status', 'draft').eq('is_archived', false).is('deleted_at', null),
      supabase.from('questions').select('*', { count: 'exact', head: true }).or('workflow->>status.eq.under_revision,workflow->>status.eq.under_review').eq('is_archived', false).is('deleted_at', null),
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('workflow->>status', 'published').eq('is_archived', false).is('deleted_at', null),
      supabase.from('questions').select('*', { count: 'exact', head: true }).eq('workflow->>status', 'rejected').eq('is_archived', false).is('deleted_at', null),
    ]);

    return NextResponse.json({
      questions: questions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      counts: {
        draft: draftCount || 0,
        under_revision: revisionCount || 0,
        published: publishedCount || 0,
        rejected: rejectedCount || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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
    const { questionIds, action, comment, reason } = body;
    const finalReason = reason || comment || '';

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: 'At least one Question ID is required' }, { status: 400 });
    }

    const allowedActions = [
      'approve',
      'publish',
      'request_correction',
      'revision',
      'resubmit',
      'to_draft',
      'reject',
      'archive',
    ];

    if (!allowedActions.includes(action)) {
      return NextResponse.json({ error: `Invalid verification action: ${action}` }, { status: 400 });
    }

    // Rejection strictly requires a reason
    if (action === 'reject' && (!finalReason || !finalReason.trim())) {
      return NextResponse.json(
        { error: 'Rejection reason is mandatory when rejecting questions.' },
        { status: 400 }
      );
    }

    const adminName = profile.full_name || 'Admin';
    const now = new Date().toISOString();

    let newStatus = 'draft';
    let newVerificationStatus = 'pending';

    if (action === 'approve' || action === 'publish') {
      newStatus = 'published';
      newVerificationStatus = 'verified';
    } else if (action === 'request_correction' || action === 'revision') {
      newStatus = 'under_revision';
      newVerificationStatus = 'in_review';
    } else if (action === 'resubmit' || action === 'to_draft') {
      newStatus = 'draft';
      newVerificationStatus = 'pending';
    } else if (action === 'reject') {
      newStatus = 'rejected';
      newVerificationStatus = 'rejected';
    }

    // Fetch existing questions
    const { data: existingQuestions, error: fetchErr } = await supabase
      .from('questions')
      .select('id, workflow, texts')
      .in('id', questionIds);

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    const auditLogs: AuditLogEntry[] = [];
    const successfulIds: string[] = [];
    const failedRecords: Array<{ id: string; reason: string }> = [];

    for (const q of existingQuestions || []) {
      const currentWorkflow = q.workflow || { status: 'draft', verification_comments: [] };
      const currentStatus = currentWorkflow.status || 'draft';
      const history = Array.isArray(currentWorkflow.history) ? [...currentWorkflow.history] : [];
      const comments = Array.isArray(currentWorkflow.verification_comments)
        ? [...currentWorkflow.verification_comments]
        : [];

      // Validate allowed transitions
      if (action === 'approve' || action === 'publish') {
        if (currentStatus === 'rejected') {
          failedRecords.push({
            id: q.id,
            reason: 'Cannot directly publish a rejected question. It must be resubmitted to Draft or Revision first.',
          });
          continue;
        }
      }

      if (finalReason) {
        comments.push({
          author_id: user.id,
          author_name: adminName,
          comment: finalReason,
          created_at: now,
        });
      }

      history.push({
        from_status: currentStatus,
        to_status: action === 'archive' ? 'archived' : newStatus,
        action: action,
        by_id: user.id,
        by_name: adminName,
        reason: finalReason || undefined,
        timestamp: now,
      });

      try {
        if (action === 'archive') {
          await supabase
            .from('questions')
            .update({
              is_archived: true,
              archived_at: now,
              archived_by: user.id,
              archive_reason: finalReason || null,
              workflow: {
                ...currentWorkflow,
                history,
              },
              updated_at: now,
            })
            .eq('id', q.id);

          auditLogs.push({
            userId: user.id,
            action: 'question_archive',
            entityType: 'question',
            entityId: q.id,
            details: { previous_status: currentStatus, reason: finalReason },
          });
        } else {
          const updatedWorkflow = {
            ...currentWorkflow,
            status: newStatus,
            verification_status: newVerificationStatus,
            verified_by: (action === 'approve' || action === 'publish') ? adminName : currentWorkflow.verified_by,
            verified_at: (action === 'approve' || action === 'publish') ? now : currentWorkflow.verified_at,
            rejection_reason: action === 'reject' ? finalReason : currentWorkflow.rejection_reason,
            verification_comments: comments,
            history,
          };

          await supabase
            .from('questions')
            .update({
              is_archived: false,
              workflow: updatedWorkflow,
              updated_at: now,
            })
            .eq('id', q.id);

          auditLogs.push({
            userId: user.id,
            action: `question_verification_${action}`,
            entityType: 'question',
            entityId: q.id,
            details: {
              previous_status: currentStatus,
              new_status: newStatus,
              reason: finalReason,
            },
          });
        }

        successfulIds.push(q.id);
      } catch (err: any) {
        failedRecords.push({ id: q.id, reason: err.message });
      }
    }

    if (auditLogs.length > 0) {
      await logBulkAuditEvents(supabase, auditLogs);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${successfulIds.length} question(s) with action: ${action}${
        failedRecords.length > 0 ? ` (${failedRecords.length} skipped)` : ''
      }`,
      newStatus,
      processedCount: successfulIds.length,
      failedCount: failedRecords.length,
      successfulIds,
      failedRecords,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
