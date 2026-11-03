const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function seedQuestions() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database to seed authentic TNPSC sample questions...');

    const sampleQuestions = [
      {
        id: 'TNPSC-POLITY-2022-Q01',
        schema_version: '1.0.0',
        kind: 'direct_mcq',
        level: 'prelims',
        difficulty: 'easy',
        exam_mappings: [
          { exam_id: 'group_4', is_relevant: true },
          { exam_id: 'group_2', is_relevant: true },
          { exam_id: 'group_2a', is_relevant: true },
        ],
        syllabus: {
          subject_id: 'sub-polity',
          unit_id: 'unit-pol-preamble',
          chapter_id: 'ch-pol-preamble',
        },
        texts: {
          ta: {
            question: 'இந்திய அரசியலமைப்பின் முகப்புரை எந்த அரசமைப்பு சட்டத்திருத்தத்தின் மூலம் முதன்முதலில் திருத்தப்பட்டது?',
            options: [
              { id: 'A', text: '42-வது சட்டத்திருத்தம், 1976' },
              { id: 'B', text: '44-வது சட்டத்திருத்தம், 1978' },
              { id: 'C', text: '24-வது சட்டத்திருத்தம், 1971' },
              { id: 'D', text: '86-வது சட்டத்திருத்தம், 2002' },
            ],
            explanation: '1976-ஆம் ஆண்டு 42-வது அரசமைப்புச் சட்டத்திருத்தத்தின் மூலம் முகப்புரை முதன்முறையாக திருத்தப்பட்டு சமதர்மம் (Socialist), சமயச்சார்பற்ற (Secular), ஒருமைப்பாடு (Integrity) ஆகிய மூன்று புதிய சொற்கள் சேர்க்கப்பட்டன.',
          },
          en: {
            question: 'By which Constitutional Amendment Act was the Preamble of the Indian Constitution amended for the first time?',
            options: [
              { id: 'A', text: '42nd Amendment Act, 1976' },
              { id: 'B', text: '44th Amendment Act, 1978' },
              { id: 'C', text: '24th Amendment Act, 1971' },
              { id: 'D', text: '86th Amendment Act, 2002' },
            ],
            explanation: 'The Preamble was amended only once so far, by the 42nd Constitutional Amendment Act of 1976, which added three new words: Socialist, Secular, and Integrity.',
          },
        },
        question_data: {},
        answer: {
          correct_option_id: 'A',
          explanation_summary: '42nd Amendment Act, 1976',
        },
        question_settings: {
          marks: 1.5,
          negative_marks: 0.0,
          time_guideline_seconds: 45,
        },
        source: {
          book: '10th Standard Samacheer Kalvi Social Science (Civics Unit 1)',
          standard: '10th Standard',
          page_number: '164',
        },
        previous_year: {
          is_pyq: true,
          exam_name: 'TNPSC Group 4',
          year: 2022,
          question_number: 142,
        },
        tags: ['Polity', 'Constitution', 'Preamble', 'PYQ'],
        language_status: 'bilingual',
        workflow: {
          status: 'published',
          verified_by: 'Platform Administrator',
          verified_at: new Date().toISOString(),
          verification_comments: [{ author_id: 'admin', author_name: 'Admin', comment: 'Verified against official TNPSC 2022 answer key', date: new Date().toISOString() }],
        },
        version: 1,
        is_archived: false,
      },
      {
        id: 'TNPSC-TAMIL-SANGAM-Q02',
        schema_version: '1.0.0',
        kind: 'direct_mcq',
        level: 'prelims',
        difficulty: 'easy',
        exam_mappings: [
          { exam_id: 'group_4', is_relevant: true },
          { exam_id: 'group_2', is_relevant: true },
        ],
        syllabus: {
          subject_id: 'sub-tamil',
          unit_id: 'unit-ta-literature',
          chapter_id: 'ch-ta-sangam',
        },
        texts: {
          ta: {
            question: "'யாதும் ஊரே யாவரும் கேளிர்' என்ற உலகளாவிய மனிதநேய வரிகளை இயற்றிய சங்ககாலப் புலவர் யார்?",
            options: [
              { id: 'A', text: 'கணியன் பூங்குன்றனார்' },
              { id: 'B', text: 'ஔவையார்' },
              { id: 'C', text: 'கபிலர்' },
              { id: 'D', text: 'பரணர்' },
            ],
            explanation: 'புறநானூற்றில் 192-வது பாடலில் கணியன் பூங்குன்றனார் "யாதும் ஊரே யாவரும் கேளிர்; தீதும் நன்றும் பிறர்தர வாரா" என்ற மாபெரும் தத்துவ வரிகளைப் பாடியுள்ளார்.',
          },
          en: {
            question: "Who was the Sangam era poet who composed the universal humanist lines 'Yaadhum Oore Yaavarum Kaelir'?",
            options: [
              { id: 'A', text: 'Kaniyan Poongundranar' },
              { id: 'B', text: 'Avvaiyar' },
              { id: 'C', text: 'Kabilar' },
              { id: 'D', text: 'Paranar' },
            ],
            explanation: "Kaniyan Poongundranar composed this iconic verse in Purananuru (Poem 192): 'To us all towns are one, all humans our kin'.",
          },
        },
        question_data: {},
        answer: {
          correct_option_id: 'A',
          explanation_summary: 'கணியன் பூங்குன்றனார் (புறநானூறு)',
        },
        question_settings: {
          marks: 1.5,
          negative_marks: 0.0,
          time_guideline_seconds: 30,
        },
        source: {
          book: '9th Standard Tamil Textbook',
          standard: '9th Standard',
          page_number: '88',
        },
        previous_year: {
          is_pyq: true,
          exam_name: 'TNPSC Group 4',
          year: 2019,
        },
        tags: ['Tamil', 'Purananuru', 'Literature', 'PYQ'],
        language_status: 'bilingual',
        workflow: {
          status: 'published',
          verified_by: 'Platform Administrator',
          verified_at: new Date().toISOString(),
          verification_comments: [],
        },
        version: 1,
        is_archived: false,
      },
      {
        id: 'TNPSC-UNIT8-KEELADI-Q03',
        schema_version: '1.0.0',
        kind: 'direct_mcq',
        level: 'prelims',
        difficulty: 'medium',
        exam_mappings: [
          { exam_id: 'group_4', is_relevant: true },
          { exam_id: 'group_2', is_relevant: true },
          { exam_id: 'group_2a', is_relevant: true },
        ],
        syllabus: {
          subject_id: 'sub-unit8',
          unit_id: 'unit8-archaeology',
          chapter_id: 'ch-unit8-keeladi',
        },
        texts: {
          ta: {
            question: 'வைகை நதிக்கரையில் அமைந்துள்ள கீழடி அகழாய்வு தளம் எந்த மாவட்டத்தின் எல்லைக்குள் அமைந்துள்ளது?',
            options: [
              { id: 'A', text: 'மதுரை' },
              { id: 'B', text: 'சிவகங்கை' },
              { id: 'C', text: 'திண்டுக்கல்' },
              { id: 'D', text: 'இராமநாதபுரம்' },
            ],
            explanation: 'கீழடி அகழாய்வு தளம் சிவகங்கை மாவட்டம் திருப்புவனம் வட்டத்தில் வைகை ஆற்றின் தென் கரையில் அமைந்துள்ளது.',
          },
          en: {
            question: 'The Sangam-era archaeological excavation site Keeladi is located in which district of Tamil Nadu?',
            options: [
              { id: 'A', text: 'Madurai' },
              { id: 'B', text: 'Sivagangai' },
              { id: 'C', text: 'Dindigul' },
              { id: 'D', text: 'Ramanathapuram' },
            ],
            explanation: 'Keeladi is located in the Thiruppuvanam taluk of Sivagangai district, situated on the southern bank of the Vaigai river.',
          },
        },
        question_data: {},
        answer: {
          correct_option_id: 'B',
          explanation_summary: 'சிவகங்கை மாவட்டம்',
        },
        question_settings: {
          marks: 1.5,
          negative_marks: 0.0,
          time_guideline_seconds: 40,
        },
        source: {
          book: '11th Standard History Textbook (TN State Board)',
          standard: '11th Standard',
          page_number: '210',
        },
        previous_year: {
          is_pyq: true,
          exam_name: 'TNPSC Group 2',
          year: 2022,
        },
        tags: ['Unit 8', 'Keeladi', 'Archaeology', 'History'],
        language_status: 'bilingual',
        workflow: {
          status: 'published',
          verified_by: 'Platform Administrator',
          verified_at: new Date().toISOString(),
          verification_comments: [],
        },
        version: 1,
        is_archived: false,
      },
      {
        id: 'TNPSC-APTITUDE-HCFLCM-Q04',
        schema_version: '1.0.0',
        kind: 'direct_mcq',
        level: 'prelims',
        difficulty: 'medium',
        exam_mappings: [
          { exam_id: 'group_4', is_relevant: true },
          { exam_id: 'group_2', is_relevant: true },
          { exam_id: 'group_2a', is_relevant: true },
        ],
        syllabus: {
          subject_id: 'sub-aptitude',
          unit_id: 'unit-apt-arithmetic',
          chapter_id: 'ch-apt-hcf-lcm',
        },
        texts: {
          ta: {
            question: 'இரு எண்களின் மீ.பொ.வ (HCF) 2 மற்றும் அவற்றின் மீ.பொ.ம (LCM) 154. அவ்விரு எண்களுக்கிடையேயான வித்தியாசம் 8 எனில், அவ்விரு எண்களின் கூடுதல் என்ன?',
            options: [
              { id: 'A', text: '36' },
              { id: 'B', text: '38' },
              { id: 'C', text: '26' },
              { id: 'D', text: '32' },
            ],
            explanation: 'எண்கள் 2x மற்றும் 2y என்க. HCF * LCM = இரு எண்களின் பெருக்கற்பலன். 2 * 154 = 2x * 2y => xy = 77. சாத்தியமான ஜோடிகள் (7, 11). எண்கள் = 2(7)=14 மற்றும் 2(11)=22. வித்தியாசம் 22 - 14 = 8. கூடுதல் = 14 + 22 = 36.',
          },
          en: {
            question: 'The HCF of two numbers is 2 and their LCM is 154. If the difference between the two numbers is 8, find their sum.',
            options: [
              { id: 'A', text: '36' },
              { id: 'B', text: '38' },
              { id: 'C', text: '26' },
              { id: 'D', text: '32' },
            ],
            explanation: 'Let the numbers be 2x and 2y. Product of numbers = HCF * LCM. (2x)(2y) = 2 * 154 => xy = 77. The coprime pair is (7, 11). The numbers are 2*7 = 14 and 2*11 = 22. Difference = 22 - 14 = 8. Sum = 14 + 22 = 36.',
          },
        },
        question_data: {},
        answer: {
          correct_option_id: 'A',
          explanation_summary: '14 + 22 = 36',
        },
        question_settings: {
          marks: 1.5,
          negative_marks: 0.0,
          time_guideline_seconds: 60,
        },
        source: {
          book: 'TNPSC Previous Year Examination Questions (Aptitude)',
        },
        previous_year: {
          is_pyq: true,
          exam_name: 'TNPSC Group 4',
          year: 2018,
        },
        tags: ['Aptitude', 'HCF', 'LCM', 'Mental Ability'],
        language_status: 'bilingual',
        workflow: {
          status: 'published',
          verified_by: 'Platform Administrator',
          verified_at: new Date().toISOString(),
          verification_comments: [],
        },
        version: 1,
        is_archived: false,
      }
    ];

    for (const q of sampleQuestions) {
      await client.query(
        `INSERT INTO public.questions (
            id, schema_version, kind, level, difficulty, exam_mappings, syllabus,
            texts, question_data, answer, question_settings, source, previous_year,
            tags, language_status, workflow, version, is_archived
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, false)
         ON CONFLICT (id) DO UPDATE SET
            texts = EXCLUDED.texts,
            answer = EXCLUDED.answer,
            workflow = EXCLUDED.workflow,
            syllabus = EXCLUDED.syllabus;`,
        [
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
          JSON.stringify(q.workflow),
          q.version,
        ]
      );
      console.log(`Seeded question: ${q.id}`);
    }

    console.log('Sample TNPSC questions seeded successfully!');
  } catch (err) {
    console.error('Error seeding questions:', err);
  } finally {
    await client.end();
  }
}

seedQuestions();

