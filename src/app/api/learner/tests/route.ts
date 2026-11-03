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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      return NextResponse.json(
        { error: 'Admins cannot access learner test listings. Please use the Admin Test Management portal.' },
        { status: 403 }
      );
    }

    // Fetch published test templates
    const { data: templates, error: tError } = await supabase
      .from('test_templates')
      .select(`
        *,
        exams (
          id,
          title_en,
          title_ta
        )
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (tError) {
      return NextResponse.json({ error: tError.message }, { status: 500 });
    }

    // Fetch learner's attempts for these templates
    const { data: attempts, error: aError } = await supabase
      .from('test_attempts')
      .select('id, test_template_id, status, score, accuracy_percentage, started_at, completed_at')
      .eq('user_id', user.id);

    if (aError) {
      return NextResponse.json({ error: aError.message }, { status: 500 });
    }

    // Group attempts by test_template_id
    const attemptsMap = new Map<string, any[]>();
    attempts?.forEach((att) => {
      if (att.test_template_id) {
        if (!attemptsMap.has(att.test_template_id)) {
          attemptsMap.set(att.test_template_id, []);
        }
        attemptsMap.get(att.test_template_id)!.push(att);
      }
    });

    const testsWithUserProgress = templates?.map((tmpl) => {
      const userAttempts = attemptsMap.get(tmpl.id) || [];
      const inProgress = userAttempts.find((a) => a.status === 'in_progress');
      const completed = userAttempts.filter((a) => a.status === 'completed');
      const bestScore = completed.reduce((max, a) => Math.max(max, Number(a.score) || 0), 0);

      return {
        ...tmpl,
        user_status: inProgress ? 'in_progress' : completed.length > 0 ? 'completed' : 'not_attempted',
        active_attempt_id: inProgress ? inProgress.id : null,
        attempt_count: completed.length,
        best_score: bestScore,
      };
    });

    return NextResponse.json({ tests: testsWithUserProgress || [] });
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
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'admin') {
      return NextResponse.json(
        { error: 'Admins cannot access learner test listings. Please use the Admin Test Management portal.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { test_template_id, dynamic_mode, syllabus_node_id, title_ta, title_en, duration_minutes } = body;

    let targetQuestions: any[] = [];
    let examId: string | null = null;
    let testTitleEn = title_en;
    let testTitleTa = title_ta;
    let testDuration = duration_minutes || 60;
    let totalMarks = 0;

    if (test_template_id) {
      // Starting from a defined Test Template
      const { data: template, error: tmplError } = await supabase
        .from('test_templates')
        .select('*')
        .eq('id', test_template_id)
        .single();

      if (tmplError || !template) {
        return NextResponse.json({ error: 'Test template not found' }, { status: 404 });
      }

      examId = template.exam_id;
      testTitleEn = template.title_en;
      testTitleTa = template.title_ta;
      testDuration = template.duration_minutes;
      totalMarks = Number(template.total_marks);

      if (template.question_ids && template.question_ids.length > 0) {
        const { data: qData } = await supabase
          .from('questions')
          .select('*')
          .in('id', template.question_ids);

        if (qData) {
          const qMap = new Map(qData.map((q) => [q.id, q]));
          targetQuestions = template.question_ids.map((id: string) => qMap.get(id)).filter(Boolean);
        }
      }
    } else if (dynamic_mode && syllabus_node_id) {
      // Dynamic test from Syllabus (Lesson, Iyal, Term, or Standard)
      // Search questions mapped to this syllabus node or subnodes
      const { data: node } = await supabase
        .from('syllabus_nodes')
        .select('*')
        .eq('id', syllabus_node_id)
        .single();

      testTitleTa = `${node?.title_ta || 'பாடத்திட்டம்'} - மாதிரித் தேர்வு`;
      testTitleEn = `${node?.title_en || 'Syllabus'} - Practice Test`;

      // Find all published questions matching syllabus
      const { data: qData, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .eq('is_archived', false)
        .or(`syllabus->>lesson_id.eq.${syllabus_node_id},syllabus->>unit_id.eq.${syllabus_node_id},syllabus->>term_id.eq.${syllabus_node_id},syllabus->>class_id.eq.${syllabus_node_id}`)
        .limit(100);

      if (qErr) {
        return NextResponse.json({ error: qErr.message }, { status: 500 });
      }

      targetQuestions = qData || [];

      // If no questions specific to this node, fetch any available questions in same subject
      if (targetQuestions.length === 0) {
        const { data: fallbackQ } = await supabase
          .from('questions')
          .select('*')
          .eq('is_archived', false)
          .limit(20);
        targetQuestions = fallbackQ || [];
      }

      testDuration = Math.max(15, Math.ceil(targetQuestions.length * 1.5));
      totalMarks = targetQuestions.length * 1.5;
    }

    if (targetQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for this test yet. Please add or import questions first.' },
        { status: 400 }
      );
    }

    // Create the test_attempts entry
    const { data: attempt, error: attemptError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: user.id,
        test_template_id: test_template_id || null,
        exam_id: examId,
        title_en: testTitleEn,
        title_ta: testTitleTa,
        status: 'in_progress',
        total_time_seconds: 0,
        score: 0.0,
        accuracy_percentage: 0.0,
        total_questions: targetQuestions.length,
        correct_count: 0,
        wrong_count: 0,
        unanswered_count: targetQuestions.length,
      })
      .select()
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: attemptError?.message || 'Failed to start test' }, { status: 500 });
    }

    // Create test_attempt_items with immutable snapshots
    const attemptItems = targetQuestions.map((q, index) => ({
      attempt_id: attempt.id,
      user_id: user.id,
      question_id: q.id,
      question_order: index + 1,
      question_snapshot: {
        id: q.id,
        kind: q.kind,
        level: q.level,
        difficulty: q.difficulty,
        texts: q.texts,
        question_data: q.question_data,
        answer: q.answer,
        question_settings: q.question_settings,
        source: q.source,
        tags: q.tags,
      },
      selected_answer: null,
      is_answered: false,
      is_marked_for_review: false,
      is_correct: null,
      marks_obtained: 0.0,
      time_spent_seconds: 0,
    }));

    const { error: itemsError } = await supabase
      .from('test_attempt_items')
      .insert(attemptItems);

    if (itemsError) {
      console.error('Error inserting attempt items:', itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      attempt_id: attempt.id,
      duration_minutes: testDuration,
      total_questions: targetQuestions.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

