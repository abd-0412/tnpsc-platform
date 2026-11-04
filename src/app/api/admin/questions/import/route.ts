import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { QuestionSchema } from '@/lib/schemas/question';
import { parseCSV, convertCsvRowToQuestionRecord } from '@/lib/csv-importer';
import { logAuditEvent, logBulkAuditEvents, AuditLogEntry } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export function normalizeQuestionRecord(
  raw: any,
  commonMapping?: Record<string, string>,
  mappingStrategy?: string,
  availableExamIds?: string[]
): any {
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
      if (!norm.texts.ta.question && Array.isArray(norm.texts.ta.blocks) && norm.texts.ta.blocks[0]?.content) {
        norm.texts.ta.question = norm.texts.ta.blocks[0].content;
      }
      if (norm.texts.ta.options && !Array.isArray(norm.texts.ta.options) && typeof norm.texts.ta.options === 'object') {
        norm.texts.ta.options = Object.entries(norm.texts.ta.options).map(([key, val]) => ({
          id: key,
          text: String(val || ''),
        }));
      }
      if (!norm.texts.ta.explanation) norm.texts.ta.explanation = '';
    }

    // English Content
    if (norm.texts.en) {
      let enQuestion = norm.texts.en.question;
      if (!enQuestion && Array.isArray(norm.texts.en.blocks) && norm.texts.en.blocks[0]?.content) {
        enQuestion = norm.texts.en.blocks[0].content;
      }

      if (enQuestion && enQuestion.trim()) {
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
  } else if (!norm.exam_mappings) {
    norm.exam_mappings = [];
  }

  // 7. Syllabus normalization
  norm.syllabus = { ...(norm.syllabus || {}) };
  if (norm.syllabus.class && !norm.syllabus.class_id) {
    norm.syllabus.class_id = `std-${norm.syllabus.class}th`;
  }
  if (norm.syllabus.term && !norm.syllabus.term_id) {
    norm.syllabus.term_id = `std-${norm.syllabus.class || '6'}th-term-${norm.syllabus.term}`;
  }
  if (!norm.syllabus.subject_id) {
    norm.syllabus.subject_id = commonMapping?.subject_id || 'general_tamil';
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

  // Apply Common Syllabus Mapping & Broad Scope Logic
  if (commonMapping && Object.keys(commonMapping).length > 0) {
    const isOverride = mappingStrategy === 'override_with_common';
    const isFillMissing = mappingStrategy === 'fill_missing_with_common';

    // 1. Examination Scope: All Groups vs Selected
    if (commonMapping.exam_id) {
      if (commonMapping.exam_id === 'all_groups') {
        if (isOverride || !norm.exam_mappings || norm.exam_mappings.length === 0) {
          norm.syllabus.exam_scope = 'all_groups';
          norm.exam_mappings = (availableExamIds && availableExamIds.length > 0
            ? availableExamIds
            : ['group_4', 'group_2', 'group_2a', 'group_1']
          ).map((id) => ({
            exam_id: id,
            is_relevant: true,
          }));
        }
      } else {
        if (isOverride || !norm.exam_mappings || norm.exam_mappings.length === 0) {
          norm.syllabus.exam_scope = 'selected';
          norm.exam_mappings = [{ exam_id: commonMapping.exam_id, is_relevant: true }];
        }
      }
    }

    // 2. Class & Subject
    if (isOverride || !norm.syllabus.class_id) {
      if (commonMapping.class_id) norm.syllabus.class_id = commonMapping.class_id;
    }
    if (isOverride || !norm.syllabus.subject_id) {
      if (commonMapping.subject_id) norm.syllabus.subject_id = commonMapping.subject_id;
    }

    // 3. Broad Term / Iyal / Lesson Scope Mapping
    const isAllTerms = commonMapping.term_id === 'all' || commonMapping.term_scope === 'all';
    const isAllIyals = commonMapping.unit_id === 'all' || commonMapping.unit_scope === 'all';
    const isAllLessons = commonMapping.lesson_id === 'all' || commonMapping.lesson_scope === 'all';

    if (isAllTerms) {
      // Entire Class & Subject across ALL terms
      if (isOverride || (!norm.syllabus.term_id && !norm.syllabus.unit_id && !norm.syllabus.lesson_id)) {
        norm.syllabus.term_scope = 'all';
        norm.syllabus.term_id = null;
        norm.syllabus.unit_scope = 'all';
        norm.syllabus.unit_id = null;
        norm.syllabus.lesson_scope = 'all';
        norm.syllabus.lesson_id = null;
      }
    } else if (isAllIyals) {
      // Entire Term across ALL Iyals
      if (isOverride || (!norm.syllabus.unit_id && !norm.syllabus.lesson_id)) {
        norm.syllabus.term_scope = 'specific';
        if (commonMapping.term_id && commonMapping.term_id !== 'all') {
          norm.syllabus.term_id = commonMapping.term_id;
        }
        norm.syllabus.unit_scope = 'all';
        norm.syllabus.unit_id = null;
        norm.syllabus.lesson_scope = 'all';
        norm.syllabus.lesson_id = null;
      }
    } else if (isAllLessons) {
      // Entire Iyal across ALL lessons
      if (isOverride || !norm.syllabus.lesson_id) {
        norm.syllabus.term_scope = 'specific';
        if (commonMapping.term_id && commonMapping.term_id !== 'all') {
          norm.syllabus.term_id = commonMapping.term_id;
        }
        norm.syllabus.unit_scope = 'specific';
        if (commonMapping.unit_id && commonMapping.unit_id !== 'all') {
          norm.syllabus.unit_id = commonMapping.unit_id;
        }
        norm.syllabus.lesson_scope = 'all';
        norm.syllabus.lesson_id = null;
      }
    } else {
      // Specific Lesson or individual hierarchy
      if (isOverride || !norm.syllabus.term_id) {
        if (commonMapping.term_id && commonMapping.term_id !== 'all') {
          norm.syllabus.term_id = commonMapping.term_id;
        }
      }
      if (isOverride || !norm.syllabus.unit_id) {
        if (commonMapping.unit_id && commonMapping.unit_id !== 'all') {
          norm.syllabus.unit_id = commonMapping.unit_id;
        }
      }
      if (isOverride || !norm.syllabus.lesson_id) {
        if (commonMapping.lesson_id && commonMapping.lesson_id !== 'all') {
          norm.syllabus.lesson_id = commonMapping.lesson_id;
        }
      }
      norm.syllabus.term_scope = norm.syllabus.term_id ? 'specific' : 'all';
      norm.syllabus.unit_scope = norm.syllabus.unit_id ? 'specific' : 'all';
      norm.syllabus.lesson_scope = norm.syllabus.lesson_id ? 'specific' : 'all';
    }
  }

  // Ensure exam_mappings fallback if none was set
  if (!norm.exam_mappings || norm.exam_mappings.length === 0) {
    norm.exam_mappings = [{ exam_id: 'group_4', is_relevant: true }];
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
      .select('id, full_name, role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      content,
      format, // 'csv' | 'jsonl' | 'json'
      mode = 'commit', // 'validate_preview' | 'commit'
      commonMapping, // { exam_id, class_id, subject_id, term_id, unit_id, lesson_id, chapter_id }
      mappingStrategy = 'fill_missing_with_common', // 'use_json_metadata' | 'fill_missing_with_common' | 'override_with_common'
    } = body;

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
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
          return;
        }

        try {
          const parsed = JSON.parse(trimmed);
          rawRecords.push({ raw: parsed, lineIndex: idx + 1 });
        } catch (jsonErr: any) {
          rawRecords.push({
            raw: { __parseError: `JSON syntax error on line ${idx + 1}: ${jsonErr.message}` },
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

    // Pre-fetch all active syllabus node IDs to validate references
    const { data: dbSyllabusNodes } = await supabase
      .from('syllabus_nodes')
      .select('id, level')
      .eq('is_active', true);

    const validSyllabusNodeIds = new Set((dbSyllabusNodes || []).map((n) => n.id));

    // Pre-fetch all active exams from database
    const { data: dbExams } = await supabase
      .from('exams')
      .select('id')
      .eq('is_active', true);

    const availableExamIds = (dbExams || []).map((e) => e.id);

    // Extract all candidate IDs to check existing questions in DB
    const candidateIds: string[] = [];
    rawRecords.forEach((item, idx) => {
      const recId = item.raw.id || `TNPSC-IMP-${Date.now().toString(36)}-${item.lineIndex || idx + 1}`;
      candidateIds.push(recId);
    });

    const { data: existingDbQuestions } = await supabase
      .from('questions')
      .select('id')
      .in('id', candidateIds);

    const existingDbIdSet = new Set((existingDbQuestions || []).map((q) => q.id));

    const validQuestions: any[] = [];
    const invalidRecords: Array<{
      lineIndex: number;
      id?: string;
      errors: string[];
      raw: any;
    }> = [];

    const seenIdsInBatch = new Set<string>();
    let duplicateInFileCount = 0;
    let existingInDbCount = 0;
    let missingTamilCount = 0;
    let missingEnglishCount = 0;
    let missingAnswerCount = 0;
    let invalidSyllabusCount = 0;

    const now = new Date().toISOString();
    const adminName = profile.full_name || 'Admin';

    for (const item of rawRecords) {
      if (item.raw.__parseError) {
        invalidRecords.push({
          lineIndex: item.lineIndex,
          errors: [item.raw.__parseError],
          raw: item.raw,
        });
        continue;
      }

      // Normalize record with syllabus mapping strategy and dynamic exam list
      const normalized = normalizeQuestionRecord(item.raw, commonMapping, mappingStrategy, availableExamIds);

      const recordId = normalized.id || `TNPSC-IMP-${Date.now().toString(36)}-${item.lineIndex}`;
      normalized.id = recordId;

      const errors: string[] = [];

      // 1. Duplicate checks
      if (seenIdsInBatch.has(recordId)) {
        errors.push(`Duplicate Question ID '${recordId}' found within the import file`);
        duplicateInFileCount++;
      } else {
        seenIdsInBatch.add(recordId);
      }

      if (existingDbIdSet.has(recordId)) {
        existingInDbCount++;
        // Note: For imports, existing ID will be an upsert if committed, but preview flags it
      }

      // 2. Bilingual content check
      if (!normalized.texts?.ta?.question) {
        errors.push('Missing Tamil question text (texts.ta.question is required)');
        missingTamilCount++;
      }
      if (!normalized.texts?.en?.question) {
        missingEnglishCount++; // warning/statistic, English is optional in bilingual schema
      }

      // 3. Answer check
      if (
        !normalized.answer?.correct_option_id &&
        !normalized.answer?.correct_key &&
        !normalized.answer?.match_pairs &&
        !normalized.answer?.ordered_sequence &&
        normalized.answer?.numeric_target === undefined
      ) {
        errors.push('Missing correct answer or key (answer.correct_option_id is required)');
        missingAnswerCount++;
      }

      // 4. Validate syllabus nodes against database
      if (normalized.syllabus?.unit_id && !validSyllabusNodeIds.has(normalized.syllabus.unit_id)) {
        errors.push(`Unit ID '${normalized.syllabus.unit_id}' does not exist in syllabus_nodes`);
        invalidSyllabusCount++;
      }
      if (normalized.syllabus?.lesson_id && !validSyllabusNodeIds.has(normalized.syllabus.lesson_id)) {
        errors.push(`Lesson ID '${normalized.syllabus.lesson_id}' does not exist in syllabus_nodes`);
        invalidSyllabusCount++;
      }
      if (normalized.syllabus?.chapter_id && !validSyllabusNodeIds.has(normalized.syllabus.chapter_id)) {
        errors.push(`Chapter ID '${normalized.syllabus.chapter_id}' does not exist in syllabus_nodes`);
        invalidSyllabusCount++;
      }

      // CRITICAL STATUS RULE:
      // Every successfully imported question MUST be created with:
      // workflow.status = "draft"
      // workflow.verification_status = "pending"
      // No imported question may become Published / Active automatically.
      normalized.workflow = {
        status: 'draft',
        verification_status: 'pending',
        verified_by: null,
        verified_at: null,
        rejection_reason: null,
        verification_comments: [],
        history: [
          {
            from_status: '',
            to_status: 'draft',
            action: 'import',
            by_id: user.id,
            by_name: adminName,
            reason: `Imported via ${format.toUpperCase()} batch`,
            timestamp: now,
          },
        ],
      };

      normalized.schema_version = '1.0.0';
      normalized.version = 1;
      normalized.is_archived = false;
      normalized.deleted_at = null;
      normalized.deleted_by = null;
      normalized.deletion_reason = null;

      // Zod Validation
      const result = QuestionSchema.safeParse({
        ...normalized,
        created_by: user.id,
        created_at: now,
        updated_at: now,
      });

      if (!result.success) {
        const zodErrors = result.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`
        );
        errors.push(...zodErrors);
      }

      if (errors.length > 0) {
        invalidRecords.push({
          lineIndex: item.lineIndex,
          id: recordId,
          errors,
          raw: item.raw,
        });
      } else if (result.success) {
        validQuestions.push(result.data);
      }
    }

    // If PREVIEW MODE: return validation breakdown without writing to database
    if (mode === 'validate_preview') {
      return NextResponse.json({
        success: true,
        mode: 'validate_preview',
        summary: {
          totalRecords: rawRecords.length,
          validCount: validQuestions.length,
          invalidCount: invalidRecords.length,
          duplicateInFileCount,
          existingInDbCount,
          missingTamilCount,
          missingEnglishCount,
          missingAnswerCount,
          invalidSyllabusCount,
        },
        previewSample: validQuestions.slice(0, 5),
        invalidRecords: invalidRecords.slice(0, 50),
      });
    }

    // COMMIT MODE: Write valid questions in batches into Supabase
    let importedCount = 0;
    const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;

    if (validQuestions.length > 0) {
      // Chunk insertions into blocks of 100 for network safety and memory optimization
      const chunkSize = 100;
      for (let i = 0; i < validQuestions.length; i += chunkSize) {
        const chunk = validQuestions.slice(i, i + chunkSize);
        const { error: insertError } = await supabase
          .from('questions')
          .upsert(chunk, { onConflict: 'id' });

        if (insertError) {
          return NextResponse.json(
            { error: `Database insert failed at records ${i + 1}-${i + chunk.length}: ${insertError.message}` },
            { status: 500 }
          );
        }
      }

      importedCount = validQuestions.length;

      // Log Bulk Audit Events for every successfully imported question
      const auditEntries: AuditLogEntry[] = validQuestions.map((q) => ({
        userId: user.id,
        action: 'question_import',
        entityType: 'question',
        entityId: q.id,
        details: {
          batch_id: batchId,
          format,
          status: 'draft',
          subject_id: q.syllabus?.subject_id,
          unit_id: q.syllabus?.unit_id,
          lesson_id: q.syllabus?.lesson_id,
        },
      }));

      await logBulkAuditEvents(supabase, auditEntries);

      // Log master batch audit record
      await logAuditEvent(supabase, {
        userId: user.id,
        action: 'import_batch_complete',
        entityType: 'import_batch',
        entityId: batchId,
        details: {
          totalProcessed: rawRecords.length,
          importedCount,
          failedCount: invalidRecords.length,
          format,
          mappingStrategy,
          commonMapping,
        },
      });
    }

    return NextResponse.json({
      success: true,
      mode: 'commit',
      batchId,
      summary: {
        totalProcessed: rawRecords.length,
        importedCount,
        failedCount: invalidRecords.length,
        duplicateInFileCount,
        existingInDbCount,
        missingTamilCount,
        missingEnglishCount,
        missingAnswerCount,
        invalidSyllabusCount,
      },
      message: `Successfully imported ${importedCount} question(s) into Draft / Pending Review.${
        invalidRecords.length > 0 ? ` (${invalidRecords.length} records rejected due to validation errors)` : ''
      }`,
      invalidRecords,
    });
  } catch (err: any) {
    console.error('Import processing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
