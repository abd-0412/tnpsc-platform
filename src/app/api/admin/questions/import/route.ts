import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuestionSchema } from '@/lib/schemas/question';
import { parseCSV, convertCsvRowToQuestionRecord } from '@/lib/csv-importer';

export const dynamic = 'force-dynamic';

export function normalizeQuestionRecord(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;
  const norm = { ...raw };

  // 1. Kind normalization
  if (norm.kind === 'direct') norm.kind = 'direct_mcq';
  if (norm.kind === 'match') norm.kind = 'match_the_following';

  // 2. Level normalization
  if (norm.level === 'SSLC' || norm.level === 'HSC' || norm.level === 'Degree') {
    norm.level = 'prelims';
  }

  // 3. Language Status normalization
  if (typeof norm.language_status === 'object' && norm.language_status !== null) {
    if (norm.language_status.ta === 'available' && norm.language_status.en === 'available') {
      norm.language_status = 'bilingual';
    } else if (norm.language_status.ta === 'available') {
      norm.language_status = 'tamil_only';
    } else {
      norm.language_status = 'english_only';
    }
  }

  // 4. Texts normalization
  if (norm.texts) {
    norm.texts = { ...norm.texts };

    // Tamil Content
    if (norm.texts.ta) {
      norm.texts.ta = { ...norm.texts.ta };
      // If question is inside blocks array
      if (!norm.texts.ta.question && Array.isArray(norm.texts.ta.blocks) && norm.texts.ta.blocks[0]?.content) {
        norm.texts.ta.question = norm.texts.ta.blocks[0].content;
      }
      // If options is an object { A: '...', B: '...' }
      if (norm.texts.ta.options && !Array.isArray(norm.texts.ta.options) && typeof norm.texts.ta.options === 'object') {
        norm.texts.ta.options = Object.entries(norm.texts.ta.options).map(([key, val]) => ({
          id: key,
          text: String(val || ''),
        }));
      }
      if (!norm.texts.ta.explanation) {
        norm.texts.ta.explanation = '';
      }
    }

    // English Content
    if (norm.texts.en) {
      // Check if English actually has content
      let enQuestion = norm.texts.en.question;
      if (!enQuestion && Array.isArray(norm.texts.en.blocks) && norm.texts.en.blocks[0]?.content) {
        enQuestion = norm.texts.en.blocks[0].content;
      }

      if (enQuestion) {
        norm.texts.en = { ...norm.texts.en, question: enQuestion };
        if (norm.texts.en.options && !Array.isArray(norm.texts.en.options) && typeof norm.texts.en.options === 'object') {
          norm.texts.en.options = Object.entries(norm.texts.en.options)
            .filter(([_, val]) => val !== null && val !== undefined)
            .map(([key, val]) => ({
              id: key,
              text: String(val || ''),
            }));
        }
        if (!norm.texts.en.explanation) norm.texts.en.explanation = '';
      } else {
        // Remove empty English block so it validates against optional schema
        delete norm.texts.en;
      }
    }
  }

  // 5. Answer normalization
  if (norm.answer) {
    norm.answer = { ...norm.answer };
    if (norm.answer.correct_key && !norm.answer.correct_option_id) {
      norm.answer.correct_option_id = norm.answer.correct_key;
    }
  }

  // 6. Exam Mappings normalization
  if (Array.isArray(norm.exam_mappings)) {
    norm.exam_mappings = norm.exam_mappings.map((m: any) => {
      if (typeof m === 'string') {
        return { exam_id: m, is_relevant: true };
      }
      return m;
    });
  }

  // 7. Syllabus normalization
  if (norm.syllabus) {
    norm.syllabus = { ...norm.syllabus };
    if (norm.syllabus.class && !norm.syllabus.class_id) {
      norm.syllabus.class_id = `std-${norm.syllabus.class}th`;
    }
    if (norm.syllabus.term && !norm.syllabus.term_id) {
      norm.syllabus.term_id = `std-${norm.syllabus.class || '6'}th-term-${norm.syllabus.term}`;
    }
    if (!norm.syllabus.subject_id) {
      norm.syllabus.subject_id = 'general_tamil';
    }

    // Map 6th Term 1 Units & Lessons accurately
    if (norm.id) {
      const match6t1 = norm.id.match(/^6th-t1-u(\d)-(\d+)$/);
      if (match6t1) {
        const uNum = parseInt(match6t1[1], 10);
        const qNum = parseInt(match6t1[2], 10);
        if (uNum === 1) {
          norm.syllabus.unit_id = 'std-6-t1-i1';
          if (qNum <= 18) norm.syllabus.lesson_id = 'std-6-t1-i1-l1';
          else if (qNum <= 44) norm.syllabus.lesson_id = 'std-6-t1-i1-l2';
          else if (qNum <= 60) norm.syllabus.lesson_id = 'std-6-t1-i1-l3';
          else norm.syllabus.lesson_id = 'std-6-t1-i1-l4';
        } else if (uNum === 2) {
          norm.syllabus.unit_id = 'std-6-t1-i2';
          if (qNum <= 12) norm.syllabus.lesson_id = 'std-6-t1-i2-l1';
          else if (qNum <= 40) norm.syllabus.lesson_id = 'std-6-t1-i2-l2';
          else if (qNum <= 54) norm.syllabus.lesson_id = 'std-6-t1-i2-l3';
          else if (qNum <= 68) norm.syllabus.lesson_id = 'std-6-t1-i2-l4';
          else norm.syllabus.lesson_id = 'std-6-t1-i2-l5';
        } else if (uNum === 3) {
          norm.syllabus.unit_id = 'std-6-t1-i3';
          if (qNum <= 12) norm.syllabus.lesson_id = 'std-6-t1-i3-l1';
          else if (qNum <= 26) norm.syllabus.lesson_id = 'std-6-t1-i3-l2';
          else if (qNum <= 48) norm.syllabus.lesson_id = 'std-6-t1-i3-l3';
          else if (qNum <= 64) norm.syllabus.lesson_id = 'std-6-t1-i3-l4';
          else norm.syllabus.lesson_id = 'std-6-t1-i3-l5';
        }
      } else if (norm.id.includes('pyq')) {
        norm.syllabus.unit_id = 'pyq_bridging';
        norm.syllabus.lesson_id = 'std-6th-term-1-pyq';
      }
    }

    // Short-code aliases mapping
    if (norm.syllabus.unit_id === 'u1') norm.syllabus.unit_id = 'std-6-t1-i1';
    if (norm.syllabus.unit_id === 'u2') norm.syllabus.unit_id = 'std-6-t1-i2';
    if (norm.syllabus.unit_id === 'u3') norm.syllabus.unit_id = 'std-6-t1-i3';
  }

  // 8. Media normalization
  if (norm.media && !Array.isArray(norm.media)) {
    norm.media = norm.media.items || [];
  }

  // 9. Previous Year normalization
  if (norm.previous_year && typeof norm.previous_year === 'object') {
    if (norm.previous_year.is_previous_year !== undefined && norm.previous_year.is_pyq === undefined) {
      norm.previous_year = {
        is_pyq: !!norm.previous_year.is_previous_year,
        exam_name: norm.previous_year.exam_name || undefined,
        year: norm.previous_year.year || undefined,
        session: norm.previous_year.session || undefined,
        question_number: norm.previous_year.question_number || undefined,
      };
    }
  }

  // 10. Version normalization
  if (norm.version && typeof norm.version === 'object') {
    norm.version = norm.version.current || 1;
  }

  // 11. Source normalization
  if (norm.source && typeof norm.source === 'object') {
    norm.source = {
      book: norm.source.book || norm.source.book_name || undefined,
      standard: norm.source.standard || (norm.source.class ? String(norm.source.class) : undefined),
      term: norm.source.term ? String(norm.source.term) : undefined,
      chapter: norm.source.chapter || undefined,
      page_number: norm.source.page ? String(norm.source.page) : undefined,
      edition: norm.source.edition || undefined,
    };
  }

  return norm;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify Admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const { content, format } = body; // format: 'json' | 'jsonl'

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'File content must be provided as text' }, { status: 400 });
    }

    const rawRecords: Array<{ raw: any; lineIndex: number }> = [];

    if (format === 'csv') {
      const { rows } = parseCSV(content);
      rows.forEach((row, idx) => {
        const converted = convertCsvRowToQuestionRecord(row, idx + 1);
        rawRecords.push({ raw: converted, lineIndex: idx + 1 });
      });
    } else if (format === 'jsonl') {
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        // Automatically skip comments and empty lines
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
          return;
        }

        try {
          const parsed = JSON.parse(trimmed);
          rawRecords.push({ raw: parsed, lineIndex: idx + 1 });
        } catch (jsonErr: any) {
          rawRecords.push({
            raw: { __parseError: `JSON syntax error: ${jsonErr.message}` },
            lineIndex: idx + 1,
          });
        }
      });
    } else {
      // JSON format (array or single object)
      try {
        const parsed = JSON.parse(content);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        list.forEach((item, idx) => {
          rawRecords.push({ raw: item, lineIndex: idx + 1 });
        });
      } catch (jsonErr: any) {
        return NextResponse.json({ error: `Invalid JSON file syntax: ${jsonErr.message}` }, { status: 400 });
      }
    }

    if (rawRecords.length === 0) {
      return NextResponse.json({ error: 'No valid records found in the uploaded file' }, { status: 400 });
    }

    const validQuestions: any[] = [];
    const invalidRecords: Array<{
      lineIndex: number;
      id?: string;
      errors: string[];
      raw: any;
    }> = [];

    const seenIds = new Set<string>();

    // Validate each record with Zod after normalization
    for (const item of rawRecords) {
      if (item.raw.__parseError) {
        invalidRecords.push({
          lineIndex: item.lineIndex,
          errors: [item.raw.__parseError],
          raw: item.raw,
        });
        continue;
      }

      // Normalize structure
      const normalized = normalizeQuestionRecord(item.raw);

      // Check ID
      const recordId = normalized.id || `TNPSC-IMP-${Date.now().toString(36)}-${item.lineIndex}`;
      normalized.id = recordId;

      if (seenIds.has(recordId)) {
        invalidRecords.push({
          lineIndex: item.lineIndex,
          id: recordId,
          errors: [`Duplicate Question ID '${recordId}' found within the import batch`],
          raw: item.raw,
        });
        continue;
      }
      seenIds.add(recordId);

      // Ensure defaults for workflow
      const incomingStatus = normalized.workflow?.status || 'published';
      if (!normalized.workflow || typeof normalized.workflow !== 'object') {
        normalized.workflow = { status: incomingStatus, verification_comments: [] };
      } else {
        normalized.workflow.status = incomingStatus;
        if (!Array.isArray(normalized.workflow.verification_comments)) {
          normalized.workflow.verification_comments = [];
        }
      }

      if (!normalized.schema_version) normalized.schema_version = '1.0.0';
      if (!normalized.version) normalized.version = 1;

      // Zod Validation
      const result = QuestionSchema.safeParse({
        ...normalized,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (!result.success) {
        const errors = result.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`
        );
        invalidRecords.push({
          lineIndex: item.lineIndex,
          id: recordId,
          errors,
          raw: item.raw,
        });
      } else {
        validQuestions.push(result.data);
      }
    }

    // Insert valid questions in batch into Supabase
    let importedCount = 0;
    if (validQuestions.length > 0) {
      const { error: insertError } = await supabase
        .from('questions')
        .upsert(validQuestions, { onConflict: 'id' });

      if (insertError) {
        return NextResponse.json(
          { error: `Database insert failed: ${insertError.message}` },
          { status: 500 }
        );
      }
      importedCount = validQuestions.length;
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed: rawRecords.length,
        importedCount,
        failedCount: invalidRecords.length,
      },
      invalidRecords,
    });
  } catch (err: any) {
    console.error('Import processing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
