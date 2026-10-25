import { describe, it, expect } from 'vitest';
import { buildDueQueue, getDaysOverdue, generateWhyChosenText } from './queue';
import { VaultItemState } from './ladder';

describe('Domain: Mistake Vault Due Queue (Section 8.6 & 18.1)', () => {
  const today = '2026-10-25';

  it('correctly calculates overdue days', () => {
    expect(getDaysOverdue('2026-10-23', today)).toBe(2);
    expect(getDaysOverdue('2026-10-25', today)).toBe(0);
    expect(getDaysOverdue('2026-10-26', today)).toBe(-1);
  });

  it('filters out not-yet-due items and sorts by overdue, stage, and mistakes', () => {
    const items: VaultItemState[] = [
      {
        questionId: 'not-due',
        stage: 0,
        status: 'learning',
        mistakes: 5,
        nextDue: '2026-10-28', // not due yet
        reason: 'wrong',
        hard: false,
        version: 1,
      },
      {
        questionId: 'overdue-1-day',
        stage: 1,
        status: 'learning',
        mistakes: 2,
        nextDue: '2026-10-24', // 1 day overdue
        reason: 'wrong',
        hard: false,
        version: 1,
      },
      {
        questionId: 'overdue-3-days',
        stage: 2,
        status: 'learning',
        mistakes: 1,
        nextDue: '2026-10-22', // 3 days overdue (highest priority!)
        reason: 'wrong',
        hard: false,
        version: 1,
      },
      {
        questionId: 'due-today-stage-0',
        stage: 0,
        status: 'learning',
        mistakes: 1,
        nextDue: '2026-10-25', // due today, stage 0
        reason: 'wrong',
        hard: false,
        version: 1,
      },
      {
        questionId: 'due-today-stage-2',
        stage: 2,
        status: 'learning',
        mistakes: 3,
        nextDue: '2026-10-25', // due today, stage 2
        reason: 'wrong',
        hard: false,
        version: 1,
      },
    ];

    const queue = buildDueQueue(items, today);

    expect(queue).toHaveLength(4); // excluded 'not-due'
    // Order:
    // 1. overdue-3-days (3 days overdue)
    // 2. overdue-1-day (1 day overdue)
    // 3. due-today-stage-0 (0 days overdue, lowest stage 0)
    // 4. due-today-stage-2 (0 days overdue, higher stage 2)
    expect(queue[0].item.questionId).toBe('overdue-3-days');
    expect(queue[1].item.questionId).toBe('overdue-1-day');
    expect(queue[2].item.questionId).toBe('due-today-stage-0');
    expect(queue[3].item.questionId).toBe('due-today-stage-2');
  });

  it('caps the review session at 30 items by default', () => {
    const manyItems: VaultItemState[] = Array.from({ length: 45 }, (_, idx) => ({
      questionId: `q-${idx}`,
      stage: 0,
      status: 'learning',
      mistakes: 1,
      nextDue: '2026-10-24',
      reason: 'wrong',
      hard: false,
      version: 1,
    }));

    const queue = buildDueQueue(manyItems, today);
    expect(queue).toHaveLength(30);
  });

  it('generates accurate bilingual whyChosen text', () => {
    const item: VaultItemState = {
      questionId: 'q-demo',
      stage: 1,
      status: 'learning',
      mistakes: 2,
      nextDue: '2026-10-23', // 2 days overdue
      reason: 'wrong',
      hard: false,
      version: 1,
    };

    const textEn = generateWhyChosenText(item, 2, 'en');
    expect(textEn).toBe('Overdue by 2 days, Stage 1, missed 2 times');

    const textTa = generateWhyChosenText(item, 2, 'ta');
    expect(textTa).toBe('2 நாட்கள் தாமதம், நிலை 1, 2 முறை தவறியது');
  });
});
