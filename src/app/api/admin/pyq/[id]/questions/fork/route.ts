import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuestionSchema } from '@/lib/schemas/question';
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
    const { action = 'check', questionId } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required.' }, { status: 400 });
    }

    // 1. Check sharing status across papers and tests
    const { data: papersUsingQ } = await supabase
      .from('pyq_paper_questions')
      .select('paper_id, pyq_papers(title_en, year)')
      .eq('question_id', questionId);

    const { data: testsUsingQ } = await supabase
      .from('test_templates')
      .select('id, title_en')
      .contains('question_ids', [questionId]);

    const otherPapers = (papersUsingQ || []).filter((p) => p.paper_id !== id);
    const isShared = otherPapers.length > 0 || (testsUsingQ || []).length > 0;

    if (action === 'check') {
      return NextResponse.json({
        isShared,
        otherPapersCount: otherPapers.length,
        testsCount: (testsUsingQ || []).length,
        otherPapers: otherPapers.map((p: any) => ({
          id: p.paper_id,
          title: p.pyq_papers?.title_en || p.paper_id,
        })),
        tests: (testsUsingQ || []).map((t) => ({
          id: t.id,
          title: t.title_en,
        })),
      });
    }

    // 2. Action: Fork question specifically for this paper
    if (action === 'fork') {
      // Fetch original question
      const { data: originalQ, error: origErr } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single();

      if (origErr || !originalQ) {
        return NextResponse.json({ error: 'Original question not found' }, { status: 404 });
      }

      // Generate new distinct Question ID
      const newQuestionId = `${questionId}-FORK-${Date.now().toString(36).slice(-4).toUpperCase()}`;
      const now = new Date().toISOString();

      const clonedQ = {
        ...originalQ,
        id: newQuestionId,
        texts: body.updatedQuestion?.texts || originalQ.texts,
        answer: body.updatedQuestion?.answer || originalQ.answer,
        kind: body.updatedQuestion?.kind || originalQ.kind,
        difficulty: body.updatedQuestion?.difficulty || originalQ.difficulty,
        question_settings: body.updatedQuestion?.question_settings || originalQ.question_settings,
        source: body.updatedQuestion?.source || originalQ.source,
        workflow: {
          status: 'draft',
          verification_status: 'pending',
          history: [
            {
              from_status: originalQ.workflow?.status || 'draft',
              to_status: 'draft',
              action: 'fork_from_' + questionId,
              by_id: user.id,
              by_name: profile.full_name || 'Admin',
              timestamp: now,
            },
          ],
        },
        version: 1,
        created_by: user.id,
        created_at: now,
        updated_at: now,
      };

      const validated = QuestionSchema.parse(clonedQ);

      // Insert cloned question
      const { error: insErr } = await supabase.from('questions').insert([validated]);
      if (insErr) {
        return NextResponse.json({ error: insErr.message }, { status: 400 });
      }

      // Update paper mapping in pyq_paper_questions to point to newQuestionId
      const { error: mapErr } = await supabase
        .from('pyq_paper_questions')
        .update({ question_id: newQuestionId })
        .eq('paper_id', id)
        .eq('question_id', questionId);

      if (mapErr) {
        return NextResponse.json({ error: mapErr.message }, { status: 400 });
      }

      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'pyq_question_fork',
        entityType: 'question',
        entityId: newQuestionId,
        details: {
          originalQuestionId: questionId,
          paperId: id,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Question successfully forked into unique copy "${newQuestionId}" for this paper only.`,
        newQuestionId,
      });
    }

    return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 });
  } catch (err: any) {
    console.error('Error in POST /api/admin/pyq/[id]/questions/fork:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

