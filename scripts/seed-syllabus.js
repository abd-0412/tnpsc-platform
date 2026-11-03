const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function seedSyllabus() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database to seed TNPSC syllabus...');

    // Authentic TNPSC Subjects and Units
    const syllabusTree = [
      // 1. General Tamil (பொதுத் தமிழ்)
      {
        id: 'sub-tamil',
        level: 'subject',
        title_en: 'General Tamil (Part A, B, C)',
        title_ta: 'பொதுத் தமிழ் (பகுதி அ, ஆ, இ)',
        order_index: 1,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'unit-ta-grammar',
            level: 'unit',
            title_en: 'Part A: Tamil Grammar (இலக்கணம்)',
            title_ta: 'பகுதி அ: இலக்கணம்',
            order_index: 1,
            children: [
              { id: 'ch-ta-poruthuthal', level: 'chapter', title_en: 'Matching & Appropriate Meaning', title_ta: 'பொருத்துதல் - பொருத்தமான பொருளைத் தேர்வு செய்தல்', order_index: 1 },
              { id: 'ch-ta-sandhi', level: 'chapter', title_en: 'Sandhi Rules & Error Elimination', title_ta: 'சந்திப் பிழையற்ற தொடரை அறிதல்', order_index: 2 },
              { id: 'ch-ta-peyarcol', level: 'chapter', title_en: 'Types of Nouns (பெயர்ச்சொல் வகைகள்)', title_ta: 'பெயர்ச்சொல்லின் வகை அறிதல்', order_index: 3 },
              { id: 'ch-ta-ethircol', level: 'chapter', title_en: 'Antonyms & Synonyms', title_ta: 'எதிர்ச்சொல் மற்றும் பிரித்தெழுதுக', order_index: 4 },
            ]
          },
          {
            id: 'unit-ta-literature',
            level: 'unit',
            title_en: 'Part B: Literature (இலக்கியம்)',
            title_ta: 'பகுதி ஆ: இலக்கியம்',
            order_index: 2,
            children: [
              { id: 'ch-ta-thirukkural', level: 'chapter', title_en: 'Thirukkural (25 Selected Adhikarams)', title_ta: 'திருக்குறள் (25 குறிப்பிட்ட அதிகாரங்கள்)', order_index: 1 },
              { id: 'ch-ta-aram', level: 'chapter', title_en: 'Aram & Ethical Literature (நாலடியார், நான்மணிக்கடிகை)', title_ta: 'அறநூல்கள் (நாலடியார், நான்மணிக்கடிகை, இன்னா நாற்பது)', order_index: 2 },
              { id: 'ch-ta-kambaramayanam', level: 'chapter', title_en: 'Kamba Ramayanam & Epic Literature', title_ta: 'கம்பராமாயணம் & காப்பியங்கள்', order_index: 3 },
              { id: 'ch-ta-sangam', level: 'chapter', title_en: 'Sangam Literature (எட்டுத்தொகை, பத்துப்பாட்டு)', title_ta: 'சங்க இலக்கியம் (எட்டுத்தொகை, பத்துப்பாட்டு)', order_index: 4 },
            ]
          },
          {
            id: 'unit-ta-scholars',
            level: 'unit',
            title_en: 'Part C: Tamil Scholars & Tamil Service (தமிழ் அறிஞர்களும் தமிழ்த் தொண்டும்)',
            title_ta: 'பகுதி இ: தமிழ் அறிஞர்களும் தமிழ்த் தொண்டும்',
            order_index: 3,
            children: [
              { id: 'ch-ta-bharathi', level: 'chapter', title_en: 'Bharathiyar & Bharathidasan', title_ta: 'பாரதியார் & பாரதிதாசன் கவிதைகள்', order_index: 1 },
              { id: 'ch-ta-prose', level: 'chapter', title_en: 'Tamil Prose Development (உரைநடை வளர்ச்சி)', title_ta: 'உரைநடை வளர்ச்சி (மறைமலையடிகள், திரு.வி.க)', order_index: 2 },
            ]
          }
        ]
      },

      // 2. Indian Polity (இந்திய ஆட்சியியல்)
      {
        id: 'sub-polity',
        level: 'subject',
        title_en: 'Indian Polity & Constitution',
        title_ta: 'இந்திய ஆட்சியியல் & அரசியலமைப்பு',
        order_index: 2,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'unit-pol-preamble',
            level: 'unit',
            title_en: 'Constitution of India - Preamble & Salient Features',
            title_ta: 'இந்திய அரசியலமைப்பு - முகப்புரை & முக்கிய அம்சங்கள்',
            order_index: 1,
            children: [
              { id: 'ch-pol-preamble', level: 'chapter', title_en: 'Preamble to the Constitution', title_ta: 'முகப்புரை மற்றும் குடியுரிமை', order_index: 1 },
              { id: 'ch-pol-fr-fd', level: 'chapter', title_en: 'Fundamental Rights & Duties, DPSP', title_ta: 'அடிப்படை உரிமைகள், கடமைகள் & அரசு நெறிமுறைக் கோட்பாடுகள்', order_index: 2 },
            ]
          },
          {
            id: 'unit-pol-union-state',
            level: 'unit',
            title_en: 'Union & State Executive & Legislature',
            title_ta: 'மத்திய மற்றும் மாநில நிர்வாகம் & சட்டமன்றம்',
            order_index: 2,
            children: [
              { id: 'ch-pol-president', level: 'chapter', title_en: 'President, Vice-President & Prime Minister', title_ta: 'குடியரசுத் தலைவர், பிரதமர் & அமைச்சரவை', order_index: 1 },
              { id: 'ch-pol-parliament', level: 'chapter', title_en: 'Parliament & Judiciary (Supreme & High Courts)', title_ta: 'நாடாளுமன்றம் மற்றும் நீதித்துறை', order_index: 2 },
              { id: 'ch-pol-panchayat', level: 'chapter', title_en: 'Local Governments & Panchayati Raj (73rd & 74th Amendments)', title_ta: 'உள்ளாட்சி அமைப்புகள் மற்றும் பஞ்சாயத்து ராஜ்', order_index: 3 },
            ]
          }
        ]
      },

      // 3. History & Culture of India and Tamil Nadu (வரலாறு மற்றும் பண்பாடு)
      {
        id: 'sub-history',
        level: 'subject',
        title_en: 'History & Culture of India & TN',
        title_ta: 'இந்திய மற்றும் தமிழ்நாட்டின் வரலாறு & பண்பாடு',
        order_index: 3,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'unit-hist-ancient',
            level: 'unit',
            title_en: 'Indus Valley to South Indian Dynasties',
            title_ta: 'சிந்து சமவெளி முதல் தென்னிந்திய அரசுகள் வரை',
            order_index: 1,
            children: [
              { id: 'ch-hist-ivc', level: 'chapter', title_en: 'Indus Valley Civilisation', title_ta: 'சிந்து சமவெளி நாகரிகம்', order_index: 1 },
              { id: 'ch-hist-guptas-delhi', level: 'chapter', title_en: 'Guptas, Delhi Sultans & Mughals', title_ta: 'குப்தர்கள், தில்லி சுல்தான்கள் & முகலாயர்கள்', order_index: 2 },
              { id: 'ch-hist-south-kingdoms', level: 'chapter', title_en: 'Cholas, Pandyas, Pallavas & Vijayanagara', title_ta: 'சேர, சோழ, பாண்டிய, பல்லவ மற்றும் விஜயநகர அரசுகள்', order_index: 3 },
            ]
          }
        ]
      },

      // 4. Aptitude & Mental Ability (திறனறிவும் மனக்கணக்கு நுண்ணறிவும்)
      {
        id: 'sub-aptitude',
        level: 'subject',
        title_en: 'Aptitude & Mental Ability',
        title_ta: 'திறனறிவும் மனக்கணக்கு நுண்ணறிவும்',
        order_index: 4,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'unit-apt-arithmetic',
            level: 'unit',
            title_en: 'Numerical & Arithmetic Ability',
            title_ta: 'எண்கணித திறன்',
            order_index: 1,
            children: [
              { id: 'ch-apt-percentage', level: 'chapter', title_en: 'Percentage, Profit & Loss', title_ta: 'சதவீதம், இலாபம் மற்றும் நட்டம்', order_index: 1 },
              { id: 'ch-apt-hcf-lcm', level: 'chapter', title_en: 'HCF and LCM', title_ta: 'மீ.பொ.வ (HCF) மற்றும் மீ.பொ.ம (LCM)', order_index: 2 },
              { id: 'ch-apt-ratio', level: 'chapter', title_en: 'Ratio & Proportion', title_ta: 'விகிதம் மற்றும் விகிதாசாரம்', order_index: 3 },
              { id: 'ch-apt-simple-compound', level: 'chapter', title_en: 'Simple & Compound Interest', title_ta: 'தனிவட்டி மற்றும் கூட்டுவட்டி', order_index: 4 },
              { id: 'ch-apt-time-work', level: 'chapter', title_en: 'Time & Work', title_ta: 'காலம் மற்றும் வேலை', order_index: 5 },
            ]
          }
        ]
      },

      // 5. Unit 8: History, Culture, Heritage & Socio-Political Movements in Tamil Nadu
      {
        id: 'sub-unit8',
        level: 'subject',
        title_en: 'Unit 8: TN History, Culture, Heritage & Thirukkural',
        title_ta: 'அலகு 8: தமிழ்நாட்டின் வரலாறு, மரபு, பண்பாடு & திருக்குறள்',
        order_index: 5,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'unit8-archaeology',
            level: 'unit',
            title_en: 'History of Tamil Society, Keeladi & Archaeological Discoveries',
            title_ta: 'தமிழ் சமுதாய வரலாறு, கீழடி & தொல்லியல் கண்டுபிடிப்புகள்',
            order_index: 1,
            children: [
              { id: 'ch-unit8-keeladi', level: 'chapter', title_en: 'Keeladi, Porunai & Kodumanal Excavations', title_ta: 'கீழடி, பொருநை மற்றும் கொடுமணல் அகழாய்வுகள்', order_index: 1 },
              { id: 'ch-unit8-dravidian', level: 'chapter', title_en: 'Self-Respect Movement, Justice Party & Dravidian Movement', title_ta: 'சுயமரியாதை இயக்கம், நீதிக்கட்சி & திராவிட இயக்கம்', order_index: 2 },
            ]
          }
        ]
      }
    ];

    async function insertNode(node, parentId = null, examIds = ['group_4', 'group_2', 'group_2a']) {
      const nodeExams = node.exam_ids || examIds;
      await client.query(
        `INSERT INTO public.syllabus_nodes (id, parent_id, level, title_en, title_ta, order_index, exam_ids, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (id) DO UPDATE SET 
            title_en = EXCLUDED.title_en,
            title_ta = EXCLUDED.title_ta,
            order_index = EXCLUDED.order_index,
            exam_ids = EXCLUDED.exam_ids;`,
        [node.id, parentId, node.level, node.title_en, node.title_ta, node.order_index, nodeExams]
      );

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          await insertNode(child, node.id, nodeExams);
        }
      }
    }

    for (const subject of syllabusTree) {
      await insertNode(subject, null, subject.exam_ids);
    }

    console.log('Syllabus tree seeded successfully!');
  } catch (err) {
    console.error('Error seeding syllabus:', err);
  } finally {
    await client.end();
  }
}

seedSyllabus();

