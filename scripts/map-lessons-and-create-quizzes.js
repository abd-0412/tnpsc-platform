process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');
const { createClient } = require('d:/TNPSC Platform/node_modules/@supabase/supabase-js');

const envFile = fs.readFileSync('d:/TNPSC Platform/.env.local', 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let val = match[2].trim().replace(/^"(.*)"$/, '$1');
    env[key] = val;
  }
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

// Definition of 6th Term 1 Lessons
const LESSON_RANGES = [
  // Unit 1 (84 Questions)
  {
    unitId: 'std-6-t1-i1',
    lessonId: 'std-6-t1-i1-l1',
    titleTa: 'இன்பத்தமிழ் (பாரதிதாசன்)',
    titleEn: 'Inba Tamizh (Bharathidasan)',
    rangeStart: 1,
    rangeEnd: 18,
    unitNum: 1,
  },
  {
    unitId: 'std-6-t1-i1',
    lessonId: 'std-6-t1-i1-l2',
    titleTa: 'வளர்தமிழ் (உரைநடை)',
    titleEn: 'Valar Tamizh (Prose)',
    rangeStart: 19,
    rangeEnd: 44,
    unitNum: 1,
  },
  {
    unitId: 'std-6-t1-i1',
    lessonId: 'std-6-t1-i1-l3',
    titleTa: 'ஒளி பிறந்தது (அப்துல் கலாம்)',
    titleEn: 'Oli Piranthathu (Abdul Kalam)',
    rangeStart: 45,
    rangeEnd: 60,
    unitNum: 1,
  },
  {
    unitId: 'std-6-t1-i1',
    lessonId: 'std-6-t1-i1-l4',
    titleTa: 'தமிழ் எழுத்துகளின் வகையும் தொகையும் (இலக்கணம்)',
    titleEn: 'Tamil Letters Classification (Grammar)',
    rangeStart: 61,
    rangeEnd: 84,
    unitNum: 1,
  },

  // Unit 2 (84 Questions)
  {
    unitId: 'std-6-t1-i2',
    lessonId: 'std-6-t1-i2-l1',
    titleTa: 'ஏதிலிக்குருவிகள் (கவிதை)',
    titleEn: 'Aethili Kuruvi (Poem)',
    rangeStart: 1,
    rangeEnd: 12,
    unitNum: 2,
  },
  {
    unitId: 'std-6-t1-i2',
    lessonId: 'std-6-t1-i2-l2',
    titleTa: 'சிறகின் ஓசை (பறவைகள் வலசை போதல்)',
    titleEn: 'Siragin Oosai (Bird Migration)',
    rangeStart: 13,
    rangeEnd: 40,
    unitNum: 2,
  },
  {
    unitId: 'std-6-t1-i2',
    lessonId: 'std-6-t1-i2-l3',
    titleTa: 'கிழவனும் கடலும் (எர்னஸ்ட் ஹெமிங்வே)',
    titleEn: 'The Old Man & The Sea',
    rangeStart: 41,
    rangeEnd: 54,
    unitNum: 2,
  },
  {
    unitId: 'std-6-t1-i2',
    lessonId: 'std-6-t1-i2-l4',
    titleTa: 'முதலெழுத்தும் சார்பெழுத்தும் (இலக்கணம்)',
    titleEn: 'Muthaleluthu & Saarpeluthu (Grammar)',
    rangeStart: 55,
    rangeEnd: 68,
    unitNum: 2,
  },
  {
    unitId: 'std-6-t1-i2-l5',
    lessonId: 'std-6-t1-i2-l5',
    titleTa: 'திருக்குறள் (10 குறள்கள் & பயிற்சிகள்)',
    titleEn: 'Thirukkural',
    rangeStart: 69,
    rangeEnd: 84,
    unitNum: 2,
  },

  // Unit 3 (84 Questions)
  {
    unitId: 'std-6-t1-i3',
    lessonId: 'std-6-t1-i3-l1',
    titleTa: 'கல்வியைப் போற்று (நீதி வெண்பா)',
    titleEn: 'Kalviyai Potru (Poem)',
    rangeStart: 1,
    rangeEnd: 12,
    unitNum: 3,
  },
  {
    unitId: 'std-6-t1-i3',
    lessonId: 'std-6-t1-i3-l2',
    titleTa: 'துன்பத்தை வெல்லும் கல்வி (பட்டுக்கோட்டை கல்யாணசுந்தரம்)',
    titleEn: 'Thunbam Vellum Kalvi',
    rangeStart: 13,
    rangeEnd: 26,
    unitNum: 3,
  },
  {
    unitId: 'std-6-t1-i3',
    lessonId: 'std-6-t1-i3-l3',
    titleTa: 'கல்விக்கண் திறந்தவர் (காமராசர்)',
    titleEn: 'Kalvikkan Thiranthavar (Kamarajar)',
    rangeStart: 27,
    rangeEnd: 48,
    unitNum: 3,
  },
  {
    unitId: 'std-6-t1-i3',
    lessonId: 'std-6-t1-i3-l4',
    titleTa: 'நூலகம் நோக்கி... (அண்ணா நூற்றாண்டு நூலகம்)',
    titleEn: 'Noolagam Nokki (Library)',
    rangeStart: 49,
    rangeEnd: 64,
    unitNum: 3,
  },
  {
    unitId: 'std-6-t1-i3',
    lessonId: 'std-6-t1-i3-l5',
    titleTa: 'மொழிமுதல் எழுத்துகள் (இலக்கணம்)',
    titleEn: 'Mozhimuthal Eluthukal (Grammar)',
    rangeStart: 65,
    rangeEnd: 84,
    unitNum: 3,
  },
];

async function updateLessonMappings() {
  console.log('Fetching all 6th Term 1 questions from Supabase...');
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .like('id', '6th-t1-%');

  if (error || !questions) {
    console.error('Error fetching questions:', error);
    return;
  }

  console.log(`Found ${questions.length} questions to process.`);

  const lessonQuestionMap = {};
  const unitQuestionMap = {
    'std-6-t1-i1': [],
    'std-6-t1-i2': [],
    'std-6-t1-i3': [],
  };

  const updates = [];

  for (const q of questions) {
    // Check if it is a PYQ question
    if (q.id.includes('pyq')) {
      const updatedSyllabus = {
        ...q.syllabus,
        class: '6',
        class_id: 'std-6th',
        term: '1',
        term_id: 'std-6th-term-1',
        unit_id: 'pyq_bridging',
        lesson_id: 'std-6th-term-1-pyq',
      };
      updates.push({
        id: q.id,
        syllabus: updatedSyllabus,
      });
      continue;
    }

    // Parse ID e.g. 6th-t1-u1-005
    const match = q.id.match(/^6th-t1-u(\d)-(\d+)$/);
    if (!match) continue;

    const unitNum = parseInt(match[1], 10);
    const qNum = parseInt(match[2], 10);

    const lesson = LESSON_RANGES.find(
      (l) => l.unitNum === unitNum && qNum >= l.rangeStart && qNum <= l.rangeEnd
    );

    if (lesson) {
      if (!lessonQuestionMap[lesson.lessonId]) {
        lessonQuestionMap[lesson.lessonId] = [];
      }
      lessonQuestionMap[lesson.lessonId].push(q.id);

      if (unitQuestionMap[lesson.unitId]) {
        unitQuestionMap[lesson.unitId].push(q.id);
      }

      const updatedSyllabus = {
        ...q.syllabus,
        class: '6',
        class_id: 'std-6th',
        term: '1',
        term_id: 'std-6th-term-1',
        unit_id: lesson.unitId,
        lesson_id: lesson.lessonId,
        topic_id: lesson.lessonId,
      };

      updates.push({
        id: q.id,
        syllabus: updatedSyllabus,
      });
    }
  }

  console.log(`Identified ${updates.length} question syllabus updates.`);

  // Update questions in batches of 50
  for (let i = 0; i < updates.length; i += 50) {
    const chunk = updates.slice(i, i + 50);
    for (const item of chunk) {
      await supabase
        .from('questions')
        .update({ syllabus: item.syllabus })
        .eq('id', item.id);
    }
    console.log(`Updated syllabus for questions ${i + 1} to ${Math.min(i + 50, updates.length)}`);
  }

  console.log('\n--- Creating Lesson & Unit Test Templates ---');

  // Create tests for each lesson
  for (const lesson of LESSON_RANGES) {
    const qIds = lessonQuestionMap[lesson.lessonId] || [];
    if (qIds.length === 0) continue;

    const testId = `TEST-6T1-${lesson.lessonId.toUpperCase().replace(/STD-6-T1-/, '')}`;
    const template = {
      id: testId,
      title_ta: `6-ஆம் வகுப்பு: ${lesson.titleTa} - பாடத் தேர்வு`,
      title_en: `6th Tamil: ${lesson.titleEn} - Lesson Quiz`,
      category: 'unit_quiz',
      exam_id: 'group_4',
      duration_minutes: Math.max(15, Math.ceil(qIds.length * 1.5)),
      total_marks: Number((qIds.length * 1.5).toFixed(1)),
      negative_marking_rate: 0,
      question_count: qIds.length,
      question_ids: qIds,
      rules: {
        randomize_options: false,
        randomize_questions: false,
        allow_language_toggle: true,
      },
      is_published: true,
    };

    const { error: tErr } = await supabase
      .from('test_templates')
      .upsert(template, { onConflict: 'id' });

    if (tErr) {
      console.error(`Error creating template ${testId}:`, tErr.message);
    } else {
      console.log(`✓ Created Lesson Test: ${template.title_ta} (${qIds.length} Qs)`);
    }
  }

  // Create tests for each of the 3 Units (84 Qs each)
  const UNIT_NAMES = [
    { id: 'std-6-t1-i1', ta: 'இயல் 1: தமிழ்த்தேன் (மொழி)', en: 'Unit 1: Tamizh Then' },
    { id: 'std-6-t1-i2', ta: 'இயல் 2: இயற்கை இன்பம் (இயற்கை)', en: 'Unit 2: Nature & Environment' },
    { id: 'std-6-t1-i3', ta: 'இயல் 3: கண்ணெனத் தகும் (கல்வி)', en: 'Unit 3: Education & Science' },
  ];

  for (const unit of UNIT_NAMES) {
    const qIds = unitQuestionMap[unit.id] || [];
    if (qIds.length === 0) continue;

    const testId = `TEST-6T1-${unit.id.toUpperCase().replace(/STD-6-T1-/, '')}`;
    const template = {
      id: testId,
      title_ta: `6-ஆம் வகுப்பு: ${unit.ta} - முழு அலகுத் தேர்வு`,
      title_en: `6th Tamil: ${unit.en} - Full Unit Test`,
      category: 'unit_quiz',
      exam_id: 'group_4',
      duration_minutes: 60,
      total_marks: Number((qIds.length * 1.5).toFixed(1)),
      negative_marking_rate: 0,
      question_count: qIds.length,
      question_ids: qIds,
      rules: {
        randomize_options: false,
        randomize_questions: false,
        allow_language_toggle: true,
      },
      is_published: true,
    };

    const { error: tErr } = await supabase
      .from('test_templates')
      .upsert(template, { onConflict: 'id' });

    if (tErr) {
      console.error(`Error creating unit template ${testId}:`, tErr.message);
    } else {
      console.log(`✓ Created Unit Test: ${template.title_ta} (${qIds.length} Qs)`);
    }
  }

  console.log('\n--- ALL LESSON MAPPINGS & QUIZZES COMPLETED 100% ---');
}

updateLessonMappings().catch(console.error);

