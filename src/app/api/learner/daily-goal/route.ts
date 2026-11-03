import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getISTDateString,
  calculateStreaks,
  build365DayHeatmap,
  buildWeeklyTrend,
  evaluateMilestones,
  DailyGoalPayload
} from '@/lib/streak-engine';

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

    const todayStr = getISTDateString();

    // 1. Fetch completed test attempts for the user
    const { data: attempts, error: aError } = await supabase
      .from('test_attempts')
      .select('id, started_at, completed_at, total_questions, correct_count, total_time_seconds, title_ta, title_en')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (aError) {
      return NextResponse.json({ error: aError.message }, { status: 500 });
    }

    // 2. Aggregate activity by IST date
    const dateActivityMap = new Map<
      string,
      { count: number; correct: number; minutes: number; testsCount: number }
    >();
    const activeDatesSet = new Set<string>();

    let totalQuestionsAllTime = 0;
    let singleDayMax = 0;

    let todayCompletedQuestions = 0;
    let todayCompletedMinutes = 0;
    let todayTamil = 0;
    let todayAptitude = 0;
    let todayGS = 0;

    (attempts || []).forEach((att) => {
      const dateStr = getISTDateString(new Date(att.completed_at || att.started_at));
      const qCount = att.total_questions || 0;
      const cCount = att.correct_count || 0;
      const mins = Math.max(1, Math.round((att.total_time_seconds || 0) / 60));

      totalQuestionsAllTime += qCount;
      activeDatesSet.add(dateStr);

      const existing = dateActivityMap.get(dateStr) || { count: 0, correct: 0, minutes: 0, testsCount: 0 };
      existing.count += qCount;
      existing.correct += cCount;
      existing.minutes += mins;
      existing.testsCount += 1;
      dateActivityMap.set(dateStr, existing);

      if (existing.count > singleDayMax) {
        singleDayMax = existing.count;
      }

      // Check if this attempt was today
      if (dateStr === todayStr) {
        todayCompletedQuestions += qCount;
        todayCompletedMinutes += mins;

        const title = (att.title_ta || att.title_en || '').toLowerCase();
        if (title.includes('தமிழ்') || title.includes('tamil')) {
          todayTamil += qCount;
        } else if (title.includes('கணிதம்') || title.includes('திறனறிவு') || title.includes('aptitude') || title.includes('math')) {
          todayAptitude += qCount;
        } else {
          todayGS += qCount;
        }
      }
    });

    // Default target: 50 questions / 45 minutes
    const targetQuestions = 50;
    const targetMinutes = 45;

    // 3. Compute Streak
    const { currentStreak, longestStreak, streakStatus } = calculateStreaks(activeDatesSet, todayStr);

    // 4. Build 365-Day Activity Heatmap
    const heatmap = build365DayHeatmap(dateActivityMap, todayStr);

    // 5. Build Weekly Trend
    const weeklyTrend = buildWeeklyTrend(dateActivityMap, todayStr, targetQuestions);

    // 6. Milestone Badges
    const milestones = evaluateMilestones(currentStreak, longestStreak, totalQuestionsAllTime, singleDayMax);

    const percentage = Math.min(100, Math.round((todayCompletedQuestions / targetQuestions) * 100));

    const payload: DailyGoalPayload = {
      currentStreak,
      longestStreak,
      streakStatus,
      today: {
        date: todayStr,
        completedQuestions: todayCompletedQuestions,
        targetQuestions,
        completedMinutes: todayCompletedMinutes,
        targetMinutes,
        percentage,
        isCompleted: todayCompletedQuestions >= targetQuestions,
        subjectBreakdown: {
          tamil: todayTamil,
          aptitude: todayAptitude,
          generalStudies: todayGS,
        },
      },
      heatmap,
      weeklyTrend,
      milestones,
      totalQuestionsAllTime,
      totalStudyDaysAllTime: activeDatesSet.size,
    };

    return NextResponse.json(payload);
  } catch (err: any) {
    console.error('Daily goal API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

