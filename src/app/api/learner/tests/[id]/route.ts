import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { normalizeOptionId } from '@/lib/option-utils';

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

    // Fetch the attempt
    const { data: attempt, error: aError } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (aError || !attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // Fetch attempt items ordered by question_order
    const { data: items, error: iError } = await supabase
      .from('test_attempt_items')
      .select('*')
      .eq('attempt_id', id)
      .order('question_order', { ascending: true });

    if (iError) {
      return NextResponse.json({ error: iError.message }, { status: 500 });
    }

    // Fetch test template duration if applicable
    let durationMinutes = 60;
    if (attempt.test_template_id) {
      const { data: template } = await supabase
        .from('test_templates')
        .select('duration_minutes')
        .eq('id', attempt.test_template_id)
        .single();
      if (template?.duration_minutes) {
        durationMinutes = template.duration_minutes;
      }
    } else {
      durationMinutes = Math.max(15, Math.ceil((attempt.total_questions || 20) * 1.5));
    }

    // Anti-cheat protection: If test is still in progress, redact correct answers from the snapshot payload
    const isCompleted = attempt.status === 'completed';
    const sanitizedItems = items?.map((item) => {
      const snapshot = item.question_snapshot;
      if (!isCompleted) {
        const safeTexts = {
          ta: {
            question: snapshot.texts?.ta?.question,
            options: snapshot.texts?.ta?.options,
          },
          en: snapshot.texts?.en ? {
            question: snapshot.texts.en.question,
            options: snapshot.texts.en.options,
          } : undefined,
        };

        return {
          ...item,
          question_snapshot: {
            id: snapshot.id,
            kind: snapshot.kind,
            difficulty: snapshot.difficulty,
            texts: safeTexts,
            question_data: snapshot.question_data,
            source: snapshot.source,
          },
        };
      }
      return item;
    });

    return NextResponse.json({
      attempt: {
        ...attempt,
        duration_minutes: durationMinutes,
      },
      items: sanitizedItems || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Auto-save a question's response in real-time
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
    const { question_id, selected_answer, is_answered, is_marked_for_review, time_spent_seconds, elapsed_seconds } = body;

    if (!question_id) {
      return NextResponse.json({ error: 'question_id is required' }, { status: 400 });
    }

    const normalizedSelectedAnswer = selected_answer
      ? {
          ...selected_answer,
          option_id: normalizeOptionId(selected_answer.option_id),
        }
      : null;

    // Update the item
    const { error: itemError } = await supabase
      .from('test_attempt_items')
      .update({
        selected_answer: normalizedSelectedAnswer,
        is_answered: is_answered ?? false,
        is_marked_for_review: is_marked_for_review ?? false,
        time_spent_seconds: time_spent_seconds ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq('attempt_id', id)
      .eq('question_id', question_id)
      .eq('user_id', user.id);

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 500 });
    }

    // Update total elapsed time on the attempt
    if (elapsed_seconds !== undefined) {
      await supabase
        .from('test_attempts')
        .update({
          total_time_seconds: elapsed_seconds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Complete & Submit Examination
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

    const body = await request.json().catch(() => ({}));
    const totalTimeSeconds = body.total_time_seconds || 0;

    const itemTimesMap: Record<string, number> = {};
    if (Array.isArray(body.items)) {
      body.items.forEach((it: any) => {
        if (it.question_id && typeof it.time_spent_seconds === 'number') {
          itemTimesMap[it.question_id] = it.time_spent_seconds;
        }
      });
    }

    // Fetch the attempt and all its attempt items
    const { data: attempt } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const { data: items } = await supabase
      .from('test_attempt_items')
      .select('*')
      .eq('attempt_id', id);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in this attempt' }, { status: 400 });
    }

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let totalScore = 0;
    const mistakeInserts: any[] = [];

    // Evaluate each item using its question_snapshot
    const itemUpdates = items.map((item) => {
      const snapshot = item.question_snapshot;
      const correctOptionId = snapshot.answer?.correct_option_id;
      const marksPerQ = Number(snapshot.question_settings?.marks ?? 1.5);
      const negMarksPerQ = Number(snapshot.question_settings?.negative_marks ?? 0.0);

      let isCorrect: boolean | null = null;
      let marksObtained = 0.0;
      const timeSpent = itemTimesMap[item.question_id] ?? item.time_spent_seconds ?? 0;

      if (!item.is_answered || !item.selected_answer) {
        unansweredCount++;
        isCorrect = null;
        marksObtained = 0.0;
      } else {
        const userChoice = normalizeOptionId(item.selected_answer?.option_id || item.selected_answer);
        const correctChoice = normalizeOptionId(correctOptionId);

        if (userChoice === 'E') {
          // TNPSC Option E: Answer Not Known (0 marks, 0 penalty, captured for study)
          isCorrect = null;
          marksObtained = 0.0;
          mistakeInserts.push({
            user_id: user.id,
            question_id: item.question_id,
            source_attempt_id: id,
            reason: 'unanswered',
            repetition_level: 0,
            next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            incorrect_count: 1,
            is_resolved: false,
          });
        } else if (userChoice === correctChoice) {
          isCorrect = true;
          correctCount++;
          marksObtained = marksPerQ;
        } else {
          isCorrect = false;
          wrongCount++;
          marksObtained = -negMarksPerQ;

          // Push to Mistake Vault
          mistakeInserts.push({
            user_id: user.id,
            question_id: item.question_id,
            source_attempt_id: id,
            reason: 'wrong_answer',
            repetition_level: 0,
            next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            incorrect_count: 1,
            is_resolved: false,
          });
        }
      }

      totalScore += marksObtained;

      return {
        id: item.id,
        is_correct: isCorrect,
        marks_obtained: marksObtained,
        time_spent_seconds: timeSpent,
      };
    });

    // Update each test_attempt_item in database
    for (const u of itemUpdates) {
      await supabase
        .from('test_attempt_items')
        .update({
          is_correct: u.is_correct,
          marks_obtained: u.marks_obtained,
          time_spent_seconds: u.time_spent_seconds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', u.id);
    }

    // Upsert into Mistake Vault
    for (const m of mistakeInserts) {
      await supabase
        .from('mistake_vault')
        .upsert(m, { onConflict: 'user_id,question_id' });
    }

    const totalQuestions = items.length;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const finalScore = Math.max(0, totalScore);

    // Finalize test_attempts record
    const { data: updatedAttempt, error: finalizeError } = await supabase
      .from('test_attempts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_time_seconds: totalTimeSeconds || attempt.total_time_seconds,
        score: finalScore,
        accuracy_percentage: parseFloat(accuracy.toFixed(2)),
        correct_count: correctCount,
        wrong_count: wrongCount,
        unanswered_count: unansweredCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (finalizeError) {
      return NextResponse.json({ error: finalizeError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      attempt: updatedAttempt,
      summary: {
        score: finalScore,
        accuracy: parseFloat(accuracy.toFixed(2)),
        correctCount,
        wrongCount,
        unansweredCount,
        totalQuestions,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

