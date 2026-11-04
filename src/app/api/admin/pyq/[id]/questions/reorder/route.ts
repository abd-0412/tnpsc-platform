import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

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

    const body = await request.json();
    const { order } = body;

    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: 'Order array is required.' }, { status: 400 });
    }

    // Update sequence_order for each question in this paper
    // To prevent any unique conflicts during batch updates, update individually or in safe order
    for (const item of order) {
      if (item.question_id && typeof item.sequence_order === 'number') {
        const { error } = await supabase
          .from('pyq_paper_questions')
          .update({ sequence_order: item.sequence_order })
          .eq('paper_id', id)
          .eq('question_id', item.question_id);

        if (error) {
          console.error(`Error updating order for question ${item.question_id}:`, error);
        }
      }
    }

    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'pyq_paper_reorder_questions',
      entityType: 'pyq_paper',
      entityId: id,
      details: { reorderedCount: order.length },
    });

    return NextResponse.json({
      success: true,
      message: 'Question order saved successfully.',
    });
  } catch (err: any) {
    console.error('Error reordering paper questions:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
