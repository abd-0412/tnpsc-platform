import { describe, it, expect } from 'vitest';
import { 
  createInitialVaultItem, 
  processVaultAnswer, 
  removeHardMark, 
  VaultItemState 
} from './ladder';

describe('Domain: Mistake Vault & 5-Stage Ladder (Section 8.6)', () => {
  const today = '2026-10-25';

  it('initializes a wrong question at stage 0, due in 1 day', () => {
    const item = createInitialVaultItem('q1', 'wrong', today);

    expect(item.stage).toBe(0);
    expect(item.status).toBe('learning');
    expect(item.nextDue).toBe('2026-10-26');
    expect(item.mistakes).toBe(1);
    expect(item.reason).toBe('wrong');
  });

  it('initializes a hard marked question with 0 mistakes if marked directly', () => {
    const item = createInitialVaultItem('q2', 'hard', today, true);

    expect(item.stage).toBe(0);
    expect(item.mistakes).toBe(0);
    expect(item.hard).toBe(true);
    expect(item.nextDue).toBe('2026-10-26');
  });

  it('advances stages consecutively when answered correctly on/after due date', () => {
    let item = createInitialVaultItem('q1', 'wrong', '2026-10-25');
    expect(item.stage).toBe(0);
    expect(item.nextDue).toBe('2026-10-26');

    // Day 1 review (Stage 0 -> Stage 1, interval 3 days)
    item = processVaultAnswer(item, 'correct', '2026-10-26');
    expect(item.stage).toBe(1);
    expect(item.status).toBe('learning');
    expect(item.nextDue).toBe('2026-10-29'); // +3 days

    // Day 4 review (Stage 1 -> Stage 2, interval 7 days)
    item = processVaultAnswer(item, 'correct', '2026-10-29');
    expect(item.stage).toBe(2);
    expect(item.status).toBe('learning');
    expect(item.nextDue).toBe('2026-11-05'); // +7 days

    // Day 11 review (Stage 2 -> Stage 3, interval 14 days, status -> consolidating)
    item = processVaultAnswer(item, 'correct', '2026-11-05');
    expect(item.stage).toBe(3);
    expect(item.status).toBe('consolidating');
    expect(item.nextDue).toBe('2026-11-19'); // +14 days

    // Day 25 review (Stage 3 -> Stage 4, interval 30 days)
    item = processVaultAnswer(item, 'correct', '2026-11-19');
    expect(item.stage).toBe(4);
    expect(item.status).toBe('consolidating');
    expect(item.nextDue).toBe('2026-12-19'); // +30 days

    // Day 55 review (Stage 4 -> Retained, interval 60 days check)
    item = processVaultAnswer(item, 'correct', '2026-12-19');
    expect(item.status).toBe('retained');
    expect(item.nextDue).toBe('2027-02-17'); // +60 days
    expect(item.retainedAt).toBe('2026-12-19');
  });

  it('does NOT advance stage when correct answer is given before due date (extra practice)', () => {
    const item = createInitialVaultItem('q1', 'wrong', '2026-10-25');
    // nextDue is 2026-10-26. Answered on 2026-10-25 (same day / early).
    const updated = processVaultAnswer(item, 'correct', '2026-10-25');

    expect(updated.stage).toBe(0); // remains stage 0
    expect(updated.nextDue).toBe('2026-10-26'); // unchanged
  });

  it('resets to stage 0 and increments mistakes on wrong answer at stage 3', () => {
    const stage3Item: VaultItemState = {
      questionId: 'q3',
      stage: 3,
      status: 'consolidating',
      mistakes: 1,
      nextDue: '2026-11-10',
      reason: 'wrong',
      hard: false,
      version: 4,
    };

    const updated = processVaultAnswer(stage3Item, 'wrong', '2026-11-10');

    expect(updated.stage).toBe(0);
    expect(updated.status).toBe('learning');
    expect(updated.mistakes).toBe(2);
    expect(updated.nextDue).toBe('2026-11-11'); // +1 day
  });

  it('demotes a retained question back to stage 0 if missed on retained check', () => {
    const retainedItem: VaultItemState = {
      questionId: 'q4',
      stage: 4,
      status: 'retained',
      mistakes: 1,
      nextDue: '2027-01-01',
      reason: 'wrong',
      hard: false,
      retainedAt: '2026-11-01',
      version: 6,
    };

    const updated = processVaultAnswer(retainedItem, 'wrong', '2027-01-01');

    expect(updated.stage).toBe(0);
    expect(updated.status).toBe('learning');
    expect(updated.retainedAt).toBeUndefined();
    expect(updated.nextDue).toBe('2027-01-02');
  });

  it('only allows removing hard mark when the question is retained', () => {
    const learningHardItem: VaultItemState = {
      questionId: 'q5',
      stage: 2,
      status: 'learning',
      mistakes: 0,
      nextDue: '2026-10-30',
      reason: 'hard',
      hard: true,
      version: 2,
    };

    const attempt1 = removeHardMark(learningHardItem);
    expect(attempt1.success).toBe(false);
    expect(attempt1.error).toContain('Cannot remove hard mark until the question is retained');

    const retainedHardItem: VaultItemState = {
      ...learningHardItem,
      status: 'retained',
    };

    const attempt2 = removeHardMark(retainedHardItem);
    expect(attempt2.success).toBe(true);
    expect(attempt2.item.hard).toBe(false);
  });
});
