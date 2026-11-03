import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const body = await request.json();
    const { answers, total_time_minutes } = body;
    // answers is an object mapping question order or question ID to selected option:
    // e.g. { 1: 'A', 2: 'B', ... } or { 'TNPSC-001': 'C' }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Answers payload is required' }, { status: 400 });
    }

    // 1. Check if ID is already an attempt ID
    let attemptId = id;
    let { data: attempt } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    // 2. If not an attempt, check if it's a test template ID and initialize an attempt
    if (!attempt) {
      const { data: template } = await supabase
        .from('test_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (!template) {
        return NextResponse.json({ error: 'Test attempt or template not found' }, { status: 404 });
      }

      // Fetch questions
      const questionIds: string[] = template.question_ids || [];
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds);

      // Create new attempt
      const { data: newAttempt, error: createError } = await supabase
        .from('test_attempts')
        .insert({
          user_id: user.id,
          test_template_id: template.id,
          exam_id: template.exam_id,
          title_en: template.title_en,
          title_ta: template.title_ta,
          status: 'in_progress',
          total_questions: template.question_count || questions?.length || 0,
        })
        .select()
        .single();

      if (createError || !newAttempt) {
        return NextResponse.json({ error: createError?.message || 'Failed to initialize attempt' }, { status: 500 });
      }

      attempt = newAttempt;
      attemptId = newAttempt.id;

      // Create attempt items
      const itemsToInsert = (questions || []).map((q, idx) => ({
        attempt_id: attemptId,
        user_id: user.id,
        question_id: q.id,
        question_order: idx + 1,
        question_snapshot: q,
        is_answered: false,
        marks_obtained: 0.0,
      }));

      if (itemsToInsert.length > 0) {
        await supabase.from('test_attempt_items').insert(itemsToInsert);
      }
    }

    // 3. Fetch all attempt items
    const { data: items } = await supabase
      .from('test_attempt_items')
      .select('*')
      .eq('attempt_id', attemptId)
      .order('question_order', { ascending: true });

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No questions found for this test' }, { status: 400 });
    }

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let totalScore = 0;
    const mistakeInserts: any[] = [];
    const itemUpdates: any[] = [];

    // Evaluate each question against keyed-in answer
    items.forEach((item) => {
      const qOrder = item.question_order;
      const qId = item.question_id;

      // Lookup user's marked bubble (by question order or by question ID)
      const userChoice = (answers[qOrder] || answers[String(qOrder)] || answers[qId] || '').toUpperCase().trim();

      const snapshot = item.question_snapshot || {};
      const correctOptionId = (snapshot.answer?.correct_option_id || snapshot.answer?.correct_key || '').toUpperCase().trim();
      const marksPerQ = Number(snapshot.question_settings?.marks ?? 1.5);
      const negMarksPerQ = Number(snapshot.question_settings?.negative_marks ?? 0.0);

      let isCorrect: boolean | null = null;
      let marksObtained = 0.0;
      let isAnswered = false;

      if (!userChoice) {
        unansweredCount++;
        isAnswered = false;
        isCorrect = null;
      } else if (userChoice === 'E') {
        // TNPSC Option E: Answer Not Known
        isAnswered = true;
        isCorrect = null;
        marksObtained = 0.0;
        mistakeInserts.push({
          user_id: user.id,
          question_id: item.question_id,
          source_attempt_id: attemptId,
          reason: 'unanswered',
          repetition_level: 0,
          next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          incorrect_count: 1,
          is_resolved: false,
        });
      } else if (userChoice === correctOptionId) {
        isAnswered = true;
        isCorrect = true;
        correctCount++;
        marksObtained = marksPerQ;
        totalScore += marksPerQ;
      } else {
        isAnswered = true;
        isCorrect = false;
        wrongCount++;
        marksObtained = -negMarksPerQ;
        totalScore -= negMarksPerQ;

        // Push to Mistake Vault for spaced repetition review
        mistakeInserts.push({
          user_id: user.id,
          question_id: item.question_id,
          source_attempt_id: attemptId,
          reason: 'wrong_answer',
          repetition_level: 0,
          next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          incorrect_count: 1,
          is_resolved: false,
        });
      }

      itemUpdates.push({
        id: item.id,
        attempt_id: attemptId,
        question_id: item.question_id,
        selected_answer: userChoice ? { option_id: userChoice } : null,
        is_answered: isAnswered,
        is_correct: isCorrect,
        marks_obtained: marksObtained,
        updated_at: new Date().toISOString(),
      });
    });

    // 4. Batch update attempt items
    for (const update of itemUpdates) {
      await supabase
        .from('test_attempt_items')
        .update({
          selected_answer: update.selected_answer,
          is_answered: update.is_answered,
          is_correct: update.is_correct,
          marks_obtained: update.marks_obtained,
          updated_at: update.updated_at,
        })
        .eq('id', update.id);
    }

    // 5. Insert mistakes into Mistake Vault (ignore on conflict)
    if (mistakeInserts.length > 0) {
      await supabase
        .from('mistake_vault')
        .upsert(mistakeInserts, { onConflict: 'user_id,question_id' });
    }

    // 6. Complete the test attempt
    const totalQ = items.length;
    const accuracy = totalQ > 0 ? ((correctCount / totalQ) * 100).toFixed(2) : '0.00';
    const totalSeconds = (total_time_minutes || 180) * 60;

    const { error: completeError } = await supabase
      .from('test_attempts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        score: Math.max(0, totalScore),
        accuracy_percentage: parseFloat(accuracy),
        correct_count: correctCount,
        wrong_count: wrongCount,
        unanswered_count: unansweredCount,
        total_time_seconds: totalSeconds,
        updated_at: new Date().toISOString(),
      })
      .eq('id', attemptId);

    if (completeError) {
      return NextResponse.json({ error: completeError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      attempt_id: attemptId,
      summary: {
        score: Math.max(0, totalScore),
        accuracy: parseFloat(accuracy),
        correctCount,
        wrongCount,
        unansweredCount,
        totalQuestions: totalQ,
      },
    });
  } catch (err: any) {
    console.error('OMR sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

