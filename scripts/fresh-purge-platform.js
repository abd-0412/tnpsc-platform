const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function purgePlatform() {
  console.log('========================================================================');
  console.log('TNPSC PRACTICE PLATFORM - COMPLETE FRESH CLEANUP / PURGE');
  console.log('Removing all existing tests, PYQs, test attempts, mistake vault & questions');
  console.log('========================================================================\n');

  try {
    // 1. Delete test attempt items
    console.log('1. Clearing test_attempt_items...');
    const { error: err1 } = await supabase.from('test_attempt_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err1) console.log('   Warning:', err1.message);
    else console.log('   ✔ Cleared test_attempt_items');

    // 2. Delete test attempts
    console.log('2. Clearing test_attempts...');
    const { error: err2 } = await supabase.from('test_attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err2) console.log('   Warning:', err2.message);
    else console.log('   ✔ Cleared test_attempts');

    // 3. Delete mistake vault
    console.log('3. Clearing mistake_vault...');
    const { error: err3 } = await supabase.from('mistake_vault').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err3) console.log('   Warning:', err3.message);
    else console.log('   ✔ Cleared mistake_vault');

    // 4. Delete PYQ paper questions
    console.log('4. Clearing pyq_paper_questions...');
    const { error: err4 } = await supabase.from('pyq_paper_questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err4) console.log('   Warning:', err4.message);
    else console.log('   ✔ Cleared pyq_paper_questions');

    // 5. Delete PYQ papers
    console.log('5. Clearing pyq_papers...');
    const { error: err5 } = await supabase.from('pyq_papers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err5) console.log('   Warning:', err5.message);
    else console.log('   ✔ Cleared pyq_papers');

    // 6. Delete test templates
    console.log('6. Clearing test_templates...');
    const { error: err6 } = await supabase.from('test_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err6) console.log('   Warning:', err6.message);
    else console.log('   ✔ Cleared test_templates');

    // 7. Delete all questions (using chunked deletion if needed)
    console.log('7. Clearing questions...');
    let remaining = 1;
    let deletedCount = 0;
    while (remaining > 0) {
      const { data: batch, error: fetchErr } = await supabase.from('questions').select('id').limit(1000);
      if (fetchErr) {
        console.error('   Fetch questions error:', fetchErr.message);
        break;
      }
      if (!batch || batch.length === 0) {
        remaining = 0;
        break;
      }
      const ids = batch.map(q => q.id);
      const { error: delErr } = await supabase.from('questions').delete().in('id', ids);
      if (delErr) {
        console.error('   Delete questions error:', delErr.message);
        break;
      }
      deletedCount += ids.length;
      console.log(`   Deleted ${deletedCount} questions...`);
    }
    console.log('   ✔ Cleared all questions');

    // Verify final counts
    console.log('\n--- VERIFYING CLEAN STATE ---');
    const { count: finalQ } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    const { count: finalT } = await supabase.from('test_templates').select('*', { count: 'exact', head: true });
    const { count: finalP } = await supabase.from('pyq_papers').select('*', { count: 'exact', head: true });
    const { count: finalA } = await supabase.from('test_attempts').select('*', { count: 'exact', head: true });

    console.log(`Questions remaining: ${finalQ || 0}`);
    console.log(`Test Templates remaining: ${finalT || 0}`);
    console.log(`PYQ Papers remaining: ${finalP || 0}`);
    console.log(`Test Attempts remaining: ${finalA || 0}`);

    if (finalQ === 0 && finalT === 0 && finalP === 0) {
      console.log('\n✔ PLATFORM IS COMPLETELY CLEAN AND FRESH!');
    } else {
      console.log('\n⚠ Some records remained. Please check constraints.');
    }
  } catch (err) {
    console.error('Purge error:', err);
  }
}

purgePlatform();

