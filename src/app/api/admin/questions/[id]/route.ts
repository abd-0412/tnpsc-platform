import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuestionSchema } from '@/lib/schemas/question';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: question, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Fetch related audit logs for this question
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', 'question')
      .eq('entity_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ question, auditLogs: auditLogs || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Fetch existing question to compare status change
    const { data: existingQ, error: fetchErr } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existingQ) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const body = await request.json();
    const now = new Date().toISOString();
    const adminName = profile.full_name || 'Admin';

    const currentWorkflow = existingQ.workflow || {};
    const newStatus = body.workflow?.status || currentWorkflow.status || 'draft';
    const history = Array.isArray(currentWorkflow.history) ? [...currentWorkflow.history] : [];

    // Track status change in history
    if (newStatus !== currentWorkflow.status) {
      history.push({
        from_status: currentWorkflow.status,
        to_status: newStatus,
        action: 'edit_status_update',
        by_id: user.id,
        by_name: adminName,
        reason: body.workflow?.rejection_reason || 'Updated via question editor',
        timestamp: now,
      });
    }

    const updatedWorkflow = {
      ...currentWorkflow,
      ...(body.workflow || {}),
      status: newStatus,
      history,
    };

    // Validate with Zod
    const validatedData = QuestionSchema.parse({
      ...body,
      id,
      workflow: updatedWorkflow,
      updated_at: now,
      version: (existingQ.version || 1) + 1,
    });

    const { data, error } = await supabase
      .from('questions')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log Audit Event
    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'question_update',
      entityType: 'question',
      entityId: id,
      details: {
        previous_status: currentWorkflow.status,
        new_status: newStatus,
        version: validatedData.version,
      },
    });

    return NextResponse.json({ question: data, message: 'Question updated successfully' });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 422 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data: existingQ, error: fetchErr } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !existingQ) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, reason, targetStatus } = body;
    const now = new Date().toISOString();
    const adminName = profile.full_name || 'Admin';

    const currentWorkflow = existingQ.workflow || { status: 'draft' };
    const history = Array.isArray(currentWorkflow.history) ? [...currentWorkflow.history] : [];

    if (action === 'archive') {
      history.push({
        from_status: currentWorkflow.status,
        to_status: 'archived',
        action: 'archive',
        by_id: user.id,
        by_name: adminName,
        reason: reason || 'Archived by admin',
        timestamp: now,
      });

      const { data, error } = await supabase
        .from('questions')
        .update({
          is_archived: true,
          archived_at: now,
          archived_by: user.id,
          archive_reason: reason || null,
          workflow: { ...currentWorkflow, history },
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'question_archive',
        entityType: 'question',
        entityId: id,
        details: { reason },
      });

      return NextResponse.json({ success: true, question: data, message: 'Question archived successfully' });
    } else if (action === 'restore') {
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

      const { data, error } = await supabase
        .from('questions')
        .update({
          is_archived: false,
          archived_at: null,
          archived_by: null,
          archive_reason: null,
          workflow: { ...currentWorkflow, status: restoredStatus, history },
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'question_restore',
        entityType: 'question',
        entityId: id,
        details: { restored_status: restoredStatus },
      });

      return NextResponse.json({ success: true, question: data, message: `Question restored to ${restoredStatus}` });
    } else if (action === 'restore_deleted') {
      history.push({
        from_status: 'deleted',
        to_status: currentWorkflow.status || 'draft',
        action: 'restore_deleted',
        by_id: user.id,
        by_name: adminName,
        timestamp: now,
      });

      const { data, error } = await supabase
        .from('questions')
        .update({
          deleted_at: null,
          deleted_by: null,
          deletion_reason: null,
          workflow: { ...currentWorkflow, history },
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'question_restore_deleted',
        entityType: 'question',
        entityId: id,
      });

      return NextResponse.json({ success: true, question: data, message: 'Deleted question restored successfully' });
    }

    return NextResponse.json({ error: 'Invalid patch action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const searchParams = request.nextUrl.searchParams;
    const permanent = searchParams.get('permanent') === 'true';
    const reason = searchParams.get('reason') || 'Deleted by admin';

    // Check if referenced in historical student test attempts
    const { data: attemptItem } = await supabase
      .from('test_attempt_items')
      .select('attempt_id')
      .eq('question_id', id)
      .limit(1);

    const hasAttemptReferences = attemptItem && attemptItem.length > 0;

    if (permanent) {
      if (hasAttemptReferences) {
        return NextResponse.json(
          {
            error:
              'Cannot permanently delete this question because it is referenced in student test history. Please use soft deletion to preserve test integrity.',
          },
          { status: 409 }
        );
      }

      const { error: delError } = await supabase.from('questions').delete().eq('id', id);
      if (delError) {
        return NextResponse.json({ error: delError.message }, { status: 400 });
      }

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'question_permanent_delete',
        entityType: 'question',
        entityId: id,
      });

      return NextResponse.json({ success: true, message: 'Question permanently deleted.' });
    }

    // Soft deletion (Standard, safe for test attempts)
    const now = new Date().toISOString();
    const { data: existingQ } = await supabase.from('questions').select('workflow').eq('id', id).single();
    const currentWorkflow = existingQ?.workflow || { status: 'draft' };
    const history = Array.isArray(currentWorkflow.history) ? [...currentWorkflow.history] : [];
    history.push({
      from_status: currentWorkflow.status,
      to_status: 'deleted',
      action: 'soft_delete',
      by_id: user.id,
      by_name: profile.full_name || 'Admin',
      reason,
      timestamp: now,
    });

    const { error: updateError } = await supabase
      .from('questions')
      .update({
        deleted_at: now,
        deleted_by: user.id,
        deletion_reason: reason,
        workflow: { ...currentWorkflow, history },
        updated_at: now,
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'question_soft_delete',
      entityType: 'question',
      entityId: id,
      details: { reason },
    });

    return NextResponse.json({ success: true, message: 'Question deleted successfully (safe soft delete).' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
