const { Client } = require('pg');

async function seedTestTemplates() {
  const directUrl = process.env.DIRECT_URL || "postgresql://postgres.zkhnbwmvfgiujqzcmdqx:AbdAzee%4004122005@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";
  const client = new Client({ connectionString: directUrl });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // 1. Fetch available question ids
    const qRes = await client.query('SELECT id, texts FROM public.questions LIMIT 20');
    console.log(`Found ${qRes.rows.length} questions in bank`);

    const qIds = qRes.rows.map(r => r.id);
    if (qIds.length === 0) {
      console.log('No questions found to associate with test templates.');
      return;
    }

    const testTemplates = [
      {
        id: 'TEST-6TH-TAM-01',
        title_en: '6th Standard General Tamil - Unit Mock Test',
        title_ta: '6ஆம் வகுப்பு பொதுத்தமிழ் - மாதிரித் தேர்வு 1',
        category: 'unit_quiz',
        exam_id: 'group_4',
        duration_minutes: 25,
        total_marks: qIds.length * 1.5,
        negative_marking_rate: 0.00,
        question_count: qIds.length,
        question_ids: qIds,
        rules: JSON.stringify({
          randomize_questions: false,
          randomize_options: false,
          allow_language_toggle: true,
        }),
        is_published: true,
      },
      {
        id: 'TEST-GRP4-FULL-MOCK-01',
        title_en: 'TNPSC Group 4 Integrated Model Paper 2025',
        title_ta: 'TNPSC குரூப் 4 ஒருங்கிணைந்த மாதிரி வினாத்தாள் 2025',
        category: 'full_mock',
        exam_id: 'group_4',
        duration_minutes: 180,
        total_marks: qIds.length * 1.5,
        negative_marking_rate: 0.00,
        question_count: qIds.length,
        question_ids: qIds,
        rules: JSON.stringify({
          randomize_questions: true,
          randomize_options: false,
          allow_language_toggle: true,
        }),
        is_published: true,
      }
    ];

    for (const t of testTemplates) {
      const query = `
        INSERT INTO public.test_templates (
          id, title_en, title_ta, category, exam_id, duration_minutes,
          total_marks, negative_marking_rate, question_count, question_ids, rules, is_published
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
        ON CONFLICT (id) DO UPDATE SET
          title_en = EXCLUDED.title_en,
          title_ta = EXCLUDED.title_ta,
          question_ids = EXCLUDED.question_ids,
          question_count = EXCLUDED.question_count,
          total_marks = EXCLUDED.total_marks,
          is_published = EXCLUDED.is_published;
      `;
      await client.query(query, [
        t.id,
        t.title_en,
        t.title_ta,
        t.category,
        t.exam_id,
        t.duration_minutes,
        t.total_marks,
        t.negative_marking_rate,
        t.question_count,
        t.question_ids,
        t.rules,
        t.is_published,
      ]);
      console.log(`Seeded test template: ${t.id} - ${t.title_ta}`);
    }

    console.log('Seeding test templates finished successfully!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await client.end();
  }
}

seedTestTemplates();

