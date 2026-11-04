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

    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_question_workflow_and_soft_delete.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Applying migration 002...');
    await client.query(sql);
    console.log('Migration 002 applied successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
