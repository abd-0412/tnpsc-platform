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

describe('6th Std Tamil Unit 2 Question Bank Validation (77 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl');

  it('successfully reads and parses all 77 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(77);
  });

  it('validates that every single question in Unit 2 passes kind & structured validation', () => {
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
    const u1Content = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const u2Content = fs.readFileSync(filePath, 'utf-8');
    const allQuestions = [...parseJsonLines(u1Content), ...parseJsonLines(u2Content)];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across units: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(131); // 54 in U1 + 77 in U2 = 131 total questions
  });

  it('verifies all 7 lesson files in Unit 2 load correctly and sum to 77 questions', () => {
    const lessonFiles = [
      '06_ethilikuruvigal.jsonl',
      '07_siragin_osai.jsonl',
      '08_kizhavanum_kadalum.jsonl',
      '09_muthalezhuthum_sarbezhuthum.jsonl',
      '10_iyal2_mozhipayirchi_kalaichorkal.jsonl',
      '11_thirukkural.jsonl',
      '12_iyal2_punarchi_mathippeedu.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/6th_term1/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(77);
  });
});
