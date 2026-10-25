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

describe('6th Std Tamil Term 2 Unit 2 Question Bank Validation (82 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit2.jsonl');

  it('successfully reads and parses all 82 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(82);
  });

  it('validates that every single question in Term 2 Unit 2 passes kind & structured validation', () => {
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

  it('verifies all 344 questions across 6th Term 1 (Units 1-3) and Term 2 (Units 1-2) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl'), 'utf-8');
    const t2u2 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
      ...parseJsonLines(t2u2),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(344); // 190 (Term 1) + 72 (Term 2 Unit 1) + 82 (Term 2 Unit 2) = 344
  });

  it('verifies all 7 lesson files in Term 2 Unit 2 load correctly and sum to 82 questions', () => {
    const lessonFiles = [
      '08_naanilam_padaithavan.jsonl',
      '09_kadalodu_vilaiyadu.jsonl',
      '10_valarum_vanigam.jsonl',
      '11_uzhaippe_moolathanam.jsonl',
      '12_ina_ezhuthukal.jsonl',
      '13_iyal2_mozhipayirchi_kalaichorkal.jsonl',
      '14_thirukkural.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/6th_term2/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(82);
  });
});

describe('6th Std Tamil Term 3 Unit 1 Question Bank Validation (70 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit1.jsonl');

  it('successfully reads and parses all 70 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(70);
  });

  it('validates that every single question in Term 3 Unit 1 passes kind & structured validation', () => {
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

  it('verifies all 414 questions across 6th Term 1 (Units 1-3), Term 2 (Units 1-2), and Term 3 (Unit 1) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl'), 'utf-8');
    const t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit2.jsonl'), 'utf-8');
    const t3u1 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
      ...parseJsonLines(t2u2),
      ...parseJsonLines(t3u1),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(414); // 190 (T1) + 72 (T2U1) + 82 (T2U2) + 70 (T3U1) = 414
  });

  it('verifies all 6 lesson files in Term 3 Unit 1 load correctly and sum to 70 questions', () => {
    const lessonFiles = [
      '01_bharatham_anraiya_naatrangal.jsonl',
      '02_paanjai_valam.jsonl',
      '03_thamizhnaattil_gandhi.jsonl',
      '04_velunachiyar.jsonl',
      '05_sutteluthukal_vina_ezhuthukal.jsonl',
      '06_iyal1_mozhipayirchi_kalaichorkal.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/6th_term3/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(70);
  });
});

describe('6th Std Tamil Term 3 Unit 2 Question Bank Validation (62 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit2.jsonl');

  it('successfully reads and parses all 62 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(62);
  });

  it('validates that every single question in Term 3 Unit 2 passes kind & structured validation', () => {
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

  it('verifies all 476 questions across 6th Term 1 (Units 1-3), Term 2 (Units 1-2), and Term 3 (Units 1-2) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl'), 'utf-8');
    const t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit2.jsonl'), 'utf-8');
    const t3u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit1.jsonl'), 'utf-8');
    const t3u2 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
      ...parseJsonLines(t2u2),
      ...parseJsonLines(t3u1),
      ...parseJsonLines(t3u2),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(476); // 190 (T1) + 72 (T2U1) + 82 (T2U2) + 70 (T3U1) + 62 (T3U2) = 476
  });

  it('verifies all 6 lesson files in Term 3 Unit 2 load correctly and sum to 62 questions', () => {
    const lessonFiles = [
      '07_paraparakkanni.jsonl',
      '08_neengal_nallavar_seattle_kaditham.jsonl',
      '09_paatham.jsonl',
      '10_naalvagai_sorkal.jsonl',
      '11_iyal2_mozhipayirchi_kalaichorkal.jsonl',
      '12_thirukkural.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/6th_term3/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(62);
  });
});

describe('6th Std Tamil Term 3 Unit 3 Question Bank Validation (68 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit3.jsonl');

  it('successfully reads and parses all 68 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(68);
  });

  it('validates that every single question in Term 3 Unit 3 passes kind & structured validation', () => {
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

  it('verifies all 544 questions across complete 6th Standard Tamil (Terms 1, 2, 3) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl'), 'utf-8');
    const t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit2.jsonl'), 'utf-8');
    const t3u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit1.jsonl'), 'utf-8');
    const t3u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit2.jsonl'), 'utf-8');
    const t3u3 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
      ...parseJsonLines(t2u2),
      ...parseJsonLines(t3u1),
      ...parseJsonLines(t3u2),
      ...parseJsonLines(t3u3),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(544); // 190 (T1) + 154 (T2) + 200 (T3) = 544
  });

  it('verifies all 6 lesson files in Term 3 Unit 3 load correctly and sum to 68 questions', () => {
    const lessonFiles = [
      '13_aasiya_jothi.jsonl',
      '14_ilaiya_thozhanukku.jsonl',
      '15_manithaneyam_mudivil_oru_thodakkam.jsonl',
      '16_peyarchol_idukuri_kaaranam.jsonl',
      '17_iyal3_mozhipayirchi_kalaichorkal.jsonl',
      '18_thirukkural_kooduthal_vinaakkal.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/6th_term3/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(68);
  });
});

describe('7th Std Tamil Term 1 Unit 1 Question Bank Validation (66 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit1.jsonl');

  it('successfully reads and parses all 66 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(66);
  });

  it('validates that every single question in 7th Term 1 Unit 1 passes kind & structured validation', () => {
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

  it('verifies all 610 questions across 6th Standard Tamil (544) and 7th Standard Term 1 Unit 1 (66) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl'), 'utf-8');
    const t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit2.jsonl'), 'utf-8');
    const t3u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit1.jsonl'), 'utf-8');
    const t3u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit2.jsonl'), 'utf-8');
    const t3u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit3.jsonl'), 'utf-8');
    const t7t1u1 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
      ...parseJsonLines(t2u2),
      ...parseJsonLines(t3u1),
      ...parseJsonLines(t3u2),
      ...parseJsonLines(t3u3),
      ...parseJsonLines(t7t1u1),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(610); // 544 (6th Std) + 66 (7th T1 Unit 1) = 610
  });

  it('verifies all 6 lesson files in 7th Term 1 Unit 1 load correctly and sum to 66 questions', () => {
    const lessonFiles = [
      '01_engal_tamil.jsonl',
      '02_onralla_irandalla.jsonl',
      '03_pechumozhiyum_ezhuthumozhiyum.jsonl',
      '04_solavadai_aalukku_oru_velai.jsonl',
      '05_kutriyalukaram_kutriyalikaram.jsonl',
      '06_iyal1_mozhipayirchi_kalaichorkal.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/7th_term1/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(66);
  });
});

describe('7th Std Tamil Term 1 Unit 2 Question Bank Validation (74 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit2.jsonl');

  it('successfully reads and parses all 74 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(74);
  });

  it('validates that every single question in 7th Term 1 Unit 2 passes kind & structured validation', () => {
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

  it('verifies all 684 questions across 6th Standard Tamil (544) and 7th Standard Term 1 (Units 1-2: 140) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl'), 'utf-8');
    const t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit2.jsonl'), 'utf-8');
    const t3u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit1.jsonl'), 'utf-8');
    const t3u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit2.jsonl'), 'utf-8');
    const t3u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit3.jsonl'), 'utf-8');
    const t7t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit1.jsonl'), 'utf-8');
    const t7t1u2 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
      ...parseJsonLines(t2u2),
      ...parseJsonLines(t3u1),
      ...parseJsonLines(t3u2),
      ...parseJsonLines(t3u3),
      ...parseJsonLines(t7t1u1),
      ...parseJsonLines(t7t1u2),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(684); // 544 (6th Std) + 66 (7th T1 U1) + 74 (7th T1 U2) = 684
  });

  it('verifies all 6 lesson files in 7th Term 1 Unit 2 load correctly and sum to 74 questions', () => {
    const lessonFiles = [
      '07_kaadu.jsonl',
      '08_appadiye_nirkattum_antha_maram.jsonl',
      '09_thamizharin_kapparkalai.jsonl',
      '10_vilangukal_ulagam_kaadukalin_thalaivan.jsonl',
      '11_naalvagai_kurukkangal_kalaichorkal.jsonl',
      '12_thirukkural.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/7th_term1/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(74);
  });
});

describe('7th Std Tamil Term 1 Unit 3 Question Bank Validation (105 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit3.jsonl');

  it('successfully reads and parses all 105 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(105);
  });

  it('validates that every single question in 7th Term 1 Unit 3 passes kind & structured validation', () => {
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

  it('verifies all 789 questions across complete 6th Standard Tamil (544) and complete 7th Standard Term 1 (245) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl'), 'utf-8');
    const t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit2.jsonl'), 'utf-8');
    const t3u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit1.jsonl'), 'utf-8');
    const t3u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit2.jsonl'), 'utf-8');
    const t3u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit3.jsonl'), 'utf-8');
    const t7t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit1.jsonl'), 'utf-8');
    const t7t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit2.jsonl'), 'utf-8');
    const t7t1u3 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
      ...parseJsonLines(t2u2),
      ...parseJsonLines(t3u1),
      ...parseJsonLines(t3u2),
      ...parseJsonLines(t3u3),
      ...parseJsonLines(t7t1u1),
      ...parseJsonLines(t7t1u2),
      ...parseJsonLines(t7t1u3),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(789); // 544 (6th Std) + 245 (7th T1: 66+74+105) = 789
  });

  it('verifies all 6 lesson files in 7th Term 1 Unit 3 load correctly and sum to 105 questions', () => {
    const lessonFiles = [
      '13_viduthalai_thirunaal.jsonl',
      '14_thesiyam_kaatha_semmal_muthuramalingathevar.jsonl',
      '15_kappalottiya_thamizhar.jsonl',
      '16_orezhuthu_orumozhi_pagupatham_pagappatham.jsonl',
      '17_iyal3_mozhipayirchi_kalaichorkal.jsonl',
      '18_thirukkural_iyal3.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/7th_term1/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(105);
  });

  it('verifies all 18 lesson files across complete 7th Standard Term 1 sum to 245 questions', () => {
    const lessonFiles = [
      '01_engal_tamil.jsonl',
      '02_onralla_irandalla.jsonl',
      '03_pechumozhiyum_ezhuthumozhiyum.jsonl',
      '04_solavadai_aalukku_oru_velai.jsonl',
      '05_kutriyalukaram_kutriyalikaram.jsonl',
      '06_iyal1_mozhipayirchi_kalaichorkal.jsonl',
      '07_kaadu.jsonl',
      '08_appadiye_nirkattum_antha_maram.jsonl',
      '09_thamizharin_kapparkalai.jsonl',
      '10_vilangukal_ulagam_kaadukalin_thalaivan.jsonl',
      '11_naalvagai_kurukkangal_kalaichorkal.jsonl',
      '12_thirukkural.jsonl',
      '13_viduthalai_thirunaal.jsonl',
      '14_thesiyam_kaatha_semmal_muthuramalingathevar.jsonl',
      '15_kappalottiya_thamizhar.jsonl',
      '16_orezhuthu_orumozhi_pagupatham_pagappatham.jsonl',
      '17_iyal3_mozhipayirchi_kalaichorkal.jsonl',
      '18_thirukkural_iyal3.jsonl',
    ];

    let total7thTerm1 = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/7th_term1/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      total7thTerm1 += questions.length;
    }

    expect(total7thTerm1).toBe(245); // 66 (Unit 1) + 74 (Unit 2) + 105 (Unit 3) = 245
  });
});

describe('7th Std Tamil Term 2 Unit 1 Question Bank Validation (68 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/7th_term2_unit1.jsonl');

  it('successfully reads and parses all 68 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(68);
  });

  it('validates that every single question in 7th Term 2 Unit 1 passes kind & structured validation', () => {
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

  it('verifies all 857 questions across 6th Standard Tamil (544), complete 7th Term 1 (245), and 7th Term 2 Unit 1 (68) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl'), 'utf-8');
    const t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit2.jsonl'), 'utf-8');
    const t3u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit1.jsonl'), 'utf-8');
    const t3u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit2.jsonl'), 'utf-8');
    const t3u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit3.jsonl'), 'utf-8');
    const t7t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit1.jsonl'), 'utf-8');
    const t7t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit2.jsonl'), 'utf-8');
    const t7t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit3.jsonl'), 'utf-8');
    const t7t2u1 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
      ...parseJsonLines(t2u2),
      ...parseJsonLines(t3u1),
      ...parseJsonLines(t3u2),
      ...parseJsonLines(t3u3),
      ...parseJsonLines(t7t1u1),
      ...parseJsonLines(t7t1u2),
      ...parseJsonLines(t7t1u3),
      ...parseJsonLines(t7t2u1),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(857); // 544 (6th Std) + 245 (7th T1) + 68 (7th T2 Unit 1) = 857
  });

  it('verifies all 6 lesson files in 7th Term 2 Unit 1 load correctly and sum to 68 questions', () => {
    const lessonFiles = [
      '01_azhiya_chelvam.jsonl',
      '02_theyilath_thotta_paattu.jsonl',
      '03_vaazhvikkum_kalvi.jsonl',
      '04_palli_maruthirappu.jsonl',
      '05_ilakkiya_vagaich_chorkal.jsonl',
      '06_iyal1_mozhipayirchi_kalaichorkal.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/7th_term2/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(68);
  });
});

describe('7th Std Tamil Term 2 Unit 2 Question Bank Validation (105 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/7th_term2_unit2.jsonl');

  it('successfully reads and parses all 105 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(105);
  });

  it('validates that every single question in 7th Term 2 Unit 2 passes kind & structured validation', () => {
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

  it('verifies all 962 questions across 6th Standard Tamil (544), complete 7th Term 1 (245), and 7th Term 2 (Units 1-2: 173) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl'), 'utf-8');
    const t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit2.jsonl'), 'utf-8');
    const t3u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit1.jsonl'), 'utf-8');
    const t3u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit2.jsonl'), 'utf-8');
    const t3u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit3.jsonl'), 'utf-8');
    const t7t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit1.jsonl'), 'utf-8');
    const t7t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit2.jsonl'), 'utf-8');
    const t7t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit3.jsonl'), 'utf-8');
    const t7t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term2_unit1.jsonl'), 'utf-8');
    const t7t2u2 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
      ...parseJsonLines(t2u2),
      ...parseJsonLines(t3u1),
      ...parseJsonLines(t3u2),
      ...parseJsonLines(t3u3),
      ...parseJsonLines(t7t1u1),
      ...parseJsonLines(t7t1u2),
      ...parseJsonLines(t7t1u3),
      ...parseJsonLines(t7t2u1),
      ...parseJsonLines(t7t2u2),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(962); // 544 (6th Std) + 245 (7th T1) + 173 (7th T2 U1+U2) = 962
  });

  it('verifies all 6 lesson files in 7th Term 2 Unit 2 load correctly and sum to 105 questions', () => {
    const lessonFiles = [
      '07_poothoduthal.jsonl',
      '08_pesum_oviyangal.jsonl',
      '09_tamil_olirum_idangal.jsonl',
      '10_thozhirpeyar.jsonl',
      '11_iyal2_mozhipayirchi_kalaichorkal.jsonl',
      '12_thirukkural.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/7th_term2/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(105);
  });

  it('verifies all 12 lesson files across 7th Standard Term 2 (Units 1-2) sum to 173 questions', () => {
    const lessonFiles = [
      '01_azhiya_chelvam.jsonl',
      '02_theyilath_thotta_paattu.jsonl',
      '03_vaazhvikkum_kalvi.jsonl',
      '04_palli_maruthirappu.jsonl',
      '05_ilakkiya_vagaich_chorkal.jsonl',
      '06_iyal1_mozhipayirchi_kalaichorkal.jsonl',
      '07_poothoduthal.jsonl',
      '08_pesum_oviyangal.jsonl',
      '09_tamil_olirum_idangal.jsonl',
      '10_thozhirpeyar.jsonl',
      '11_iyal2_mozhipayirchi_kalaichorkal.jsonl',
      '12_thirukkural.jsonl',
    ];

    let total7thTerm2 = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/7th_term2/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      total7thTerm2 += questions.length;
    }

    expect(total7thTerm2).toBe(173); // 68 (Unit 1) + 105 (Unit 2) = 173
  });
});

describe('7th Std Tamil Term 3 Unit 1 Question Bank Validation (72 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/7th_term3_unit1.jsonl');

  it('successfully reads and parses all 72 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(72);
  });

  it('validates that every single question in 7th Term 3 Unit 1 passes kind & structured validation', () => {
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

  it('verifies all 1034 questions across complete 6th Standard Tamil (544), complete 7th Term 1 (245), 7th Term 2 (173), and 7th Term 3 Unit 1 (72) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl'), 'utf-8');
    const t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit2.jsonl'), 'utf-8');
    const t3u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit1.jsonl'), 'utf-8');
    const t3u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit2.jsonl'), 'utf-8');
    const t3u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit3.jsonl'), 'utf-8');
    const t7t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit1.jsonl'), 'utf-8');
    const t7t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit2.jsonl'), 'utf-8');
    const t7t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit3.jsonl'), 'utf-8');
    const t7t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term2_unit1.jsonl'), 'utf-8');
    const t7t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term2_unit2.jsonl'), 'utf-8');
    const t7t3u1 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
      ...parseJsonLines(t2u2),
      ...parseJsonLines(t3u1),
      ...parseJsonLines(t3u2),
      ...parseJsonLines(t3u3),
      ...parseJsonLines(t7t1u1),
      ...parseJsonLines(t7t1u2),
      ...parseJsonLines(t7t1u3),
      ...parseJsonLines(t7t2u1),
      ...parseJsonLines(t7t2u2),
      ...parseJsonLines(t7t3u1),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(1034); // 544 (6th Std) + 245 (7th T1) + 173 (7th T2) + 72 (7th T3 Unit 1) = 1034
  });

  it('verifies all 5 lesson files in 7th Term 3 Unit 1 load correctly and sum to 72 questions', () => {
    const lessonFiles = [
      '01_virunthombal.jsonl',
      '02_thikkellam_pugazhurum_thirunelveli.jsonl',
      '03_thirunelveli_seemaiyum_kavigalum.jsonl',
      '04_vazhakku_poligal.jsonl',
      '05_iyal1_mozhipayirchi_kalaichorkal.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/7th_term3/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(72);
  });
});

describe('7th Std Tamil Term 3 Unit 2 Question Bank Validation (41 Questions)', () => {
  const filePath = path.resolve(__dirname, '../../../data/questions/tamil/7th_term3_unit2.jsonl');

  it('successfully reads and parses all 41 questions skipping comment headers', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = parseJsonLines(content);

    expect(questions).toHaveLength(41);
  });

  it('validates that every single question in 7th Term 3 Unit 2 passes kind & structured validation', () => {
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

  it('verifies all 1075 questions across 6th Standard Tamil (544), 7th Term 1 (245), 7th Term 2 (173), and 7th Term 3 (Units 1-2: 113) have unique IDs', () => {
    const t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit1.jsonl'), 'utf-8');
    const t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit2.jsonl'), 'utf-8');
    const t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term1_unit3.jsonl'), 'utf-8');
    const t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit1.jsonl'), 'utf-8');
    const t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term2_unit2.jsonl'), 'utf-8');
    const t3u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit1.jsonl'), 'utf-8');
    const t3u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit2.jsonl'), 'utf-8');
    const t3u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/6th_term3_unit3.jsonl'), 'utf-8');
    const t7t1u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit1.jsonl'), 'utf-8');
    const t7t1u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit2.jsonl'), 'utf-8');
    const t7t1u3 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term1_unit3.jsonl'), 'utf-8');
    const t7t2u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term2_unit1.jsonl'), 'utf-8');
    const t7t2u2 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term2_unit2.jsonl'), 'utf-8');
    const t7t3u1 = fs.readFileSync(path.resolve(__dirname, '../../../data/questions/tamil/7th_term3_unit1.jsonl'), 'utf-8');
    const t7t3u2 = fs.readFileSync(filePath, 'utf-8');

    const allQuestions = [
      ...parseJsonLines(t1u1),
      ...parseJsonLines(t1u2),
      ...parseJsonLines(t1u3),
      ...parseJsonLines(t2u1),
      ...parseJsonLines(t2u2),
      ...parseJsonLines(t3u1),
      ...parseJsonLines(t3u2),
      ...parseJsonLines(t3u3),
      ...parseJsonLines(t7t1u1),
      ...parseJsonLines(t7t1u2),
      ...parseJsonLines(t7t1u3),
      ...parseJsonLines(t7t2u1),
      ...parseJsonLines(t7t2u2),
      ...parseJsonLines(t7t3u1),
      ...parseJsonLines(t7t3u2),
    ];

    const idSet = new Set<string>();
    for (const q of allQuestions) {
      expect(idSet.has(q.id), `Duplicate question ID across platform: ${q.id}`).toBe(false);
      idSet.add(q.id);

      expect(q.source).toBeDefined();
      expect(['book', 'past_paper', 'other']).toContain(q.source.type);
    }

    expect(allQuestions).toHaveLength(1075); // 544 (6th Std) + 245 (7th T1) + 173 (7th T2) + 72 (7th T3 Unit 1) + 41 (7th T3 Unit 2) = 1075
  });

  it('verifies all 7 lesson files in 7th Term 3 Unit 2 load correctly and sum to 41 questions', () => {
    const lessonFiles = [
      '06_pudhumai_vilakku.jsonl',
      '07_aram_ennum_kadhir.jsonl',
      '08_oppuravu_neri.jsonl',
      '09_unmai_oli.jsonl',
      '10_thinai_paal_idam_irattaikilavi_adukkuthodar.jsonl',
      '11_iyal2_kalaichorkal.jsonl',
      '12_thirukkural.jsonl',
    ];

    let totalLessonQuestions = 0;
    for (const file of lessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/7th_term3/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalLessonQuestions += questions.length;
    }

    expect(totalLessonQuestions).toBe(41);
  });

  it('verifies all 12 lesson files across 7th Term 3 (Units 1 and 2) load correctly and sum to 113 questions', () => {
    const allLessonFiles = [
      '01_virunthombal.jsonl',
      '02_thikkellam_pugazhurum_thirunelveli.jsonl',
      '03_thirunelveli_seemaiyum_kavigalum.jsonl',
      '04_vazhakku_poligal.jsonl',
      '05_iyal1_mozhipayirchi_kalaichorkal.jsonl',
      '06_pudhumai_vilakku.jsonl',
      '07_aram_ennum_kadhir.jsonl',
      '08_oppuravu_neri.jsonl',
      '09_unmai_oli.jsonl',
      '10_thinai_paal_idam_irattaikilavi_adukkuthodar.jsonl',
      '11_iyal2_kalaichorkal.jsonl',
      '12_thirukkural.jsonl',
    ];

    let totalQuestions = 0;
    for (const file of allLessonFiles) {
      const p = path.resolve(__dirname, `../../../data/questions/tamil/7th_term3/${file}`);
      expect(fs.existsSync(p), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(p, 'utf-8');
      const questions = parseJsonLines(content);
      totalQuestions += questions.length;
    }

    expect(totalQuestions).toBe(113); // 72 (Unit 1) + 41 (Unit 2) = 113
  });
});