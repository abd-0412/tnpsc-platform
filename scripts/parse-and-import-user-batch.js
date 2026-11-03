const fs = require('fs');
const { Client } = require('pg');

function normalizeQuestionRecord(raw) {
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
  } else if (!norm.language_status) {
    norm.language_status = 'bilingual';
  }

  // 4. Texts normalization
  if (norm.texts) {
    norm.texts = { ...norm.texts };

    // Tamil
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
      if (!norm.texts.ta.explanation) {
        norm.texts.ta.explanation = '';
      }
    }

    // English
    if (norm.texts.en) {
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
        // Fallback to Tamil or safe options
        norm.texts.en = {
          question: norm.texts.ta?.question || '',
          options: norm.texts.ta?.options || [],
          explanation: norm.texts.ta?.explanation || '',
        };
      }
    } else {
      norm.texts.en = {
        question: norm.texts.ta?.question || '',
        options: norm.texts.ta?.options || [],
        explanation: norm.texts.ta?.explanation || '',
      };
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
    norm.exam_mappings = norm.exam_mappings.map((m) => {
      if (typeof m === 'string') {
        return { exam_id: m, is_relevant: true };
      }
      return m;
    });
  } else {
    norm.exam_mappings = [{ exam_id: 'group_4', is_relevant: true }];
  }

  // 7. Syllabus normalization
  if (norm.syllabus) {
    norm.syllabus = { ...norm.syllabus };
    const stdNum = norm.syllabus.class || '6';
    norm.syllabus.class_id = `std-${stdNum}th`;
    if (norm.syllabus.term) {
      norm.syllabus.term_id = `std-${stdNum}th-term-${norm.syllabus.term}`;
    }
    if (!norm.syllabus.subject_id) {
      norm.syllabus.subject_id = 'sub-tamil';
    }
  }

  // 8. Question settings
  if (!norm.question_settings) {
    norm.question_settings = { marks: 1.5, negative_marks: 0.0, time_guideline_seconds: 60 };
  } else {
    norm.question_settings.marks = norm.question_settings.marks || 1.5;
    norm.question_settings.negative_marks = norm.question_settings.negative_marks ?? 0.0;
  }

  // 9. Source normalization
  if (norm.source && typeof norm.source === 'object') {
    norm.source = {
      book: norm.source.book || norm.source.book_name || 'Tamil Nadu Samacheer Kalvi 6th Standard Tamil',
      standard: norm.source.standard || (norm.source.class ? String(norm.source.class) : '6'),
      term: norm.source.term ? String(norm.source.term) : '1',
      chapter: norm.source.chapter || undefined,
      page_number: norm.source.page ? String(norm.source.page) : undefined,
      edition: norm.source.edition || '2025',
    };
  }

  // 10. Tags
  if (!Array.isArray(norm.tags)) {
    norm.tags = ['general_tamil', 'std_6', 'term_1'];
  }

  // 11. Workflow
  if (!norm.workflow || typeof norm.workflow !== 'object') {
    norm.workflow = { status: 'published', verification_comments: [] };
  } else {
    norm.workflow.status = 'published'; // Auto-publish these authentic book questions so learners can test immediately!
  }

  return norm;
}

async function runImport() {
  const content = fs.readFileSync('data_raw_user_input.txt', 'utf-8');
  const lines = content.split(/\r?\n/);
  console.log(`Processing ${lines.length} lines from user input...`);

  const parsedQuestions = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
      continue;
    }
    if (trimmed.startsWith('{"__parseError":')) {
      continue;
    }

    try {
      const obj = JSON.parse(trimmed);
      if (obj.id && (obj.texts || obj.kind)) {
        const norm = normalizeQuestionRecord(obj);
        parsedQuestions.push(norm);
      }
    } catch (e) {
      console.warn(`Line ${i + 1} parse error: ${e.message}`);
    }
  }

  console.log(`Successfully extracted & normalized ${parsedQuestions.length} questions!`);

  // Connect to Supabase
  const directUrl = process.env.DIRECT_URL || "postgresql://postgres.zkhnbwmvfgiujqzcmdqx:AbdAzee%4004122005@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";
  const client = new Client({ connectionString: directUrl });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    let importedCount = 0;
    for (const q of parsedQuestions) {
      const query = `
        INSERT INTO public.questions (
          id, schema_version, kind, level, difficulty, exam_mappings,
          syllabus, texts, question_data, answer, question_settings,
          source, previous_year, tags, language_status, workflow, version
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT (id) DO UPDATE SET
          texts = EXCLUDED.texts,
          answer = EXCLUDED.answer,
          syllabus = EXCLUDED.syllabus,
          kind = EXCLUDED.kind,
          level = EXCLUDED.level,
          difficulty = EXCLUDED.difficulty,
          workflow = EXCLUDED.workflow,
          source = EXCLUDED.source,
          tags = EXCLUDED.tags;
      `;

      await client.query(query, [
        q.id,
        q.schema_version || '1.0.0',
        q.kind,
        q.level || 'prelims',
        q.difficulty || 'medium',
        JSON.stringify(q.exam_mappings),
        JSON.stringify(q.syllabus),
        JSON.stringify(q.texts),
        JSON.stringify(q.question_data || {}),
        JSON.stringify(q.answer),
        JSON.stringify(q.question_settings),
        JSON.stringify(q.source || {}),
        JSON.stringify(q.previous_year || {}),
        q.tags || [],
        q.language_status || 'bilingual',
        JSON.stringify(q.workflow),
        1
      ]);

      importedCount++;
    }

    console.log(`✅ Successfully imported ${importedCount} authentic 6th Std Tamil questions into Supabase!`);

    // Now update test templates with these questions so the full mock and unit tests are packed!
    const allQIds = parsedQuestions.map(q => q.id);
    await client.query(`
      UPDATE public.test_templates
      SET
        question_ids = $1,
        question_count = $2,
        total_marks = $3
      WHERE id = 'TEST-6TH-TAM-01'
    `, [allQIds, allQIds.length, allQIds.length * 1.5]);

    console.log(`✅ Updated test 'TEST-6TH-TAM-01' with all ${allQIds.length} questions!`);

    const countRes = await client.query('SELECT count(*) FROM public.questions');
    console.log(`📊 Total questions now in database: ${countRes.rows[0].count}`);
  } catch (err) {
    console.error('Database error during import:', err);
  } finally {
    await client.end();
  }
}

runImport();

