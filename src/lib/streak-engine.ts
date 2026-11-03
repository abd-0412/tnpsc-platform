// ========================================================================
// TNPSC PRACTICE PLATFORM - DAILY STREAKS & TARGETS ENGINE
// Computes IST-accurate daily study activity, streaks, and 365-day heatmap
// ========================================================================

export interface DayActivity {
  date: string; // 'YYYY-MM-DD'
  count: number; // Questions attempted
  correct: number;
  minutes: number;
  testsCount: number;
  level: 0 | 1 | 2 | 3 | 4; // Heatmap intensity
}

export interface MilestoneBadge {
  id: string;
  title_ta: string;
  title_en: string;
  description_ta: string;
  description_en: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 to 100
  unlocked_at?: string;
}

export interface DailyGoalPayload {
  currentStreak: number;
  longestStreak: number;
  streakStatus: 'active_today' | 'pending_today' | 'broken';
  today: {
    date: string;
    completedQuestions: number;
    targetQuestions: number;
    completedMinutes: number;
    targetMinutes: number;
    percentage: number;
    isCompleted: boolean;
    subjectBreakdown: {
      tamil: number;
      aptitude: number;
      generalStudies: number;
    };
  };
  heatmap: DayActivity[];
  weeklyTrend: {
    dayName: string;
    dayNameTa: string;
    date: string;
    count: number;
    target: number;
    isTargetMet: boolean;
  }[];
  milestones: MilestoneBadge[];
  totalQuestionsAllTime: number;
  totalStudyDaysAllTime: number;
}

/**
 * Returns YYYY-MM-DD formatted date string in Indian Standard Time (IST, UTC+05:30)
 */
export function getISTDateString(date: Date = new Date()): string {
  // IST is UTC + 5 hours 30 minutes
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 3600000 * 5.5);
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, '0');
  const dd = String(istDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculate consecutive daily streaks from a set of active dates (YYYY-MM-DD)
 */
export function calculateStreaks(
  activeDatesSet: Set<string>,
  todayStr: string
): { currentStreak: number; longestStreak: number; streakStatus: 'active_today' | 'pending_today' | 'broken' } {
  // Compute yesterday in IST
  const todayDate = new Date(todayStr + 'T00:00:00Z');
  const yesterdayDate = new Date(todayDate.getTime() - 86400000);
  const yyyy = yesterdayDate.getUTCFullYear();
  const mm = String(yesterdayDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(yesterdayDate.getUTCDate()).padStart(2, '0');
  const yesterdayStr = `${yyyy}-${mm}-${dd}`;

  const hasToday = activeDatesSet.has(todayStr);
  const hasYesterday = activeDatesSet.has(yesterdayStr);

  let streakStatus: 'active_today' | 'pending_today' | 'broken' = 'broken';
  if (hasToday) {
    streakStatus = 'active_today';
  } else if (hasYesterday) {
    streakStatus = 'pending_today';
  }

  // Calculate current streak backwards from today or yesterday
  let currentStreak = 0;
  let checkDate = new Date(hasToday ? todayDate : yesterdayDate);

  if (hasToday || hasYesterday) {
    while (true) {
      const cy = checkDate.getUTCFullYear();
      const cm = String(checkDate.getUTCMonth() + 1).padStart(2, '0');
      const cd = String(checkDate.getUTCDate()).padStart(2, '0');
      const cStr = `${cy}-${cm}-${cd}`;

      if (activeDatesSet.has(cStr)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all recorded dates
  const sortedDates = Array.from(activeDatesSet).sort();
  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const curDate = new Date(dStr + 'T00:00:00Z');
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diffMs = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = curDate;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return { currentStreak, longestStreak, streakStatus };
}

/**
 * Build 365-day calendar heatmap data array
 */
export function build365DayHeatmap(
  dateActivityMap: Map<string, { count: number; correct: number; minutes: number; testsCount: number }>,
  todayStr: string
): DayActivity[] {
  const result: DayActivity[] = [];
  const today = new Date(todayStr + 'T00:00:00Z');

  // Go back 364 days to build a complete 365-day grid
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const dStr = `${yyyy}-${mm}-${dd}`;

    const act = dateActivityMap.get(dStr) || { count: 0, correct: 0, minutes: 0, testsCount: 0 };

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (act.count >= 60) level = 4;
    else if (act.count >= 35) level = 3;
    else if (act.count >= 15) level = 2;
    else if (act.count > 0) level = 1;

    result.push({
      date: dStr,
      count: act.count,
      correct: act.correct,
      minutes: act.minutes,
      testsCount: act.testsCount,
      level,
    });
  }

  return result;
}

/**
 * Generate weekly 7-day trend (Monday - Sunday or past 7 days)
 */
export function buildWeeklyTrend(
  dateActivityMap: Map<string, { count: number }>,
  todayStr: string,
  targetQuestions: number
) {
  const trend = [];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayNamesTa = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

  const today = new Date(todayStr + 'T00:00:00Z');

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const dStr = `${yyyy}-${mm}-${dd}`;

    const count = dateActivityMap.get(dStr)?.count || 0;
    const dayIdx = d.getUTCDay();

    trend.push({
      dayName: dayNamesEn[dayIdx],
      dayNameTa: dayNamesTa[dayIdx],
      date: dStr,
      count,
      target: targetQuestions,
      isTargetMet: count >= targetQuestions,
    });
  }

  return trend;
}

/**
 * Evaluate and return milestone badges
 */
export function evaluateMilestones(
  currentStreak: number,
  longestStreak: number,
  totalQuestions: number,
  singleDayMax: number
): MilestoneBadge[] {
  return [
    {
      id: 'streak_3',
      title_ta: '3-நாள் தொடர் பயிற்சி',
      title_en: '3-Day Momentum',
      description_ta: 'தொடர்ந்து 3 நாட்கள் வினாக்களை பயிற்சி செய்துள்ளீர்கள்.',
      description_en: 'Maintained a study streak for 3 consecutive days.',
      icon: 'Flame',
      unlocked: longestStreak >= 3,
      progress: Math.min(100, Math.round((longestStreak / 3) * 100)),
    },
    {
      id: 'streak_7',
      title_ta: '1 வார உறுதி (7-Day Streak)',
      title_en: 'Iron Will (7-Day Streak)',
      description_ta: 'தொடர்ந்து 7 நாட்கள் இடைவிடாமல் பயிற்சி செய்துள்ளீர்கள்.',
      description_en: 'Completed a full 7-day study streak without missing a day.',
      icon: 'Zap',
      unlocked: longestStreak >= 7,
      progress: Math.min(100, Math.round((longestStreak / 7) * 100)),
    },
    {
      id: 'streak_15',
      title_ta: '15-நாள் சாதனையாளர்',
      title_en: 'Fortress of Discipline (15 Days)',
      description_ta: '15 நாட்கள் தொடர் பயிற்சிக்கான சிறப்பு விருது.',
      description_en: 'Achieved an outstanding 15 consecutive days study streak.',
      icon: 'ShieldCheck',
      unlocked: longestStreak >= 15,
      progress: Math.min(100, Math.round((longestStreak / 15) * 100)),
    },
    {
      id: 'streak_30',
      title_ta: '30-நாள் TNPSC மாஸ்டர்',
      title_en: 'TNPSC Legend (30 Days)',
      description_ta: 'ஒரு மாதம் முழுதும் இடைவிடாத தளராத முயற்சி.',
      description_en: 'Maintained unbroken consistency for an entire month.',
      icon: 'Crown',
      unlocked: longestStreak >= 30,
      progress: Math.min(100, Math.round((longestStreak / 30) * 100)),
    },
    {
      id: 'century_day',
      title_ta: 'செஞ்சுரி கிளப் (100+ வினாக்கள்)',
      title_en: 'Century Club (100+ in a Day)',
      description_ta: 'ஒரே நாளில் 100 வினாக்களுக்கு மேல் வெற்றிகரமாக பயிற்சி செய்துள்ளீர்கள்.',
      description_en: 'Solved more than 100 questions within a single day.',
      icon: 'Target',
      unlocked: singleDayMax >= 100,
      progress: Math.min(100, Math.round((singleDayMax / 100) * 100)),
    },
    {
      id: 'grand_500',
      title_ta: '500 வினாக்கள் மைல்கல்',
      title_en: '500 Questions Mastered',
      description_ta: 'தளத்தில் 500 வினாக்களுக்கு மேல் பயிற்சி செய்துள்ளீர்கள்.',
      description_en: 'Completed 500+ questions across mock tests and practice sets.',
      icon: 'Award',
      unlocked: totalQuestions >= 500,
      progress: Math.min(100, Math.round((totalQuestions / 500) * 100)),
    },
  ];
}

