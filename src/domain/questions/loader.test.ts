import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseJsonLines } from './loader';
import { validateQuestion } from './kinds';
import { validateBilingualParity } from './parity';

describe('6th Std Tamil Unit 1 Question Bank Validation (54 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl');

  it('successfully reads and parses all 54 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(54);
  });

  it('validates that every single question passes kind & structured validation', () => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    for (const q of questions) {
      const res = validateQuestion(q);
      if (!res.valid) {
        console.error(`Validation failed for question ${q.id}:`, res.errors);
      }
      expect(res.valid, `Question ${q.id} should be valid`).toBe(true);
      expect(res.errors).toHaveLength(0);

      const parityRes = validateBilingualParity(q);
      expect(parityRes.valid, `Parity check for ${q.id}`).toBe(true);
    }
  });

  it('verifies that each question has valid unique IDs and official source references', () => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    const idSet = new Set<string>();
    for (const q of questions) {
      expect(idSet.has(q.id), `Duplicate question ID: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }
  });
});
