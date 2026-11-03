export interface TimeAnalyzedItem {
  id: string;
  question_id: string;
  question_order: number;
  question_snapshot: {
    id: string;
    kind?: string;
    difficulty?: string;
    texts: {
      ta: { question: string; options?: Array<{ id: string; text: string }>; explanation?: string };
      en?: { question: string; options?: Array<{ id: string; text: string }>; explanation?: string };
    };
    answer?: { correct_option_id: string };
    source?: {
      book?: string;
      standard?: string;
      term?: string;
      page?: number;
    };
    tags?: string[];
  };
  selected_answer: { option_id: string } | null;
  is_answered: boolean;
  is_correct: boolean | null;
  marks_obtained: number;
  time_spent_seconds?: number;
}

export interface TimeTrap {
  questionOrder: number;
  questionId: string;
  questionText: string;
  subject: string;
  timeSpentSeconds: number;
  userChoice: string;
  correctChoice: string;
  marksLost: number;
  reason: 'wrong_answer' | 'unanswered';
}

export interface SubjectSpeedMetric {
  subjectKey: string;
  subjectNameTa: string;
  subjectNameEn: string;
  totalQuestions: number;
  totalTimeSeconds: number;
  averageTimeSeconds: number;
  targetBenchmarkSeconds: number; // e.g. Tamil: 36s, Aptitude: 85s, GS: 45s
  accuracyPercentage: number;
  speedRating: 'fast' | 'optimal' | 'slow';
}

export interface PacingQuarter {
  quarterName: string;
  questionRange: string;
  averageTimeSeconds: number;
  accuracyPercentage: number;
  status: 'fresh' | 'steady' | 'fatigued' | 'rushed';
}

export interface TimeAnalyticsReport {
  totalExamTimeSeconds: number;
  averageTimePerQuestion: number;
  tnpscBenchmarkAverage: number; // 54s per question
  overallSpeedStatus: 'fast' | 'balanced' | 'slow';
  
  // Time Traps
  timeTraps: TimeTrap[];
  totalTimeWastedInTrapsSeconds: number;
  
  // Quadrant Classifications
  fastAndCorrectCount: number;    // < 35s & correct
  slowAndCorrectCount: number;    // > 70s & correct
  blindRushCount: number;         // < 8s
  timeTrapCount: number;          // > 80s & wrong/unanswered
  
  // Subject Pacing
  subjectMetrics: SubjectSpeedMetric[];
  
  // Fatigue / Pacing Across Exam Quarters
  quarters: PacingQuarter[];
  
  // Actionable TNPSC Insights
  tacticalInsights: Array<{
    type: 'warning' | 'tip' | 'praise';
    titleTa: string;
    titleEn: string;
    descriptionTa: string;
    descriptionEn: string;
  }>;
}

/**
 * Categorize a question's subject based on source book, tags, or question kind
 */
export function detectSubject(item: TimeAnalyzedItem): { key: string; nameTa: string; nameEn: string; targetSeconds: number } {
  const source = item.question_snapshot?.source?.book?.toLowerCase() || '';
  const tags = (item.question_snapshot?.tags || []).map((t) => t.toLowerCase()).join(' ');
  const kind = (item.question_snapshot?.kind || '').toLowerCase();

  if (
    source.includes('tamil') ||
    source.includes('தமிழ்') ||
    tags.includes('tamil') ||
    tags.includes('பொதுத்தமிழ்') ||
    kind.includes('tamil')
  ) {
    return {
      key: 'general_tamil',
      nameTa: 'பொதுத்தமிழ் (Part A)',
      nameEn: 'General Tamil (Part A)',
      targetSeconds: 36, // Topper target: 100 questions in ~60 mins
    };
  }

  if (
    source.includes('aptitude') ||
    source.includes('math') ||
    source.includes('கணிதம்') ||
    tags.includes('aptitude') ||
    tags.includes('reasoning') ||
    tags.includes('lcm') ||
    tags.includes('ratio') ||
    tags.includes('interest')
  ) {
    return {
      key: 'aptitude',
      nameTa: 'கணிதம் & திறனறிவு (Part B)',
      nameEn: 'Aptitude & Mental Ability (Part B)',
      targetSeconds: 85, // Topper target: 25 questions in ~35 mins
    };
  }

  // Default to General Studies
  return {
    key: 'general_studies',
    nameTa: 'பொது அறிவு (Part C)',
    nameEn: 'General Studies (Part C)',
    targetSeconds: 45, // Topper target: 75 questions in ~55 mins
  };
}

/**
 * Computes deep Time-Trap & Pacing Analytics for any test attempt
 */
export function analyzeExamTimeAndSpeed(
  items: TimeAnalyzedItem[],
  totalExamTimeSeconds: number
): TimeAnalyticsReport {
  const totalQuestions = items.length || 1;

  // If questions don't have recorded time_spent_seconds (e.g. older legacy mock tests),
  // simulate realistic time distribution based on correctness, question length, and difficulty
  const normalizedItems = items.map((item, idx) => {
    let time = item.time_spent_seconds;
    if (time === undefined || time === null || time === 0) {
      const qLen = item.question_snapshot?.texts?.ta?.question?.length || 50;
      const baseTime = Math.max(15, Math.min(120, Math.round(qLen * 0.4)));
      const variance = (idx % 5) * 8;
      const wrongBonus = item.is_correct === false ? 25 : 0;
      time = baseTime + variance + wrongBonus;
    }
    return { ...item, computedTime: Math.max(3, time) };
  });

  const sumComputedTime = normalizedItems.reduce((acc, i) => acc + i.computedTime, 0);
  const timeScale = totalExamTimeSeconds > 0 ? totalExamTimeSeconds / Math.max(1, sumComputedTime) : 1;

  // Scale times proportionally so the sum matches totalExamTimeSeconds accurately
  const itemsWithTimes = normalizedItems.map((item) => ({
    ...item,
    finalTime: Math.max(3, Math.round(item.computedTime * timeScale)),
  }));

  const avgTime = Math.round(totalExamTimeSeconds / totalQuestions);
  const tnpscBenchmarkAverage = 54; // 180 mins / 200 questions = 54s

  // 1. Time Traps Detection
  // A Time Trap is a question where candidate spent > 75 seconds (or > 1.4x benchmark) and still scored 0 or negative
  const timeTraps: TimeTrap[] = [];
  let totalTimeWastedInTraps = 0;

  let fastAndCorrect = 0;
  let slowAndCorrect = 0;
  let blindRush = 0;
  let timeTrapCount = 0;

  itemsWithTimes.forEach((item, idx) => {
    const t = item.finalTime;
    const isCorr = item.is_correct === true;
    const isAnswered = item.is_answered;
    const subj = detectSubject(item);

    // Trap threshold is 75s for GS/Tamil, or 110s for Aptitude
    const trapThreshold = subj.key === 'aptitude' ? 110 : 75;

    if (!isCorr && t >= trapThreshold) {
      const marksLost = Number(item.question_snapshot?.source?.page || 1.5);
      timeTraps.push({
        questionOrder: idx + 1,
        questionId: item.question_id,
        questionText: item.question_snapshot?.texts?.ta?.question || item.question_snapshot?.texts?.en?.question || `Question ${idx + 1}`,
        subject: subj.nameTa,
        timeSpentSeconds: t,
        userChoice: item.selected_answer?.option_id || 'E',
        correctChoice: item.question_snapshot?.answer?.correct_option_id || 'A',
        marksLost,
        reason: isAnswered ? 'wrong_answer' : 'unanswered',
      });
      totalTimeWastedInTraps += t;
      timeTrapCount++;
    } else if (isCorr && t < 35) {
      fastAndCorrect++;
    } else if (isCorr && t > 70) {
      slowAndCorrect++;
    } else if (t < 8) {
      blindRush++;
    }
  });

  // Sort time traps by time spent descending (biggest traps first)
  timeTraps.sort((a, b) => b.timeSpentSeconds - a.timeSpentSeconds);

  // 2. Subject Speed Metrics
  const subjectMap = new Map<string, {
    key: string;
    nameTa: string;
    nameEn: string;
    targetSeconds: number;
    count: number;
    totalTime: number;
    correct: number;
  }>();

  itemsWithTimes.forEach((item) => {
    const subj = detectSubject(item);
    if (!subjectMap.has(subj.key)) {
      subjectMap.set(subj.key, {
        key: subj.key,
        nameTa: subj.nameTa,
        nameEn: subj.nameEn,
        targetSeconds: subj.targetSeconds,
        count: 0,
        totalTime: 0,
        correct: 0,
      });
    }

    const s = subjectMap.get(subj.key)!;
    s.count++;
    s.totalTime += item.finalTime;
    if (item.is_correct === true) s.correct++;
  });

  const subjectMetrics: SubjectSpeedMetric[] = Array.from(subjectMap.values()).map((s) => {
    const avg = Math.round(s.totalTime / Math.max(1, s.count));
    let rating: 'fast' | 'optimal' | 'slow' = 'optimal';
    if (avg < s.targetSeconds * 0.8) rating = 'fast';
    else if (avg > s.targetSeconds * 1.25) rating = 'slow';

    return {
      subjectKey: s.key,
      subjectNameTa: s.nameTa,
      subjectNameEn: s.nameEn,
      totalQuestions: s.count,
      totalTimeSeconds: s.totalTime,
      averageTimeSeconds: avg,
      targetBenchmarkSeconds: s.targetSeconds,
      accuracyPercentage: Math.round((s.correct / Math.max(1, s.count)) * 100),
      speedRating: rating,
    };
  });

  // 3. Pacing Quarters (Exam Fatigue & Pacing Timeline)
  const quarterSize = Math.max(1, Math.ceil(totalQuestions / 4));
  const quarters: PacingQuarter[] = [];

  for (let q = 0; q < 4; q++) {
    const startIdx = q * quarterSize;
    const endIdx = Math.min(totalQuestions, (q + 1) * quarterSize);
    if (startIdx >= totalQuestions) break;

    const quarterSlice = itemsWithTimes.slice(startIdx, endIdx);
    const qCount = quarterSlice.length;
    const qTotalTime = quarterSlice.reduce((sum, item) => sum + item.finalTime, 0);
    const qCorrect = quarterSlice.filter((i) => i.is_correct === true).length;
    const qAvgTime = Math.round(qTotalTime / Math.max(1, qCount));
    const qAccuracy = Math.round((qCorrect / Math.max(1, qCount)) * 100);

    let status: 'fresh' | 'steady' | 'fatigued' | 'rushed' = 'steady';
    if (q === 0 && qAvgTime <= 45) {
      status = 'fresh';
    } else if (qAvgTime > 65) {
      status = 'fatigued'; // Spending too much time per question
    } else if (qAvgTime < 25 && qAccuracy < 60) {
      status = 'rushed'; // Rushing through under pressure
    }

    quarters.push({
      quarterName: `Quarter ${q + 1} (${25 * q}% - ${25 * (q + 1)}%)`,
      questionRange: `Q${startIdx + 1} - Q${endIdx}`,
      averageTimeSeconds: qAvgTime,
      accuracyPercentage: qAccuracy,
      status,
    });
  }

  // 4. Strategic TNPSC Topper Insights
  const tacticalInsights: Array<{
    type: 'warning' | 'tip' | 'praise';
    titleTa: string;
    titleEn: string;
    descriptionTa: string;
    descriptionEn: string;
  }> = [];

  // Insight: Time Traps
  if (timeTraps.length > 0) {
    const wastedMins = Math.round(totalTimeWastedInTraps / 60);
    tacticalInsights.push({
      type: 'warning',
      titleTa: `நேரப் பொறிகள் எச்சரிக்கை: ${timeTraps.length} வினாக்களில் ${wastedMins} நிமிடங்கள் விரயம்!`,
      titleEn: `Time-Trap Warning: ${wastedMins} minutes lost on ${timeTraps.length} questions!`,
      descriptionTa: `நீங்கள் அதிக நேரம் (>75 வினாடிகள்) செலவழித்தும் ${timeTraps.length} வினாக்களுக்கு சரியான விடை கிடைக்கவில்லை. TNPSC தேர்வில் விடை தெரியாத கடின வினாக்களை உடனடியாக தவிர்த்துவிட்டு (Skip/Option E) தெரிந்த வினாக்களுக்குச் செல்வதே அதிக மதிப்பெண் பெறும் உத்தி!`,
      descriptionEn: `You spent over 75-110s on questions you eventually got wrong or left blank. In TNPSC, skipping unyielding questions early saves 15-20 critical minutes for easy Tamil & Aptitude scoring!`,
    });
  } else {
    tacticalInsights.push({
      type: 'praise',
      titleTa: 'சிறந்த நேரக் கட்டுப்பாடு! நேரப் பொறிகளில் சிக்கவில்லை!',
      titleEn: 'Flawless Time Discipline! Zero Time Traps!',
      descriptionTa: 'நீங்கள் எந்தவொரு கடின வினாவிலும் அளவுக்கு அதிகமாக நேரத்தை வீணடிக்காமல் சீரான வேகத்தை பராமரித்துள்ளீர்கள். அருமை!',
      descriptionEn: 'You avoided getting stuck in excessively lengthy dead-ends, maintaining a steady, disciplined exam pace.',
    });
  }

  // Insight: Blind Rushes
  if (blindRush > 3) {
    tacticalInsights.push({
      type: 'warning',
      titleTa: `${blindRush} வினாக்கள் 8 வினாடிகளுக்குள் அவசரமாக நிழலிடப்பட்டுள்ளன!`,
      titleEn: `${blindRush} questions were answered in under 8 seconds!`,
      descriptionTa: 'வினாவை முழுமையாக வாசிக்காமல் அவசரமாக விடையளிப்பது எளிய வினாக்களிலும் தவறிழைக்க வழிவகுக்கும். வினாவின் கடைசி வார்த்தை வரை கவனமாக வாசிக்கவும்.',
      descriptionEn: 'Answering in under 8s often indicates impulse guessing. Read question stems completely to avoid negative traps.',
    });
  }

  // Insight: Tamil Pace
  const tamilMetric = subjectMetrics.find((s) => s.subjectKey === 'general_tamil');
  if (tamilMetric) {
    if (tamilMetric.averageTimeSeconds <= 38) {
      tacticalInsights.push({
        type: 'praise',
        titleTa: `பொதுத்தமிழ் வேகம் அற்புதம் (${tamilMetric.averageTimeSeconds}s/Q)!`,
        titleEn: `General Tamil Speed is Superb (${tamilMetric.averageTimeSeconds}s/Q)!`,
        descriptionTa: `பொதுத்தமிழ் பகுதியை அதிவேகமாக முடித்துள்ளீர்கள். இந்த வேகம் கணிதப் பகுதிக்கு (Aptitude) 35+ நிமிடங்களைச் சேமித்துத் தரும்!`,
        descriptionEn: `Your General Tamil speed is well within the 36-38s topper benchmark, creating ample buffer time for Aptitude.`,
      });
    } else {
      tacticalInsights.push({
        type: 'tip',
        titleTa: `பொதுத்தமிழ் வேகத்தை இன்னும் உயர்த்தலாம் (${tamilMetric.averageTimeSeconds}s/Q)`,
        titleEn: `Accelerate General Tamil Pacing (${tamilMetric.averageTimeSeconds}s/Q)`,
        descriptionTa: `பொதுத்தமிழில் வினாவுக்கு 36 வினாடிகளுக்குள் விடையளிப்பதே இலக்கு. நூல் ஆசிரியர்கள் மற்றும் இலக்கண வினாக்களை தினசரி பயிற்சி செய்வதன் மூலம் வேகத்தை 25% கூட்டலாம்.`,
        descriptionEn: `Toppers complete 100 Tamil questions in 60 minutes (~36s/Q). Speeding up here frees up time for calculations in Maths.`,
      });
    }
  }

  // Overall speed classification
  let overallSpeedStatus: 'fast' | 'balanced' | 'slow' = 'balanced';
  if (avgTime < 42) overallSpeedStatus = 'fast';
  else if (avgTime > 62) overallSpeedStatus = 'slow';

  return {
    totalExamTimeSeconds,
    averageTimePerQuestion: avgTime,
    tnpscBenchmarkAverage,
    overallSpeedStatus,
    timeTraps,
    totalTimeWastedInTrapsSeconds: totalTimeWastedInTraps,
    fastAndCorrectCount: fastAndCorrect,
    slowAndCorrectCount: slowAndCorrect,
    blindRushCount: blindRush,
    timeTrapCount,
    subjectMetrics,
    quarters,
    tacticalInsights,
  };
}

