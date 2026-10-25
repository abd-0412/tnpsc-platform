/**
 * Pure Scoring Domain Functions (Section 8.2)
 * Pure TypeScript logic with zero database and zero UI dependencies.
 */

export interface ExamSetupConfig {
  marksPerQuestionHalf: number; // e.g., 3 means 1.5 marks (stored as half-marks / integer)
  negativeMarkHalf: number;     // e.g., 0 means no negative marking
  status: 'confirmed' | 'needs_checking';
}

export type QuestionResult = 'correct' | 'wrong' | 'blank' | 'not_known';

export interface QuestionAttemptItem {
  questionId: string;
  result: QuestionResult;
}

export interface ScoreSummary {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  notKnownCount: number;
  scoreHalf: number;
  maxScoreHalf: number;
  finalScore: number;
  maxScore: number;
  percentage: number;
  isUnverified: boolean;
}

/**
 * Computes exam score purely from attempt items and the copied exam setup.
 */
export function computeScore(
  items: QuestionAttemptItem[],
  setup: ExamSetupConfig
): ScoreSummary {
  let correctCount = 0;
  let wrongCount = 0;
  let blankCount = 0;
  let notKnownCount = 0;

  for (const item of items) {
    if (item.result === 'correct') {
      correctCount++;
    } else if (item.result === 'wrong') {
      wrongCount++;
    } else if (item.result === 'not_known') {
      notKnownCount++;
      blankCount++; // Treated as blank (scores 0) per Section 6.3 & 8.2
    } else {
      blankCount++;
    }
  }

  const scoreHalf = Math.max(
    0,
    correctCount * setup.marksPerQuestionHalf - wrongCount * setup.negativeMarkHalf
  );
  const maxScoreHalf = items.length * setup.marksPerQuestionHalf;

  const finalScore = scoreHalf / 2;
  const maxScore = maxScoreHalf / 2;
  const percentage = maxScore > 0 ? (finalScore / maxScore) * 100 : 0;

  return {
    totalQuestions: items.length,
    correctCount,
    wrongCount,
    blankCount,
    notKnownCount,
    scoreHalf,
    maxScoreHalf,
    finalScore,
    maxScore,
    percentage: Math.round(percentage * 100) / 100,
    isUnverified: setup.status === 'needs_checking',
  };
}
