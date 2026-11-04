import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const { data: paper, error } = await supabase
      .from('pyq_papers')
      .select(`
        *,
        exams (
          id,
          title_en,
          title_ta
        )
      `)
      .eq('id', id)
      .single();

    if (error || !paper) {
      return NextResponse.json({ error: 'PYQ Paper not found' }, { status: 404 });
    }

    // Fetch assigned question metrics
    const { data: paperQuestions, error: pqErr } = await supabase
      .from('pyq_paper_questions')
      .select(`
        question_id,
        sequence_order,
        section_name,
        marks,
        negative_marks,
        questions (
          id,
          texts,
          answer,
          kind,
          difficulty,
          workflow,
          language_status
        )
      `)
      .eq('paper_id', id)
      .order('sequence_order', { ascending: true });

    const questionsList = (paperQuestions || []).map((pq: any) => ({
      ...pq.questions,
      sequence_order: pq.sequence_order,
      section_name: pq.section_name,
      paper_marks: pq.marks,
      paper_negative_marks: pq.negative_marks,
    }));

    let verifiedCount = 0;
    let pendingVerificationCount = 0;
    let missingTranslationCount = 0;
    let missingAnswerCount = 0;

    questionsList.forEach((q) => {
      const status = q?.workflow?.status || 'draft';
      if (status === 'published' || status === 'verified') {
        verifiedCount++;
      } else {
        pendingVerificationCount++;
      }

      if (!q?.texts?.en?.question) {
        missingTranslationCount++;
      }

      if (!q?.answer?.correct_option_id && !q?.answer?.correct_key) {
        missingAnswerCount++;
      }
    });

    const assignedCount = questionsList.length;
    const isComplete = assignedCount >= paper.expected_question_count;

    return NextResponse.json({
      paper: {
        ...paper,
        assigned_questions_count: assignedCount,
        is_complete: isComplete,
      },
      metrics: {
        totalAssigned: assignedCount,
        expectedQuestions: paper.expected_question_count,
        missingQuestions: Math.max(0, paper.expected_question_count - assignedCount),
        verifiedCount,
        pendingVerificationCount,
        missingTranslationCount,
        missingAnswerCount,
        isEligibleForPublishing:
          isComplete &&
          missingAnswerCount === 0 &&
          pendingVerificationCount === 0,
      },
    });
  } catch (err: any) {
    console.error('Error fetching PYQ paper details:', err);
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

    const body = await request.json();
    const now = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      updated_at: now,
    };

    if (body.title_en !== undefined) updatePayload.title_en = body.title_en;
    if (body.title_ta !== undefined) updatePayload.title_ta = body.title_ta;
    if (body.exam_id !== undefined) updatePayload.exam_id = body.exam_id;
    if (body.exam_group !== undefined) updatePayload.exam_group = body.exam_group;
    if (body.year !== undefined) updatePayload.year = Number(body.year);
    if (body.date_held !== undefined) updatePayload.date_held = body.date_held || null;
    if (body.paper_code !== undefined) updatePayload.paper_code = body.paper_code;
    if (body.duration_minutes !== undefined) updatePayload.duration_minutes = Number(body.duration_minutes);
    if (body.total_marks !== undefined) updatePayload.total_marks = Number(body.total_marks);
    if (body.expected_question_count !== undefined) updatePayload.expected_question_count = Number(body.expected_question_count);
    if (body.instructions_en !== undefined) updatePayload.instructions_en = body.instructions_en;
    if (body.instructions_ta !== undefined) updatePayload.instructions_ta = body.instructions_ta;
    if (body.high_yield_topics !== undefined) updatePayload.high_yield_topics = body.high_yield_topics;
    if (body.status !== undefined) updatePayload.status = body.status;

    const { data: updatedPaper, error } = await supabase
      .from('pyq_papers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating PYQ paper:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'pyq_paper_update',
      entityType: 'pyq_paper',
      entityId: id,
      details: updatePayload,
    });

    return NextResponse.json({
      paper: updatedPaper,
      message: 'PYQ paper details updated successfully.',
    });
  } catch (err: any) {
    console.error('Error updating PYQ paper:', err);
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

    // 1. Check if paper exists and if linked test template has learner attempts
    const { data: paper, error: fetchErr } = await supabase
      .from('pyq_papers')
      .select('id, title_en, test_template_id')
      .eq('id', id)
      .single();

    if (fetchErr || !paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    if (paper.test_template_id) {
      const { count: attemptCount } = await supabase
        .from('test_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('test_template_id', paper.test_template_id);

      if (attemptCount && attemptCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot permanently delete paper "${paper.title_en}" because it has ${attemptCount} completed student test attempts. Please archive the paper instead to protect historical test records.`,
            attemptCount,
            canArchiveInstead: true,
          },
          { status: 409 }
        );
      }
    }

    // 2. Safe delete: delete associations from pyq_paper_questions (Original questions in questions table remain untouched!)
    const { error: unlinkErr } = await supabase
      .from('pyq_paper_questions')
      .delete()
      .eq('paper_id', id);

    if (unlinkErr) {
      console.error('Error unlinking questions:', unlinkErr);
    }

    // 3. Delete from pyq_papers
    const { error: deleteErr } = await supabase
      .from('pyq_papers')
      .delete()
      .eq('id', id);

    if (deleteErr) {
      console.error('Error deleting paper:', deleteErr);
      return NextResponse.json({ error: deleteErr.message }, { status: 400 });
    }

    await logAuditEvent(supabase, {
      userId: user.id,
      action: 'pyq_paper_delete',
      entityType: 'pyq_paper',
      entityId: id,
      details: { title_en: paper.title_en },
    });

    return NextResponse.json({
      success: true,
      message: `PYQ Paper "${paper.title_en}" deleted successfully. Central Question Bank questions remain intact.`,
    });
  } catch (err: any) {
    console.error('Error deleting PYQ paper:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
