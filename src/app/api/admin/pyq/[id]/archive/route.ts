import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
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

    const body = await request.json();
    const { action = 'archive', reason = '' } = body; // 'archive' | 'restore'
    const now = new Date().toISOString();

    const { data: paper, error: fetchErr } = await supabase
      .from('pyq_papers')
      .select('id, title_en, test_template_id')
      .eq('id', id)
      .single();

    if (fetchErr || !paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    if (action === 'archive') {
      const { error: updErr } = await supabase
        .from('pyq_papers')
        .update({
          is_archived: true,
          status: 'archived',
          archived_at: now,
          archived_by: user.id,
          archive_reason: reason || 'Archived by Admin',
          updated_at: now,
        })
        .eq('id', id);

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 400 });
      }

      // If published in tests, hide from active student lists
      if (paper.test_template_id) {
        await supabase
          .from('test_templates')
          .update({ is_published: false })
          .eq('id', paper.test_template_id);
      }

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'pyq_paper_archive',
        entityType: 'pyq_paper',
        entityId: id,
        details: { reason },
      });

      return NextResponse.json({
        success: true,
        message: `PYQ Paper "${paper.title_en}" has been archived.`,
      });
    }

    if (action === 'restore') {
      const { error: updErr } = await supabase
        .from('pyq_papers')
        .update({
          is_archived: false,
          status: 'draft',
          archived_at: null,
          archived_by: null,
          archive_reason: null,
          updated_at: now,
        })
        .eq('id', id);

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 400 });
      }

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'pyq_paper_restore',
        entityType: 'pyq_paper',
        entityId: id,
        details: { restoredBy: user.id },
      });

      return NextResponse.json({
        success: true,
        message: `PYQ Paper "${paper.title_en}" restored to Draft status.`,
      });
    }

    return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 });
  } catch (err: any) {
    console.error('Error in POST /api/admin/pyq/[id]/archive:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
