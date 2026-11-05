const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedPYQPapers() {
  console.log('Seeding PYQ Papers and links...');
  const papers = [
    {
      id: 'PYQ-TNPSC-G4-2024',
      title_en: 'TNPSC Group 4 (2024) - General Tamil Original Paper',
      title_ta: 'TNPSC குரூப் 4 (2024) - பொதுத்தமிழ் அசல் வினாத்தாள்',
      exam_id: 'group_4',
      exam_group: 'Group 4',
      year: 2024,
      paper_code: 'GT-2024-01',
      duration_minutes: 180,
      total_marks: 300,
      expected_question_count: 100,
      status: 'published',
      high_yield_topics: ['இலக்கணம்', 'பொருத்துதல்', 'பாரதியார் கவிதைகள்', 'திருக்குறள்']
    },
    {
      id: 'PYQ-TNPSC-G4-2022',
      title_en: 'TNPSC Group 4 (2022) - General Tamil Original Paper',
      title_ta: 'TNPSC குரூப் 4 (2022) - பொதுத்தமிழ் அசல் வினாத்தாள்',
      exam_id: 'group_4',
      exam_group: 'Group 4',
      year: 2022,
      paper_code: 'GT-2022-01',
      duration_minutes: 180,
      total_marks: 300,
      expected_question_count: 100,
      status: 'published',
      high_yield_topics: ['இலக்கணம்', 'சீறாப்புராணம்', 'பெரியார்', 'கம்பராமாயணம்']
    },
    {
      id: 'PYQ-TNPSC-G4-2019',
      title_en: 'TNPSC Group 4 (2019) - General Tamil Original Paper',
      title_ta: 'TNPSC குரூப் 4 (2019) - பொதுத்தமிழ் அசல் வினாத்தாள்',
      exam_id: 'group_4',
      exam_group: 'Group 4',
      year: 2019,
      paper_code: 'GT-2019-01',
      duration_minutes: 180,
      total_marks: 300,
      expected_question_count: 100,
      status: 'published',
      high_yield_topics: ['இலக்கணம்', 'பாரதிதாசன்', 'வேலுநாச்சியார்', 'அறநூல்கள்']
    },
    {
      id: 'PYQ-TNPSC-G4-2018',
      title_en: 'TNPSC Group 4 (2018) - General Tamil Original Paper',
      title_ta: 'TNPSC குரூப் 4 (2018) - பொதுத்தமிழ் அசல் வினாத்தாள்',
      exam_id: 'group_4',
      exam_group: 'Group 4',
      year: 2018,
      paper_code: 'GT-2018-01',
      duration_minutes: 180,
      total_marks: 300,
      expected_question_count: 100,
      status: 'published',
      high_yield_topics: ['இலக்கணம்', 'நாலடியார்', 'திருக்குறள்', 'மரபுக் கவிதைகள்']
    },
    {
      id: 'PYQ-TNPSC-G2-2022',
      title_en: 'TNPSC Group 2 & 2A (2022) - General Tamil Preliminary Paper',
      title_ta: 'TNPSC குரூப் 2 & 2A (2022) - பொதுத்தமிழ் அசல் வினாத்தாள்',
      exam_id: 'group_2',
      exam_group: 'Group 2 / 2A',
      year: 2022,
      paper_code: 'G2-GT-2022',
      duration_minutes: 180,
      total_marks: 300,
      expected_question_count: 100,
      status: 'published',
      high_yield_topics: ['இலக்கணம்', 'உரைநடை', 'சிலப்பதிகாரம்', 'மொழிபெயர்ப்பு']
    }
  ];

  for (const p of papers) {
    const { error: pErr } = await supabase.from('pyq_papers').upsert([p]);
    if (pErr) console.error('Error inserting paper:', p.id, pErr.message);
    else console.log('✔ Paper created:', p.id);
  }

  // Link questions to papers
  for (const p of papers) {
    const { data: qMatches } = await supabase
      .from('questions')
      .select('id')
      .contains('tags', ['pyq'])
      .limit(p.expected_question_count);

    if (qMatches && qMatches.length > 0) {
      const links = qMatches.map((q, idx) => ({
        paper_id: p.id,
        question_id: q.id,
        sequence_order: idx + 1,
        section_name: 'பகுதி - அ: பொதுத்தமிழ்'
      }));
      const { error: lErr } = await supabase.from('pyq_paper_questions').upsert(links);
      if (lErr) console.error('Error linking questions to', p.id, lErr.message);
      else console.log(`✔ Linked ${links.length} questions to ${p.id}`);
    }
  }

  const { count: finalPapers } = await supabase.from('pyq_papers').select('*', { count: 'exact', head: true });
  const { count: finalLinks } = await supabase.from('pyq_paper_questions').select('*', { count: 'exact', head: true });
  console.log(`Final PYQ Papers: ${finalPapers}, Final PYQ Paper Question Links: ${finalLinks}`);
}

seedPYQPapers();
