import { describe, it, expect } from 'vitest';
import { computeScore, ExamSetupConfig, QuestionAttemptItem } from './scoring';

describe('Domain: Scoring Function (Section 8.2)', () => {
  const standardTNPSCSetup: ExamSetupConfig = {
    marksPerQuestionHalf: 3, // 1.5 marks
    negativeMarkHalf: 0,     // 0 negative marks
    status: 'needs_checking',
  };

  it('correctly calculates perfect score with unverified badge for unconfirmed exam setup', () => {
    const items: QuestionAttemptItem[] = [
      { questionId: 'q1', result: 'correct' },
      { questionId: 'q2', result: 'correct' },
    ];

    const result = computeScore(items, standardTNPSCSetup);

    expect(result.totalQuestions).toBe(2);
    expect(result.correctCount).toBe(2);
    expect(result.wrongCount).toBe(0);
    expect(result.blankCount).toBe(0);
    expect(result.scoreHalf).toBe(6); // 2 * 3 half marks
    expect(result.finalScore).toBe(3); // 3.0 marks
    expect(result.maxScore).toBe(3);
    expect(result.percentage).toBe(100);
    expect(result.isUnverified).toBe(true);
  });

  it('treats "not_known" as blank and gives 0 marks', () => {
    const items: QuestionAttemptItem[] = [
      { questionId: 'q1', result: 'correct' },
      { questionId: 'q2', result: 'not_known' },
      { questionId: 'q3', result: 'blank' },
    ];

    const result = computeScore(items, standardTNPSCSetup);

    expect(result.totalQuestions).toBe(3);
    expect(result.correctCount).toBe(1);
    expect(result.notKnownCount).toBe(1);
    expect(result.blankCount).toBe(2); // 1 blank + 1 not_known
    expect(result.finalScore).toBe(1.5);
    expect(result.maxScore).toBe(4.5);
    expect(result.percentage).toBe(33.33);
  });

  it('correctly marks isUnverified as false when status is confirmed', () => {
    const confirmedSetup: ExamSetupConfig = {
      marksPerQuestionHalf: 3,
      negativeMarkHalf: 0,
      status: 'confirmed',
    };

    const items: QuestionAttemptItem[] = [
      { questionId: 'q1', result: 'correct' },
    ];

    const result = computeScore(items, confirmedSetup);
    expect(result.isUnverified).toBe(false);
  });

  it('handles negative marks properly when configured and clamps score to 0', () => {
    const negativeSetup: ExamSetupConfig = {
      marksPerQuestionHalf: 2, // 1 mark
      negativeMarkHalf: 1,     // 0.5 negative mark
      status: 'confirmed',
    };

    const items: QuestionAttemptItem[] = [
      { questionId: 'q1', result: 'wrong' },
      { questionId: 'q2', result: 'wrong' },
    ];

    const result = computeScore(items, negativeSetup);
    expect(result.scoreHalf).toBe(0); // Clamped at 0
    expect(result.finalScore).toBe(0);
  });
});
