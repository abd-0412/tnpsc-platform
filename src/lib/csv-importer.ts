// ========================================================================
// TNPSC PRACTICE PLATFORM - HIGH-PERFORMANCE CSV & SPREADSHEET PARSER
// ========================================================================

export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * RFC-4180 compliant CSV parser that supports multiline values, escaped quotes,
 * commas inside quotes, UTF-8 BOM, and auto-detects line endings.
 */
export function parseCSV(text: string): ParsedCsvResult {
  // 1. Strip UTF-8 BOM if present
  const cleanText = text.replace(/^\uFEFF/, '');
  if (!cleanText.trim()) {
    return { headers: [], rows: [] };
  }

  // Auto-detect delimiter (comma or semicolon)
  const firstLine = cleanText.split(/\r?\n/)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';

  const records: string[][] = [];
  let currentRecord: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentField += '"';
          i++;
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRecord.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRecord.push(currentField.trim());
        records.push(currentRecord);
        currentRecord = [];
        currentField = '';
      } else if (char === '\n') {
        currentRecord.push(currentField.trim());
        records.push(currentRecord);
        currentRecord = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Push any trailing field/record
  if (currentField.length > 0 || currentRecord.length > 0) {
    currentRecord.push(currentField.trim());
    records.push(currentRecord);
  }

  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  // First non-empty row is headers
  const headerRow = records[0];
  const headers = headerRow.map((h) =>
    h.toLowerCase().trim().replace(/[\s\-_]+/g, '_')
  );

  const rows: Record<string, string>[] = [];
  for (let r = 1; r < records.length; r++) {
    const row = records[r];
    // Skip empty lines
    if (!row || row.length === 0) continue;
    if (row.length === 1 && row[0] === '') continue;
    if (row.every((cell) => cell === '')) continue;

    const rowObj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c];
      if (header) {
        rowObj[header] = row[c] !== undefined ? row[c].trim() : '';
      }
    }
    rows.push(rowObj);
  }

  return { headers, rows };
}

// Column alias dictionary for intelligent mapping
function findFieldValue(row: Record<string, string>, aliases: string[]): string {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== '') {
      return row[alias];
    }
  }
  return '';
}

function normalizeKey(rawKey: string): string {
  const k = rawKey.trim().toUpperCase();
  if (['A', '1', 'அ', 'OPT_A', 'OPTION_A'].includes(k)) return 'A';
  if (['B', '2', 'ஆ', 'OPT_B', 'OPTION_B'].includes(k)) return 'B';
  if (['C', '3', 'இ', 'OPT_C', 'OPTION_C'].includes(k)) return 'C';
  if (['D', '4', 'ஈ', 'OPT_D', 'OPTION_D'].includes(k)) return 'D';
  if (['E', '5', 'உ', 'OPT_E', 'OPTION_E'].includes(k)) return 'E';
  return k;
}

function mapSubjectId(rawSubject: string): string {
  const s = rawSubject.toLowerCase().trim();
  if (!s) return 'general_tamil';
  if (s.includes('tamil') || s.includes('தமிழ்')) return 'general_tamil';
  if (s.includes('polity') || s.includes('அரசியல்')) return 'indian_polity';
  if (s.includes('aptitude') || s.includes('math') || s.includes('கணிதம்')) return 'aptitude';
  if (s.includes('history') || s.includes('வரலாறு')) return 'history_culture';
  if (s.includes('inm') || s.includes('national') || s.includes('இயக்கம்')) return 'indian_national_movement';
  if (s.includes('geography') || s.includes('புவி')) return 'geography';
  if (s.includes('science') || s.includes('அறிவியல்')) return 'general_science';
  if (s.includes('economy') || s.includes('பொருளாதாரம்')) return 'economy';
  if (s.includes('unit_8') || s.includes('unit 8') || s.includes('அலகு 8')) return 'unit_8';
  if (s.includes('unit_9') || s.includes('unit 9') || s.includes('அலகு 9')) return 'unit_9';
  return s.replace(/\s+/g, '_');
}

export function convertCsvRowToQuestionRecord(row: Record<string, string>, rowIndex: number): any {
  // 1. Question ID
  const rawId = findFieldValue(row, ['id', 'question_id', 'q_id', 'வினா_எண்', 'குறியீடு']);
  const id = rawId || `TNPSC-CSV-${Date.now().toString(36)}-${rowIndex}`;

  // 2. Question Text (Tamil & English)
  const questionTa = findFieldValue(row, [
    'question_ta',
    'question',
    'question_text',
    'tamil_question',
    'வினா',
    'கேள்வி',
    'வினா_உரை'
  ]);

  const questionEn = findFieldValue(row, [
    'question_en',
    'english_question',
    'question_english',
    'question_text_en'
  ]);

  if (!questionTa && !questionEn) {
    return {
      __parseError: `Row ${rowIndex}: Missing question text. Either 'question_ta' (வினா) or 'question' column is required.`
    };
  }

  // 3. Options (A, B, C, D)
  const optATa = findFieldValue(row, ['option_a_ta', 'option_a', 'opt_a', 'a', 'விடை_அ', 'விருப்பம்_அ']);
  const optBTa = findFieldValue(row, ['option_b_ta', 'option_b', 'opt_b', 'b', 'விடை_ஆ', 'விருப்பம்_ஆ']);
  const optCTa = findFieldValue(row, ['option_c_ta', 'option_c', 'opt_c', 'c', 'விடை_இ', 'விருப்பம்_இ']);
  const optDTa = findFieldValue(row, ['option_d_ta', 'option_d', 'opt_d', 'd', 'விடை_ஈ', 'விருப்பம்_ஈ']);

  const optAEn = findFieldValue(row, ['option_a_en', 'opt_a_en', 'a_en']);
  const optBEn = findFieldValue(row, ['option_b_en', 'opt_b_en', 'b_en']);
  const optCEn = findFieldValue(row, ['option_c_en', 'opt_c_en', 'c_en']);
  const optDEn = findFieldValue(row, ['option_d_en', 'opt_d_en', 'd_en']);

  if (!optATa || !optBTa || !optCTa || !optDTa) {
    return {
      __parseError: `Row ${rowIndex}: Incomplete options. All 4 options (option_a, option_b, option_c, option_d) are mandatory.`
    };
  }

  // 4. Correct Answer
  const rawKey = findFieldValue(row, [
    'correct_answer',
    'correct_key',
    'correct_option',
    'answer',
    'key',
    'சரியான_விடை',
    'விடை'
  ]);

  const correctKey = normalizeKey(rawKey);
  if (!['A', 'B', 'C', 'D'].includes(correctKey)) {
    return {
      __parseError: `Row ${rowIndex}: Invalid correct answer key '${rawKey}'. Must be 'A', 'B', 'C', or 'D' (or 1, 2, 3, 4, அ, ஆ, இ, ஈ).`
    };
  }

  // 5. Explanation
  const explanationTa = findFieldValue(row, ['explanation_ta', 'explanation', 'விளக்கம்', 'தீர்வு']);
  const explanationEn = findFieldValue(row, ['explanation_en', 'explanation_english']);

  // 6. Subject, Class, Term & Syllabus
  const rawSubject = findFieldValue(row, ['subject', 'subject_id', 'பாடம்']);
  const subjectId = mapSubjectId(rawSubject);

  const rawClass = findFieldValue(row, ['standard', 'class', 'std', 'வகுப்பு']);
  const classNum = rawClass.match(/\d+/)?.[0] || '6';
  const classId = `std-${classNum}th`;

  const rawTerm = findFieldValue(row, ['term', 'பருவம்']);
  const termNum = rawTerm.match(/\d+/)?.[0] || '1';
  const termId = `std-${classNum}th-term-${termNum}`;

  const chapter = findFieldValue(row, ['chapter', 'unit', 'iyal', 'இயல்', 'அலகு', 'பாடம்_தலைப்பு']);
  const page = findFieldValue(row, ['page', 'page_number', 'பக்கம்']);
  const book = findFieldValue(row, ['book', 'பாடநூல்']) || 'Samacheer Kalvi 2025';

  // 7. Difficulty
  const rawDiff = findFieldValue(row, ['difficulty', 'கடினத்தன்மை']).toLowerCase();
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (['easy', 'எளிது', 'எளியது'].includes(rawDiff)) difficulty = 'easy';
  if (['hard', 'கடினம்', 'கடினமானது'].includes(rawDiff)) difficulty = 'hard';

  // 8. Construct Texts Object
  const texts: any = {
    ta: {
      question: questionTa || questionEn,
      options: [
        { id: 'A', text: optATa },
        { id: 'B', text: optBTa },
        { id: 'C', text: optCTa },
        { id: 'D', text: optDTa },
      ],
      explanation: explanationTa || '',
    },
  };

  if (questionEn) {
    texts.en = {
      question: questionEn,
      options: [
        { id: 'A', text: optAEn || optATa },
        { id: 'B', text: optBEn || optBTa },
        { id: 'C', text: optCEn || optCTa },
        { id: 'D', text: optDEn || optDTa },
      ],
      explanation: explanationEn || explanationTa || '',
    };
  }

  // 9. Construct Final Authoritative Record
  return {
    id,
    schema_version: '1.0.0',
    kind: 'direct_mcq',
    level: 'prelims',
    difficulty,
    exam_mappings: [
      { exam_id: 'group_4', is_relevant: true },
      { exam_id: 'group_2', is_relevant: true },
      { exam_id: 'group_2a', is_relevant: true },
    ],
    syllabus: {
      subject_id: subjectId,
      class_id: classId,
      term_id: termId,
      chapter_id: chapter ? chapter.toLowerCase().replace(/\s+/g, '_') : undefined,
    },
    texts,
    question_data: {},
    answer: {
      correct_option_id: correctKey,
      correct_key: correctKey,
    },
    question_settings: {
      marks: 1.5,
      negative_marks: 0.0,
      time_guideline_seconds: 54,
    },
    source: {
      book,
      standard: classNum,
      term: termNum,
      chapter: chapter || undefined,
      page_number: page || undefined,
      edition: '2025 Revised Edition',
    },
    previous_year: {},
    media: [],
    tags: [subjectId, `std_${classNum}`, `term_${termNum}`],
    language_status: questionEn && questionTa ? 'bilingual' : 'tamil_only',
    workflow: {
      status: 'draft',
      verification_comments: [],
    },
    version: 1,
  };
}

