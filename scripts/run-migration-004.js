const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function run() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Missing DIRECT_URL or DATABASE_URL');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '004_pyq_management_system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying migration 004 (PYQ Management System)...');
    await client.query(sql);
    console.log('Migration 004 applied successfully!');

    // Let's seed initial question links for PYQ-G4-2022 and PYQ-G4-2024 from available PYQ questions
    console.log('Linking initial sample questions to PYQ papers...');
    await client.query(`
      INSERT INTO public.pyq_paper_questions (paper_id, question_id, sequence_order, section_name)
      SELECT 
        'PYQ-G4-2022' as paper_id,
        q.id as question_id,
        ROW_NUMBER() OVER (ORDER BY q.id) as sequence_order,
        'பொதுத் தமிழ் (General Tamil)' as section_name
      FROM public.questions q
      WHERE q.id LIKE '%pyq%' OR (q.previous_year->>'year')::text = '2022'
      LIMIT 50
      ON CONFLICT (paper_id, question_id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO public.pyq_paper_questions (paper_id, question_id, sequence_order, section_name)
      SELECT 
        'PYQ-G4-2024' as paper_id,
        q.id as question_id,
        ROW_NUMBER() OVER (ORDER BY q.id) as sequence_order,
        'பொதுத் தமிழ் (General Tamil)' as section_name
      FROM public.questions q
      WHERE (q.previous_year->>'year')::text = '2024' OR q.id LIKE '6th-t1-u1-%'
      LIMIT 30
      ON CONFLICT (paper_id, question_id) DO NOTHING;
    `);

    console.log('Sample question links populated successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

