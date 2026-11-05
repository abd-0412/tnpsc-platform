import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveSyllabusAncestry, buildSyllabusDiscoveryFilter } from '@/lib/syllabus-discovery';

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

    // Role verification: Admins should not use learner practice
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      return NextResponse.json(
        { error: 'Admins cannot access learner practice. Use Admin Question Bank.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || 'all';
    const classStd = searchParams.get('class') || 'all';
    const difficulty = searchParams.get('difficulty') || 'all';
    const kind = searchParams.get('kind') || 'all';
    const nodeId = searchParams.get('nodeId') || '';
    const pyqOnly = searchParams.get('pyqOnly') === 'true';
    const limitParam = searchParams.get('limit');
    let limit = 500;
    if (limitParam && limitParam !== 'all') {
      const parsed = parseInt(limitParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = Math.min(500, parsed);
      }
    }

    let query = supabase
      .from('questions')
      .select('id, kind, level, difficulty, syllabus, texts, answer, question_data, source, previous_year, tags, workflow')
      .eq('is_archived', false)
      .eq('workflow->>status', 'published');

    if (pyqOnly) {
      query = query.or('previous_year->>is_pyq.eq.true,previous_year->>is_previous_year.eq.true');
    }

    if (subject !== 'all') {
      query = query.eq('syllabus->>subject_id', subject);
    }

    if (classStd !== 'all') {
      query = query.eq('syllabus->>class', classStd);
    }

    if (difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    if (kind !== 'all') {
      query = query.eq('kind', kind);
    }

    if (nodeId) {
      const ancestry = await resolveSyllabusAncestry(supabase, nodeId);
      const orFilter = buildSyllabusDiscoveryFilter(ancestry);
      query = query.or(orFilter);
    }

    query = query.order('id', { ascending: true }).limit(limit);

    let { data: questions, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Resilience Fallback: If 0 questions returned for a specific lesson node, discover questions from the parent Iyal/Unit
    if ((!questions || questions.length === 0) && nodeId) {
      const ancestry = await resolveSyllabusAncestry(supabase, nodeId);
      if (ancestry.unitId) {
        let fallbackQuery = supabase
          .from('questions')
          .select('id, kind, level, difficulty, syllabus, texts, answer, question_data, source, previous_year, tags, workflow')
          .eq('is_archived', false)
          .eq('workflow->>status', 'published')
          .eq('syllabus->>unit_id', ancestry.unitId);

        if (difficulty !== 'all') {
          fallbackQuery = fallbackQuery.eq('difficulty', difficulty);
        }
        if (kind !== 'all') {
          fallbackQuery = fallbackQuery.eq('kind', kind);
        }

        fallbackQuery = fallbackQuery.order('id', { ascending: true }).limit(limit);
        const { data: fallbackQuestions } = await fallbackQuery;
        if (fallbackQuestions && fallbackQuestions.length > 0) {
          questions = fallbackQuestions;
        }
      }
    }

    // Fetch user's saved mistake_vault question IDs to display bookmark state
    const { data: userMistakes } = await supabase
      .from('mistake_vault')
      .select('question_id')
      .eq('user_id', user.id);

    const savedVaultSet = new Set(userMistakes?.map((m) => m.question_id) || []);

    const questionsWithVaultStatus = (questions || []).map((q) => ({
      ...q,
      is_in_vault: savedVaultSet.has(q.id),
    }));

    return NextResponse.json({
      questions: questionsWithVaultStatus,
      total: questionsWithVaultStatus.length,
      filters: {
        subject,
        class: classStd,
        difficulty,
        nodeId,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

