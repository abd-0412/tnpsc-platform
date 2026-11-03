import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') || '30', 10)));

    let query = supabase
      .from('questions')
      .select('id, kind, level, difficulty, syllabus, texts, answer, question_data, source, tags, workflow')
      .eq('is_archived', false)
      .eq('workflow->>status', 'published');

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
      query = query.or(
        `syllabus->>lesson_id.eq.${nodeId},syllabus->>unit_id.eq.${nodeId},syllabus->>term_id.eq.${nodeId},syllabus->>class_id.eq.${nodeId}`
      );
    }

    query = query.order('created_at', { ascending: false }).limit(limit);

    const { data: questions, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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

