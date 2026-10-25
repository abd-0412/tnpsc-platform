/**
 * Active Time Tracking & Daily Streak Engine (Section 8.7 & 8.8)
 * Pure functions calculating daily goal achievements, rest day protections, and streaks.
 */

export interface DailyActivitySummary {
  date: string; // YYYY-MM-DD (IST)
  activeSeconds: number; // in-app active seconds
  manualMinutes: number; // external study (books, etc.)
  questionsAnswered: number;
}

export interface DayHabitResult {
  date: string;
  totalMinutes: number;
  questionsAnswered: number;
  goalMet: boolean;
  isRestDay: boolean;
  countsForStreak: boolean;
}

export interface StreakRecord {
  currentStreak: number;
  longestStreak: number;
  history: DayHabitResult[];
}

export const DAILY_GOAL_MINUTES = 60;
export const DAILY_GOAL_QUESTIONS = 20;
export const INACTIVITY_CUTOFF_SECONDS = 120;
export const MIN_SEGMENT_SECONDS = 10;
export const MAX_SEGMENT_SECONDS = 3 * 60 * 60; // 3 hours

/**
 * Sanitizes and normalizes an active time segment (Section 8.7).
 */
export function processTimeSegment(
  startedAtMs: number,
  endedAtMs: number,
  lastInputAtMs: number
): { valid: boolean; activeSeconds: number; flagged: boolean } {
  // If no input in the last 120s, cut segment at lastInputAtMs
  const effectiveEndMs = Math.min(endedAtMs, lastInputAtMs + INACTIVITY_CUTOFF_SECONDS * 1000);
  const rawSeconds = Math.max(0, Math.floor((effectiveEndMs - startedAtMs) / 1000));

  // Segments under 10 seconds are dropped
  if (rawSeconds < MIN_SEGMENT_SECONDS) {
    return { valid: false, activeSeconds: 0, flagged: false };
  }

  // Segments over 3 hours are cut and flagged
  if (rawSeconds > MAX_SEGMENT_SECONDS) {
    return { valid: true, activeSeconds: MAX_SEGMENT_SECONDS, flagged: true };
  }

  return { valid: true, activeSeconds: rawSeconds, flagged: false };
}

/**
 * Computes whether a single day met the daily habit goal (Section 8.8).
 * A day counts if EITHER:
 * - 60 active minutes (in-app + manual) is reached
 * - OR 20 questions are answered
 * - OR it is a valid Rest Day (max 1 in rolling 7 days).
 */
export function evaluateDayHabit(
  activity: DailyActivitySummary,
  isDesignatedRestDay: boolean,
  goalMinutes: number = DAILY_GOAL_MINUTES,
  goalQuestions: number = DAILY_GOAL_QUESTIONS
): DayHabitResult {
  const inAppMinutes = Math.floor(activity.activeSeconds / 60);
  const totalMinutes = inAppMinutes + activity.manualMinutes;

  const goalMet = totalMinutes >= goalMinutes || activity.questionsAnswered >= goalQuestions;
  const countsForStreak = goalMet || isDesignatedRestDay;

  return {
    date: activity.date,
    totalMinutes,
    questionsAnswered: activity.questionsAnswered,
    goalMet,
    isRestDay: isDesignatedRestDay,
    countsForStreak,
  };
}

/**
 * Calculates current and longest streak from chronological daily summaries (Section 8.8).
 * Enforces:
 * - 1 rest day in any 7-day rolling window.
 * - Missing a day resets current streak to 0, preserves longest.
 */
export function calculateStreak(
  days: { activity: DailyActivitySummary; wantsRestDay?: boolean }[],
  goalMinutes: number = DAILY_GOAL_MINUTES,
  goalQuestions: number = DAILY_GOAL_QUESTIONS
): StreakRecord {
  // Sort chronologically ascending
  const sorted = [...days].sort((a, b) => a.activity.date.localeCompare(b.activity.date));

  let currentStreak = 0;
  let longestStreak = 0;
  const history: DayHabitResult[] = [];
  const restDayDates: string[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const { activity, wantsRestDay } = sorted[i];

    // Check if rest day is allowable (max 1 in any rolling 7-day window)
    let isAllowableRestDay = false;
    if (wantsRestDay) {
      const sevenDaysAgo = addDays(activity.date, -7);
      const recentRestDays = restDayDates.filter(d => d >= sevenDaysAgo && d < activity.date);
      if (recentRestDays.length < 1) {
        isAllowableRestDay = true;
        restDayDates.push(activity.date);
      }
    }

    const dayResult = evaluateDayHabit(
      activity,
      isAllowableRestDay,
      goalMinutes,
      goalQuestions
    );

    history.push(dayResult);

    if (dayResult.countsForStreak) {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      currentStreak = 0; // Reset streak on missed day
    }
  }

  return {
    currentStreak,
    longestStreak,
    history,
  };
}

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}
