const { Client } = require('pg');
const fs = require('fs');

async function testImport() {
  const directUrl = process.env.DIRECT_URL || "postgresql://postgres.zkhnbwmvfgiujqzcmdqx:AbdAzee%4004122005@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";
  const client = new Client({ connectionString: directUrl });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    const lines = fs.readFileSync('public/sample_questions_import.jsonl', 'utf-8').split(/\r?\n/).filter(l => l.trim());
    console.log(`Found ${lines.length} sample lines to import`);

    for (const line of lines) {
      const q = JSON.parse(line);
      const query = `
        INSERT INTO public.questions (
          id, schema_version, kind, level, difficulty, exam_mappings,
          syllabus, texts, question_data, answer, question_settings,
          source, previous_year, tags, language_status, workflow
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
        ON CONFLICT (id) DO UPDATE SET
          texts = EXCLUDED.texts,
          answer = EXCLUDED.answer,
          syllabus = EXCLUDED.syllabus,
          workflow = EXCLUDED.workflow;
      `;
      await client.query(query, [
        q.id,
        q.schema_version,
        q.kind,
        q.level,
        q.difficulty,
        JSON.stringify(q.exam_mappings),
        JSON.stringify(q.syllabus),
        JSON.stringify(q.texts),
        JSON.stringify(q.question_data),
        JSON.stringify(q.answer),
        JSON.stringify(q.question_settings),
        JSON.stringify(q.source),
        JSON.stringify(q.previous_year),
        q.tags,
        q.language_status,
        JSON.stringify(q.workflow)
      ]);
      console.log(`Successfully imported question: ${q.id}`);
    }

    const res = await client.query('SELECT count(*) FROM public.questions');
    console.log(`Total questions in database now: ${res.rows[0].count}`);
  } catch (err) {
    console.error('Test import error:', err);
  } finally {
    await client.end();
  }
}

testImport();
