import { describe, it, expect } from 'vitest';
import { getAccuracySignal, computeAccuracyMetrics, QuestionSeenRecord } from './accuracy';

describe('Domain: Honest Accuracy & Signal Metrics (Section 8.5 & 18.1)', () => {
  it('returns "not_enough_data" when sample size is below 10', () => {
    const signal9 = getAccuracySignal(9, 80);
    expect(signal9.signal).toBe('not_enough_data');
    expect(signal9.labelEn).toBe('Not enough data');

    const signal10 = getAccuracySignal(10, 80);
    expect(signal10.signal).toBe('early_signal');
  });

  it('labels sample size between 10 and 29 as "early_signal"', () => {
    const signal29 = getAccuracySignal(29, 90);
    expect(signal29.signal).toBe('early_signal');

    const signal30 = getAccuracySignal(30, 90);
    expect(signal30.signal).toBe('strong');
  });

  it('correctly categorizes confidence bands for sample size >= 30', () => {
    // Edge at 50%
    expect(getAccuracySignal(30, 49.9).signal).toBe('needs_work');
    expect(getAccuracySignal(30, 50.0).signal).toBe('building');

    // Edge at 75%
    expect(getAccuracySignal(30, 74.9).signal).toBe('building');
    expect(getAccuracySignal(30, 75.0).signal).toBe('strong');
  });

  it('strictly separates new question accuracy from repeated question accuracy', () => {
    const records: QuestionSeenRecord[] = [
      // q1: answered wrong on 1st try, then answered correctly twice on repeats (seen 3 times, correct 2)
      {
        questionId: 'q1',
        firstSeenAt: '2026-10-01',
        firstResult: 'wrong',
        timesSeen: 3,
        correctCount: 2,
        lastResult: 'correct',
      },
      // q2: answered correct on 1st try, seen only once
      {
        questionId: 'q2',
        firstSeenAt: '2026-10-02',
        firstResult: 'correct',
        timesSeen: 1,
        correctCount: 1,
        lastResult: 'correct',
      },
    ];

    const result = computeAccuracyMetrics(records);

    // New accuracy: 2 distinct questions (q1 wrong, q2 correct) = 1/2 = 50%
    expect(result.newAccuracy.sampleSize).toBe(2);
    expect(result.newAccuracy.correctCount).toBe(1);
    expect(result.newAccuracy.percentage).toBe(50);
    expect(result.newAccuracy.signal).toBe('not_enough_data'); // n < 10

    // Repeated accuracy: q1 had 2 repeat attempts, both correct = 2/2 = 100%
    expect(result.repeatedAccuracy.sampleSize).toBe(2);
    expect(result.repeatedAccuracy.correctCount).toBe(2);
    expect(result.repeatedAccuracy.percentage).toBe(100);
  });
});
