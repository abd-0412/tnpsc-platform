import { describe, it, expect } from 'vitest';
import { validateQuestion } from './kinds';
import { QuestionRecord } from './types';

describe('Domain: Question Kinds & Structured Validation (Section 6.1 & 6.7)', () => {
  it('validates a correct direct question', () => {
    const q: QuestionRecord = {
      id: 'q-direct-1',
      kind: 'direct',
      unit_id: 'gs-science',
      level: 'SSLC',
      correct_key: 'B',
      texts: {
        en: {
          blocks: [{ type: 'text', text: 'Which gas is absorbed in photosynthesis?' }],
          options: [
            { key: 'A', text: 'Oxygen' },
            { key: 'B', text: 'Carbon dioxide' },
            { key: 'C', text: 'Nitrogen' },
            { key: 'D', text: 'Hydrogen' },
          ],
        },
      },
    };

    const result = validateQuestion(q);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects duplicate option texts and invalid option keys', () => {
    const q: QuestionRecord = {
      id: 'q-bad-options',
      kind: 'direct',
      unit_id: 'gs-science',
      correct_key: 'A',
      texts: {
        en: {
          blocks: [{ type: 'text', text: 'Sample question' }],
          options: [
            { key: 'A', text: 'Identical' },
            { key: 'B', text: 'Identical' }, // duplicate
            { key: 'C', text: 'Unique' },
            { key: 'D', text: 'Another' },
          ],
        },
      },
    };

    const result = validateQuestion(q);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate option text'))).toBe(true);
  });

  describe('Statements Kind', () => {
    const baseStatementsQ: QuestionRecord = {
      id: 'q-stm-1',
      kind: 'statements',
      unit_id: 'gs-science',
      correct_key: 'B',
      structure: {
        kind: 'statements',
        truth: { I: true, II: false, III: true },
      },
      texts: {
        en: {
          blocks: [
            { type: 'text', text: 'Consider the following statements:' },
            { type: 'statement', label: 'I', text: 'Water boils at 100C' },
            { type: 'statement', label: 'II', text: 'Sun rises in West' },
            { type: 'statement', label: 'III', text: 'Triangle has 3 sides' },
          ],
          options: [
            { key: 'A', text: 'I only', selects: ['I'] },
            { key: 'B', text: 'I and III only', selects: ['I', 'III'] },
            { key: 'C', text: 'II and III only', selects: ['II', 'III'] },
            { key: 'D', text: 'All are correct', selects: 'all' },
          ],
        },
      },
    };

    it('passes when structure truth matches correct_key', () => {
      const res = validateQuestion(baseStatementsQ);
      expect(res.valid).toBe(true);
    });

    it('fails when correct_key disagrees with the calculated truth', () => {
      const mismatchedQ = { ...baseStatementsQ, correct_key: 'A' as const };
      const res = validateQuestion(mismatchedQ);
      expect(res.valid).toBe(false);
      expect(res.errors.some(e => e.includes('resolves to option B, but correct_key is A'))).toBe(true);
    });

    it('inverts polarity properly when is_negative is true ("which is/are incorrect")', () => {
      // Truth: I=true, II=false, III=true. Incorrect one is II.
      const negativeQ: QuestionRecord = {
        ...baseStatementsQ,
        is_negative: true,
        correct_key: 'C',
        texts: {
          en: {
            ...baseStatementsQ.texts.en!,
            options: [
              { key: 'A', text: 'I only', selects: ['I'] },
              { key: 'B', text: 'III only', selects: ['III'] },
              { key: 'C', text: 'II only', selects: ['II'] },
              { key: 'D', text: 'None of these', selects: 'none' },
            ],
          },
        },
      };

      const res = validateQuestion(negativeQ);
      expect(res.valid).toBe(true);
    });
  });

  describe('Assertion & Reason Kind', () => {
    it('verifies both_true_explains semantic', () => {
      const arQuestion: QuestionRecord = {
        id: 'q-ar-1',
        kind: 'assertion_reason',
        unit_id: 'gs-science',
        correct_key: 'A',
        structure: {
          kind: 'assertion_reason',
          a_true: true,
          r_true: true,
          r_explains_a: true,
        },
        texts: {
          en: {
            blocks: [
              { type: 'assertion', text: 'Assertion text here' },
              { type: 'reason', text: 'Reason explaining assertion' },
            ],
            options: [
              { key: 'A', text: 'Both true and R explains A', semantic: 'both_true_explains' },
              { key: 'B', text: 'Both true but R does not explain A', semantic: 'both_true_not_explains' },
              { key: 'C', text: 'A is true but R is false', semantic: 'a_true_r_false' },
              { key: 'D', text: 'Both are false', semantic: 'both_false' },
            ],
          },
        },
      };

      const res = validateQuestion(arQuestion);
      expect(res.valid).toBe(true);
    });
  });

  describe('Match & Arrange Kinds', () => {
    it('validates match the following pairs', () => {
      const matchQ: QuestionRecord = {
        id: 'q-mat-1',
        kind: 'match',
        unit_id: 'apt-aptitude',
        correct_key: 'A',
        structure: {
          kind: 'match',
          pairs: { A: '1', B: '2', C: '3', D: '4' },
        },
        texts: {
          en: {
            blocks: [
              { type: 'list', name: 'List I', items: [{ label: 'A', text: 'Item A' }] },
              { type: 'list', name: 'List II', items: [{ label: '1', text: 'Item 1' }] },
            ],
            options: [
              { key: 'A', text: 'A-1, B-2, C-3, D-4', mapping: { A: '1', B: '2', C: '3', D: '4' } },
              { key: 'B', text: 'A-2, B-1, C-3, D-4', mapping: { A: '2', B: '1', C: '3', D: '4' } },
              { key: 'C', text: 'A-3, B-2, C-1, D-4', mapping: { A: '3', B: '2', C: '1', D: '4' } },
              { key: 'D', text: 'A-4, B-3, C-2, D-1', mapping: { A: '4', B: '3', C: '2', D: '1' } },
            ],
          },
        },
      };

      const res = validateQuestion(matchQ);
      expect(res.valid).toBe(true);
    });

    it('validates arrange chronological sequence', () => {
      const arrangeQ: QuestionRecord = {
        id: 'q-arr-1',
        kind: 'arrange',
        unit_id: 'gs-history-india',
        correct_key: 'B',
        structure: {
          kind: 'arrange',
          order: ['II', 'I', 'IV', 'III'],
        },
        texts: {
          en: {
            blocks: [
              {
                type: 'list',
                name: 'Events',
                items: [
                  { label: 'I', text: 'Event 1' },
                  { label: 'II', text: 'Event 2' },
                  { label: 'III', text: 'Event 3' },
                  { label: 'IV', text: 'Event 4' },
                ],
              },
            ],
            options: [
              { key: 'A', text: 'I, II, III, IV', sequence: ['I', 'II', 'III', 'IV'] },
              { key: 'B', text: 'II, I, IV, III', sequence: ['II', 'I', 'IV', 'III'] },
              { key: 'C', text: 'IV, III, II, I', sequence: ['IV', 'III', 'II', 'I'] },
              { key: 'D', text: 'II, IV, I, III', sequence: ['II', 'IV', 'I', 'III'] },
            ],
          },
        },
      };

      const res = validateQuestion(arrangeQ);
      expect(res.valid).toBe(true);
    });
  });
});
