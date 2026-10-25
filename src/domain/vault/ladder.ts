/**
 * Mistake Vault & Review Ladder Engine (Section 8.6)
 * Pure TypeScript state machine implementing the 5-stage spaced repetition ladder.
 */

export type VaultStage = 0 | 1 | 2 | 3 | 4;
export type VaultStatus = 'learning' | 'consolidating' | 'retained';
export type VaultReason = 'wrong' | 'blank' | 'not_known' | 'hard';
export type VaultAnswerResult = 'correct' | 'wrong' | 'blank' | 'not_known';

export interface VaultItemState {
  questionId: string;
  stage: VaultStage;
  status: VaultStatus;
  mistakes: number;
  nextDue: string; // YYYY-MM-DD (IST)
  reason: VaultReason;
  hard: boolean;
  retainedAt?: string; // ISO date string when question achieved retention
  version: number;
}

export const LADDER_INTERVALS: Record<VaultStage, number> = {
  0: 1,  // stage 0 -> next due in 1 day
  1: 3,  // stage 1 -> next due in 3 days
  2: 7,  // stage 2 -> next due in 7 days
  3: 14, // stage 3 -> next due in 14 days
  4: 30, // stage 4 -> next due in 30 days
};

export const RETAINED_CHECK_INTERVAL = 60; // 60 days check after retained

export function getStatusForStage(stage: VaultStage, isRetained: boolean): VaultStatus {
  if (isRetained) return 'retained';
  if (stage <= 2) return 'learning';
  return 'consolidating';
}

/**
 * Adds N days to a YYYY-MM-DD date string deterministically in UTC/IST.
 */
export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Initializes a new vault record when a question is failed or marked hard.
 */
export function createInitialVaultItem(
  questionId: string,
  reason: VaultReason,
  today: string,
  hard: boolean = false
): VaultItemState {
  return {
    questionId,
    stage: 0,
    status: 'learning',
    mistakes: reason === 'hard' ? 0 : 1,
    nextDue: addDays(today, LADDER_INTERVALS[0]),
    reason,
    hard: hard || reason === 'hard',
    version: 1,
  };
}

/**
 * Transitions the vault item state based on an answer result.
 */
export function processVaultAnswer(
  current: VaultItemState,
  result: VaultAnswerResult,
  today: string
): VaultItemState {
  const isDue = today >= current.nextDue;
  const isRetained = current.status === 'retained';

  // Case 1: Wrong, blank, or not_known at any stage
  if (result === 'wrong' || result === 'blank' || result === 'not_known') {
    return {
      ...current,
      stage: 0,
      status: 'learning',
      mistakes: current.mistakes + 1,
      nextDue: addDays(today, LADDER_INTERVALS[0]),
      retainedAt: undefined, // lost retention
      version: current.version + 1,
    };
  }

  // Case 2: Correct answer
  if (result === 'correct') {
    // If answered before due (extra practice outside review schedule)
    if (!isDue && !isRetained) {
      return {
        ...current,
        // Stage does not advance on early practice (Section 8.6)
        version: current.version + 1,
      };
    }

    // If currently retained and passing the 60-day check
    if (isRetained) {
      return {
        ...current,
        nextDue: addDays(today, RETAINED_CHECK_INTERVAL),
        version: current.version + 1,
      };
    }

    // Correct at stage 4 -> becomes 'retained'
    if (current.stage === 4) {
      return {
        ...current,
        status: 'retained',
        nextDue: addDays(today, RETAINED_CHECK_INTERVAL),
        retainedAt: today,
        version: current.version + 1,
      };
    }

    // Normal progression: stage + 1
    const nextStage = (current.stage + 1) as VaultStage;
    return {
      ...current,
      stage: nextStage,
      status: getStatusForStage(nextStage, false),
      nextDue: addDays(today, LADDER_INTERVALS[nextStage]),
      version: current.version + 1,
    };
  }

  return current;
}

/**
 * Removes a 'hard' mark. Allowed ONLY if the item is 'retained' (Section 8.6).
 */
export function removeHardMark(current: VaultItemState): { success: boolean; item: VaultItemState; error?: string } {
  if (current.status !== 'retained') {
    return {
      success: false,
      item: current,
      error: 'Cannot remove hard mark until the question is retained (Stage 4 passed).',
    };
  }

  return {
    success: true,
    item: {
      ...current,
      hard: false,
      version: current.version + 1,
    },
  };
}
