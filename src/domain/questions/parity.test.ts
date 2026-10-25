import { describe, it, expect } from 'vitest';
import { validateBilingualParity } from './parity';
import { QuestionRecord } from './types';

describe('Domain: Bilingual Parity Validator (Section 6.4 & 18.1)', () => {
  it('passes single language questions without parity check', () => {
    const q: QuestionRecord = {
      id: 'ta-only',
      kind: 'direct',
      unit_id: 'ta-grammar',
      correct_key: 'A',
      texts: {
        ta: {
          blocks: [{ type: 'text', text: 'தமிழ் வினா' }],
          options: [
            { key: 'A', text: 'விடை 1' },
            { key: 'B', text: 'விடை 2' },
            { key: 'C', text: 'விடை 3' },
            { key: 'D', text: 'விடை 4' },
          ],
        },
      },
    };

    const res = validateBilingualParity(q);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('passes when Tamil and English match block types, labels, and option keys', () => {
    const q: QuestionRecord = {
      id: 'bilingual-good',
      kind: 'statements',
      unit_id: 'gs-science',
      correct_key: 'A',
      texts: {
        en: {
          blocks: [
            { type: 'text', text: 'Consider:' },
            { type: 'statement', label: 'I', text: 'Statement 1' },
            { type: 'statement', label: 'II', text: 'Statement 2' },
          ],
          options: [
            { key: 'A', text: 'I only' },
            { key: 'B', text: 'II only' },
            { key: 'C', text: 'Both' },
            { key: 'D', text: 'None' },
          ],
        },
        ta: {
          blocks: [
            { type: 'text', text: 'கவனிக்க:' },
            { type: 'statement', label: 'I', text: 'கூற்று 1' },
            { type: 'statement', label: 'II', text: 'கூற்று 2' },
          ],
          options: [
            { key: 'A', text: 'I மட்டும்' },
            { key: 'B', text: 'II மட்டும்' },
            { key: 'C', text: 'இரண்டும்' },
            { key: 'D', text: 'எதுவுமில்லை' },
          ],
        },
      },
    };

    const res = validateBilingualParity(q);
    expect(res.valid).toBe(true);
  });

  it('fails when block types or statement labels differ between languages', () => {
    const q: QuestionRecord = {
      id: 'bilingual-bad',
      kind: 'statements',
      unit_id: 'gs-science',
      correct_key: 'A',
      texts: {
        en: {
          blocks: [
            { type: 'text', text: 'Consider:' },
            { type: 'statement', label: 'I', text: 'Statement 1' },
          ],
          options: [
            { key: 'A', text: 'A' },
            { key: 'B', text: 'B' },
            { key: 'C', text: 'C' },
            { key: 'D', text: 'D' },
          ],
        },
        ta: {
          blocks: [
            { type: 'text', text: 'கவனிக்க:' },
            { type: 'statement', label: 'A', text: 'கூற்று 1' }, // label mismatch: 'A' vs 'I'
          ],
          options: [
            { key: 'A', text: 'A' },
            { key: 'B', text: 'B' },
            { key: 'C', text: 'C' },
            { key: 'D', text: 'D' },
          ],
        },
      },
    };

    const res = validateBilingualParity(q);
    expect(res.valid).toBe(false);
    expect(res.errors.some(e => e.includes('label mismatch'))).toBe(true);
  });

  it('fails when block counts differ between languages', () => {
    const q: QuestionRecord = {
      id: 'bilingual-count-mismatch',
      kind: 'direct',
      unit_id: 'gs-science',
      correct_key: 'A',
      texts: {
        en: {
          blocks: [{ type: 'text', text: 'Question text' }],
          options: [
            { key: 'A', text: 'A' },
            { key: 'B', text: 'B' },
            { key: 'C', text: 'C' },
            { key: 'D', text: 'D' },
          ],
        },
        ta: {
          blocks: [
            { type: 'text', text: 'வினா உரை' },
            { type: 'text', text: 'கூடுதல் பத்தி' }, // extra block
          ],
          options: [
            { key: 'A', text: 'A' },
            { key: 'B', text: 'B' },
            { key: 'C', text: 'C' },
            { key: 'D', text: 'D' },
          ],
        },
      },
    };

    const res = validateBilingualParity(q);
    expect(res.valid).toBe(false);
    expect(res.errors.some(e => e.includes('Block count mismatch'))).toBe(true);
  });
});
