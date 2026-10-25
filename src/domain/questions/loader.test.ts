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

describe('6th Std Tamil Unit 3 Question Bank Validation (59 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl');

  it('successfully reads and parses all 59 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(59);
  });

  it('validates that every single question in Unit 3 passes kind & structured validation', () => {
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

  it('verifies all 190 questions across Unit 1, Unit 2, and Unit 3 have zero duplicate IDs', () => {
    const u1Content = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const u2Content = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const u3Content = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(u1Content),
      ...parseJsonLines(u2Content),
      ...parseJsonLines(u3Content),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across units: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(190); // 54 + 77 + 59 = 190 total questions
  });

  it('verifies all 6 lesson files in Unit 3 load correctly and sum to 59 questions', () => {
    const lessonFiles = [
      '13_kalviyai_potru.jsonl',
      '14_thunbathai_vellum_kalvi.jsonl',
      '15_kalvikkan_thiranthavar.jsonl',
      '16_noolagam_nokki.jsonl',
      '17_mozhi_muthal_iruthi_ezhuthukal.jsonl',
      '18_iyal3_mozhipayirchi_kalaichorkal.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/6th_term1/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(59);
  });
});

describe('6th Std Tamil Term 2 Unit 1 Question Bank Validation (72 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl');

  it('successfully reads and parses all 72 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(72);
  });

  it('validates that every single question in Term 2 Unit 1 passes kind & structured validation', () => {
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

  it('verifies all 262 questions across 6th Term 1 (Units 1-3) and Term 2 (Unit 1) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(262); // 190 (Term 1) + 72 (Term 2 Unit 1) = 262
  });

  it('verifies all 7 lesson files in Term 2 Unit 1 load correctly and sum to 72 questions', () => {
    const lessonFiles = [
      '01_aasarakkovai.jsonl',
      '02_kanmaniye_kannurangu.jsonl',
      '03_thamizhar_peruvizha.jsonl',
      '04_arivusal_avvaiyar.jsonl',
      '05_mozhi_iruthi_ezhuthukal.jsonl',
      '06_iyal1_mozhipayirchi_kalaichorkal.jsonl',
      '07_thirukkural.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/6th_term2/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(72);
  });
});
