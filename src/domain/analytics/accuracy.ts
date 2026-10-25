/**
 * Pure Accuracy & Honest Metrics Calculation (Section 8.5 & 18.1)
 * Separates first-seen accuracy from repeated accuracy with strict sample size bands.
 */

export interface QuestionSeenRecord {
  questionId: string;
  firstSeenAt: string;
  firstResult: 'correct' | 'wrong' | 'blank' | 'not_known';
  timesSeen: number;
  correctCount: number;
  lastResult: 'correct' | 'wrong' | 'blank' | 'not_known';
}

export type AccuracySignal = 
  | 'not_enough_data' 
  | 'early_signal' 
  | 'needs_work' 
  | 'building' 
  | 'strong';

export interface AccuracyMetric {
  sampleSize: number;
  correctCount: number;
  percentage: number;
  signal: AccuracySignal;
  labelEn: string;
  labelTa: string;
}

export interface UnitAccuracyReport {
  unitId: string;
  newAccuracy: AccuracyMetric;
  repeatedAccuracy: AccuracyMetric;
}

/**
 * Categorizes an accuracy percentage based on Section 8.5 sample-size rules.
 */
export function getAccuracySignal(sampleSize: number, percentage: number): {
  signal: AccuracySignal;
  labelEn: string;
  labelTa: string;
} {
  // Fewer than 10 distinct new questions
  if (sampleSize < 10) {
    return {
      signal: 'not_enough_data',
      labelEn: 'Not enough data',
      labelTa: 'போதுமான தகவல்கள் இல்லை',
    };
  }

  // 10 to 29 questions: early signal
  if (sampleSize <= 29) {
    return {
      signal: 'early_signal',
      labelEn: 'Early signal',
      labelTa: 'தொடக்கக் குறிப்பு',
    };
  }

  // 30 or more questions: full confidence bands
  if (percentage < 50) {
    return {
      signal: 'needs_work',
      labelEn: 'Needs work',
      labelTa: 'முன்னேற்றம் தேவை',
    };
  }

  if (percentage < 75) {
    return {
      signal: 'building',
      labelEn: 'Building',
      labelTa: 'வளர்ந்து வருகிறது',
    };
  }

  return {
    signal: 'strong',
    labelEn: 'Strong',
    labelTa: 'வலுவானது',
  };
}

/**
 * Computes both new and repeated accuracy from seen records.
 */
export function computeAccuracyMetrics(records: QuestionSeenRecord[]): {
  newAccuracy: AccuracyMetric;
  repeatedAccuracy: AccuracyMetric;
} {
  // 1. New Question Accuracy (First attempt ever)
  const newSample = records.length;
  let newCorrect = 0;
  for (const r of records) {
    if (r.firstResult === 'correct') {
      newCorrect++;
    }
  }
  const newPct = newSample > 0 ? (newCorrect / newSample) * 100 : 0;
  const newSignalInfo = getAccuracySignal(newSample, newPct);

  const newAccuracy: AccuracyMetric = {
    sampleSize: newSample,
    correctCount: newCorrect,
    percentage: Math.round(newPct * 10) / 10,
    ...newSignalInfo,
  };

  // 2. Repeated Question Accuracy (Later attempts beyond the first)
  let repeatedSample = 0;
  let repeatedCorrect = 0;

  for (const r of records) {
    if (r.timesSeen > 1) {
      const laterAttempts = r.timesSeen - 1;
      const laterCorrect = r.firstResult === 'correct' ? r.correctCount - 1 : r.correctCount;
      repeatedSample += laterAttempts;
      repeatedCorrect += laterCorrect;
    }
  }

  const repeatedPct = repeatedSample > 0 ? (repeatedCorrect / repeatedSample) * 100 : 0;
  const repeatedSignalInfo = getAccuracySignal(repeatedSample, repeatedPct);

  const repeatedAccuracy: AccuracyMetric = {
    sampleSize: repeatedSample,
    correctCount: repeatedCorrect,
    percentage: Math.round(repeatedPct * 10) / 10,
    ...repeatedSignalInfo,
  };

  return {
    newAccuracy,
    repeatedAccuracy,
  };
}
