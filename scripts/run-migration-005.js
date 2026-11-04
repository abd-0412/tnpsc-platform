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

    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_test_templates_exam_mapping.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying migration 005 (Test Templates Exam Mapping)...');
    await client.query(sql);
    console.log('Migration 005 applied successfully!');

    // Check columns
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'test_templates' AND column_name IN ('exam_scope', 'exam_ids');
    `);
    console.log('Verified columns in test_templates:', res.rows);

  } catch (err) {
    console.error('Migration 005 failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

