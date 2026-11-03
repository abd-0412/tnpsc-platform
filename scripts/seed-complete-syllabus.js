const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function seedCompleteSyllabus() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database to seed complete Dual-Track Syllabus...');

    // -------------------------------------------------------------------------
    // TRACK 1: OFFICIAL TNPSC EXAMINATION SYLLABUS (From 12.12.2024 Notification)
    // -------------------------------------------------------------------------
    const officialExamSyllabus = [
      // PART A: General Studies (75 Questions)
      {
        id: 'exam-gs',
        level: 'subject',
        title_en: 'Part A: General Studies (75 Questions)',
        title_ta: 'பகுதி அ: பொது அறிவு (75 வினாக்கள்)',
        order_index: 1,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'exam-gs-u1-science',
            level: 'unit',
            title_en: 'Unit I: General Science (5 Questions)',
            title_ta: 'அலகு I: பொது அறிவியல் (5 வினாக்கள்)',
            order_index: 1,
            children: [
              { id: 'exam-gs-u1-physics', level: 'chapter', title_en: 'Physics: Nature of Universe, Mechanics, Electricity, Light, Sound', title_ta: 'இயற்பியல்: பேரண்டத்தின் இயல்பு, இயக்கவியல், மின்னியல், ஒளி, ஒலி', order_index: 1 },
              { id: 'exam-gs-u1-chemistry', level: 'chapter', title_en: 'Chemistry: Elements, Compounds, Acids, Bases, Salts, Petroleum', title_ta: 'வேதியியல்: தனிமங்கள், சேர்மங்கள், அமிலங்கள், காரங்கள், உப்புகள்', order_index: 2 },
              { id: 'exam-gs-u1-biology', level: 'chapter', title_en: 'Biology: Living Organisms, Genetics, Physiology, Nutrition, Human Diseases', title_ta: 'உயிரியல்: உயிரினங்களின் வகைப்பாடு, மரபியல், உடலியங்கியல், நோய்கள்', order_index: 3 },
            ]
          },
          {
            id: 'exam-gs-u2-geography',
            level: 'unit',
            title_en: 'Unit II: Geography of India & TN (5 Questions)',
            title_ta: 'அலகு II: இந்தியாவின் புவியியல் (5 வினாக்கள்)',
            order_index: 2,
            children: [
              { id: 'exam-gs-u2-climate', level: 'chapter', title_en: 'Monsoon, Rainfall, Weather, Climate, Rivers & Water Resources', title_ta: 'பருவமழை, மழைப்பொழிவு, வானிலை, நதிகள் & நீர் வளங்கள்', order_index: 1 },
              { id: 'exam-gs-u2-resources', level: 'chapter', title_en: 'Soil, Minerals, Forest, Wildlife & Disaster Management', title_ta: 'மண், கனிமங்கள், காடுகள், வன உயிரினங்கள் & பேரிடர் மேலாண்மை', order_index: 2 },
            ]
          },
          {
            id: 'exam-gs-u3-history',
            level: 'unit',
            title_en: 'Unit III: History, Culture of India & INM (10 Questions)',
            title_ta: 'அலகு III: இந்திய வரலாறு, பண்பாடு & தேசிய இயக்கம் (10 வினாக்கள்)',
            order_index: 3,
            children: [
              { id: 'exam-gs-u3-ancient', level: 'chapter', title_en: 'Indus Valley, Guptas, Delhi Sultans, Mughals, Marathas & South Indian History', title_ta: 'சிந்து சமவெளி, குப்தர்கள், தில்லி சுல்தான்கள், முகலாயர்கள் & தென்னிந்திய வரலாறு', order_index: 1 },
              { id: 'exam-gs-u3-inm', level: 'chapter', title_en: 'National Renaissance, Early Uprisings, INC & National Leaders (Ambedkar, Gandhi, Nehru, Periyar, Bharathi)', title_ta: 'தேசிய மறுமலர்ச்சி, தொடக்க கால எழுச்சிகள் & தேசியத் தலைவர்கள்', order_index: 2 },
            ]
          },
          {
            id: 'exam-gs-u4-polity',
            level: 'unit',
            title_en: 'Unit IV: Indian Polity (15 Questions)',
            title_ta: 'அலகு IV: இந்திய ஆட்சியியல் (15 வினாக்கள்)',
            order_index: 4,
            children: [
              { id: 'exam-gs-u4-constitution', level: 'chapter', title_en: 'Preamble, Salient Features, Citizenship, FR, FD & DPSP', title_ta: 'அரசியலமைப்பு முகப்புரை, முக்கிய கூறுகள், அடிப்படை உரிமைகள் & கடமைகள்', order_index: 1 },
              { id: 'exam-gs-u4-governance', level: 'chapter', title_en: 'Executive, Parliament, State Legislature, Panchayati Raj, Judiciary & Anti-Corruption (Lokpal, RTI)', title_ta: 'நாடாளுமன்றம், சட்டமன்றம், பஞ்சாயத்து ராஜ், நீதித்துறை, லோக்பால் & தகவல் உரிமை', order_index: 2 },
            ]
          },
          {
            id: 'exam-gs-u5-economy',
            level: 'unit',
            title_en: 'Unit V: Indian Economy & TN Development Administration (20 Questions)',
            title_ta: 'அலகு V: இந்தியப் பொருளாதாரம் & தமிழ்நாட்டில் வளர்ச்சி நிர்வாகம் (20 வினாக்கள்)',
            order_index: 5,
            children: [
              { id: 'exam-gs-u5-economy-core', level: 'chapter', title_en: 'Five Year Plans, Niti Aayog, RBI, Finance Commission, GST & Budgeting', title_ta: 'ஐந்தாண்டு திட்டங்கள், நிதி ஆயோக், ரிசர்வ் வங்கி, ஜி.எஸ்.டி (GST) & நிதிப் பகிர்வு', order_index: 1 },
              { id: 'exam-gs-u5-tn-admin', level: 'chapter', title_en: 'TN Human Development Index, Social Justice, Welfare Schemes & E-Governance', title_ta: 'தமிழ்நாட்டின் மனிதவள குறியீடுகள், சமூக நீதி, நலத்திட்டங்கள் & மின்னாளுமை', order_index: 2 },
            ]
          },
          {
            id: 'exam-gs-u6-tn-culture',
            level: 'unit',
            title_en: 'Unit VI: History, Culture, Heritage & Socio-Political Movements of TN (20 Questions)',
            title_ta: 'அலகு VI: தமிழ்நாட்டின் வரலாறு, பண்பாடு, மரபு & இயக்கங்கள் (20 வினாக்கள்)',
            order_index: 6,
            children: [
              { id: 'exam-gs-u6-archaeology', level: 'chapter', title_en: 'History of Tamil Society, Keeladi Excavations & Sangam to Modern Tamil Literature', title_ta: 'தமிழ் சமுதாய வரலாறு, கீழடி அகழாய்வுகள் & சங்க காலம் முதல் இக்காலம் வரை', order_index: 1 },
              { id: 'exam-gs-u6-thirukkural', level: 'chapter', title_en: 'Thirukkural: Secular Nature, Humanity, Universal Values & Philosophical Content', title_ta: 'திருக்குறள்: மதச்சார்பற்ற இலக்கியம், வாழ்வியல் தொடர்பு & தத்துவக் கோட்பாடுகள்', order_index: 2 },
              { id: 'exam-gs-u6-freedom-dravidian', level: 'chapter', title_en: 'Role of TN in Freedom Struggle, Women in Freedom Struggle, Self-Respect & Dravidian Movement', title_ta: 'விடுதலைப் போராட்டத்தில் தமிழகத்தின் பங்கு, சுயமரியாதை இயக்கம் & நீதிக்கட்சி', order_index: 3 },
            ]
          }
        ]
      },

      // PART B: Aptitude & Mental Ability (25 Questions)
      {
        id: 'exam-aptitude',
        level: 'subject',
        title_en: 'Part B: Aptitude & Mental Ability (25 Questions)',
        title_ta: 'பகுதி ஆ: திறனறிவும் மனக்கணக்கு நுண்ணறிவும் (25 வினாக்கள்)',
        order_index: 2,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'exam-apt-u1-arithmetic',
            level: 'unit',
            title_en: 'Unit I: Aptitude (15 Questions)',
            title_ta: 'அலகு I: திறனறிவு (15 வினாக்கள்)',
            order_index: 1,
            children: [
              { id: 'exam-apt-simplification', level: 'chapter', title_en: 'Simplification & Percentage', title_ta: 'சுருக்குதல் மற்றும் விழுக்காடு (Percentage)', order_index: 1 },
              { id: 'exam-apt-hcflcm', level: 'chapter', title_en: 'HCF and LCM', title_ta: 'மீப்பெரு பொதுக் காரணி (HCF) & மீச்சிறு பொது மடங்கு (LCM)', order_index: 2 },
              { id: 'exam-apt-ratio', level: 'chapter', title_en: 'Ratio and Proportion', title_ta: 'விகிதம் மற்றும் விகிதாச்சாரம்', order_index: 3 },
              { id: 'exam-apt-interest', level: 'chapter', title_en: 'Simple Interest & Compound Interest', title_ta: 'தனிவட்டி மற்றும் கூட்டு வட்டி', order_index: 4 },
              { id: 'exam-apt-time-work', level: 'chapter', title_en: 'Area, Volume, Time and Work', title_ta: 'பரப்பு, கொள்ளளவு, காலம் மற்றும் வேலை', order_index: 5 },
            ]
          },
          {
            id: 'exam-apt-u2-reasoning',
            level: 'unit',
            title_en: 'Unit II: Reasoning (10 Questions)',
            title_ta: 'அலகு II: காரணவியல் (10 வினாக்கள்)',
            order_index: 2,
            children: [
              { id: 'exam-apt-logical', level: 'chapter', title_en: 'Logical Reasoning, Puzzles & Dice', title_ta: 'தருக்கக் காரணவியல், புதிர்கள் மற்றும் பகடை (Dice)', order_index: 1 },
              { id: 'exam-apt-visual', level: 'chapter', title_en: 'Visual Reasoning, Alpha Numeric & Number Series', title_ta: 'காட்சி காரணவியல், எண் எழுத்துக் காரணவியல் & எண் வரிசை', order_index: 2 },
            ]
          }
        ]
      },

      // PART C: General Tamil Eligibility-cum-Scoring (100 Questions)
      {
        id: 'exam-tamil-100',
        level: 'subject',
        title_en: 'Part C: General Tamil (100 Questions)',
        title_ta: 'பகுதி இ: பொதுத் தமிழ் (100 வினாக்கள்)',
        order_index: 3,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'exam-ta-u1-grammar',
            level: 'unit',
            title_en: 'Unit I: Grammar (25 Questions)',
            title_ta: 'அலகு I: இலக்கணம் (25 வினாக்கள்)',
            order_index: 1,
            children: [
              { id: 'exam-ta-eluthu', level: 'chapter', title_en: 'Letters: Sandhi, Kuril/Nedil, La/Zha/La diff, Ina Eluthukal', title_ta: 'எழுத்து: சந்திப்பிழை, குறில் நெடில், லகர ளகர ழகர வேறுபாடு', order_index: 1 },
              { id: 'exam-ta-sol', level: 'chapter', title_en: 'Words: Root word, Vinaimutru, Vinayecham, Peyarecham, Plural error', title_ta: 'சொல்: வேர்ச்சொல், வினைமுற்று, வினையெச்சம், பெயரெச்சம், பிழை திருத்தம்', order_index: 2 },
            ]
          },
          {
            id: 'exam-ta-u2-vocab',
            level: 'unit',
            title_en: 'Unit II: Vocabulary & Dictionary (15 Questions)',
            title_ta: 'அலகு II: சொல்லகராதி (15 வினாக்கள்)',
            order_index: 2,
            children: [
              { id: 'exam-ta-vocab-antonyms', level: 'chapter', title_en: 'Antonyms, Orezhuthu Oru Mozhi, Alphabetical sorting, Colloquial vs Formal', title_ta: 'எதிர்ச்சொல், ஓரெழுத்து ஒரு மொழி, அகர வரிசை, பேச்சு வழக்கு தூய தமிழ்', order_index: 1 },
              { id: 'exam-ta-vocab-blanks', level: 'chapter', title_en: 'Fill in the blanks, Connectors, Words with multiple meanings', title_ta: 'கோடிட்ட இடம் நிரப்புதல், இணைப்புச் சொற்கள் & ஒரு சொல் பல பொருள்', order_index: 2 },
            ]
          },
          {
            id: 'exam-ta-u3-writing',
            level: 'unit',
            title_en: 'Unit III: Writing Skills & Idioms (15 Questions)',
            title_ta: 'அலகு III: எழுதும் திறன் (15 வினாக்கள்)',
            order_index: 3,
            children: [
              { id: 'exam-ta-sentences', level: 'chapter', title_en: 'Sentence Ordering, Active/Passive Voice, Direct/Indirect', title_ta: 'சொற்களை ஒழுங்குபடுத்தி சொற்றொடர் அமைத்தல், செய்வினை செயப்பாட்டு வினை', order_index: 1 },
              { id: 'exam-ta-marabu', level: 'chapter', title_en: 'Marabu Tamil: Thinai, Paal, Kaalam, Young ones names, Sound idiomatic usage, Punctuations', title_ta: 'மரபுத் தமிழ்: திணை, பால், காலம், இளமைப் பெயர், ஒலிமரபு & நிறுத்தற்குறிகள்', order_index: 2 },
            ]
          },
          {
            id: 'exam-ta-u4-technical',
            level: 'unit',
            title_en: 'Unit IV: Technical Terms (10 Questions)',
            title_ta: 'அலகு IV: கலைச் சொற்கள் (10 வினாக்கள்)',
            order_index: 4,
            children: [
              { id: 'exam-ta-tech-terms', level: 'chapter', title_en: 'Technical terminology across Science, Law, IT, Medicine & Administration', title_ta: 'அறிவியல், கல்வி, மருத்துவம், மேலாண்மை, சட்டம் துறைசார் கலைச்சொற்கள்', order_index: 1 },
            ]
          },
          {
            id: 'exam-ta-u5-reading',
            level: 'unit',
            title_en: 'Unit V: Reading Comprehension (15 Questions)',
            title_ta: 'அலகு V: வாசித்தல் – புரிந்து கொள்ளும் திறன் (15 வினாக்கள்)',
            order_index: 5,
            children: [
              { id: 'exam-ta-comprehension', level: 'chapter', title_en: 'Passage Comprehension, Editorial understanding, Proverbs & Similes', title_ta: 'பத்தி வினாக்கள், உவமைத் தொடர், மரபுத்தொடர் & பழமொழிகள்', order_index: 1 },
            ]
          },
          {
            id: 'exam-ta-u6-translation',
            level: 'unit',
            title_en: 'Unit VI: Simple Translation (5 Questions)',
            title_ta: 'அலகு VI: எளிய மொழி பெயர்ப்பு (5 வினாக்கள்)',
            order_index: 6,
            children: [
              { id: 'exam-ta-trans', level: 'chapter', title_en: 'Everyday English-to-Tamil word and document title translation', title_ta: 'ஆங்கிலம் மற்றும் பிறமொழிச் சொற்களுக்கு இணையான தமிழ்ச் சொற்கள்', order_index: 1 },
            ]
          },
          {
            id: 'exam-ta-u7-literature',
            level: 'unit',
            title_en: 'Unit VII: Literature, Tamil Scholars & Service (15 Questions)',
            title_ta: 'அலகு VII: இலக்கியம், தமிழ் அறிஞர்களும், தமிழ்த்தொண்டும் (15 வினாக்கள்)',
            order_index: 7,
            children: [
              { id: 'exam-ta-thirukkural-20', level: 'chapter', title_en: 'Thirukkural (20 Prescribed Adhikarams) & Ethical Literature (Naladiyar, Nanmanikadikai etc.)', title_ta: 'திருக்குறள் (20 அதிகாரங்கள்) & அறநூல்கள் (நாலடியார், நான்மணிக்கடிகை, இன்னா நாற்பது)', order_index: 1 },
              { id: 'exam-ta-scholars-service', level: 'chapter', title_en: 'Tamil Scholars & Renaissance Leaders (U.Ve.Sa, Devaneya Pavanar, Bharathiyar, Bharathidasan, Periyar, Anna)', title_ta: 'தமிழ் அறிஞர்களும் தமிழ்த் தொண்டும் (உ.வே.சா, பாரதி, பாரதிதாசன், கண்ணதாசன், வா.உ.சி)', order_index: 2 },
            ]
          }
        ]
      }
    ];

    // -------------------------------------------------------------------------
    // TRACK 2: SAMACHEER KALVI SCHOOL TEXTBOOKS (Standard -> Term -> Iyal -> Lesson)
    // -------------------------------------------------------------------------
    const schoolBookSyllabus = [
      // 6th Standard (ஆறாம் வகுப்பு)
      {
        id: 'std-6th',
        level: 'class',
        title_en: '6th Standard Samacheer Kalvi',
        title_ta: '6-ஆம் வகுப்பு (சமச்சீர் பாடநூல்)',
        order_index: 6,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          // Term 1 (பருவம் 1)
          {
            id: 'std-6th-term-1',
            level: 'term',
            title_en: '6th Standard - Term 1',
            title_ta: 'ஆறாம் வகுப்பு - முதல் பருவம்',
            order_index: 1,
            children: [
              // Iyal 1
              {
                id: 'std-6-t1-iyal-1',
                level: 'unit',
                title_en: 'Iyal 1: Tamizh Then (தமிழ்த்தேன்)',
                title_ta: 'இயல் 1: தமிழ்த்தேன்',
                order_index: 1,
                children: [
                  { id: 'std-6-t1-i1-les-1', level: 'lesson', title_en: 'Inba Tamizh (Poem - Bharathidasan)', title_ta: 'இன்பத்தமிழ் (செய்யுள் - பாரதிதாசன்)', order_index: 1 },
                  { id: 'std-6-t1-i1-les-2', level: 'lesson', title_en: 'Tamizh Kummi (Poem - Perunchithiranar)', title_ta: 'தமிழ்க்கும்மி (செய்யுள் - பெருஞ்சித்திரனார்)', order_index: 2 },
                  { id: 'std-6-t1-i1-les-3', level: 'lesson', title_en: 'Valar Tamizh (Prose)', title_ta: 'வளர்தமிழ் (உரைநடை)', order_index: 3 },
                  { id: 'std-6-t1-i1-les-4', level: 'lesson', title_en: 'Kanavu Palithathu (Letter - Supplementary)', title_ta: 'கனவு பலித்தது (துணைப்பாடம் / கடிதம்)', order_index: 4 },
                  { id: 'std-6-t1-i1-les-5', level: 'lesson', title_en: 'Tamizh Letters Classification & Metrics (Grammar)', title_ta: 'தமிழ் எழுத்துகளின் வகை தொகை (இலக்கணம்)', order_index: 5 },
                ]
              },
              // Iyal 2
              {
                id: 'std-6-t1-iyal-2',
                level: 'unit',
                title_en: 'Iyal 2: Iyarkkai Inbam (இயற்கை இன்பம்)',
                title_ta: 'இயல் 2: இயற்கை இன்பம்',
                order_index: 2,
                children: [
                  { id: 'std-6-t1-i2-les-1', level: 'lesson', title_en: 'Silappathikaram (Thingalai Potruthum - Ilango Adigal)', title_ta: 'சிலப்பதிகாரம் (திங்களைப் போற்றுதும் - இளங்கோவடிகள்)', order_index: 1 },
                  { id: 'std-6-t1-i2-les-2', level: 'lesson', title_en: 'Kaani Nilam (Poem - Bharathiyar)', title_ta: 'காணி நிலம் (செய்யுள் - பாரதியார்)', order_index: 2 },
                  { id: 'std-6-t1-i2-les-3', level: 'lesson', title_en: 'Siragin Oosai (Bird Migration - Prose)', title_ta: 'சிறகின் ஓசை (பறவைகள் வலசை போதல் - உரைநடை)', order_index: 3 },
                  { id: 'std-6-t1-i2-les-4', level: 'lesson', title_en: 'Kilavanum Kadalum (The Old Man & The Sea)', title_ta: 'கிழவனும் கடலும் (துணைப்பாடம் - எர்னஸ்ட் ஹெமிங்வே)', order_index: 4 },
                  { id: 'std-6-t1-i2-les-5', level: 'lesson', title_en: 'Muthaleluthum Saarpeluthum (Grammar)', title_ta: 'முதலெழுத்தும் சார்பெழுத்தும் (இலக்கணம்)', order_index: 5 },
                ]
              },
              // Iyal 3
              {
                id: 'std-6-t1-iyal-3',
                level: 'unit',
                title_en: 'Iyal 3: Enthira Ulagam (எந்திர உலகம்)',
                title_ta: 'இயல் 3: எந்திர உலகம்',
                order_index: 3,
                children: [
                  { id: 'std-6-t1-i3-les-1', level: 'lesson', title_en: 'Ariviyal Aathichudi (Nellai S. Muthu)', title_ta: 'அறிவியல் ஆத்திசூடி (செய்யுள் - நெல்லை சு.முத்து)', order_index: 1 },
                  { id: 'std-6-t1-i3-les-2', level: 'lesson', title_en: 'Ariviyalaal Aazhvom (Science Poem)', title_ta: 'அறிவியலால் ஆள்வோம் (செய்யுள்)', order_index: 2 },
                  { id: 'std-6-t1-i3-les-3', level: 'lesson', title_en: 'Kanippori Ulagam (Computers & AI - Prose)', title_ta: 'கணிப்பொறி உலகம் & ரோபோ (உரைநடை)', order_index: 3 },
                  { id: 'std-6-t1-i3-les-4', level: 'lesson', title_en: 'Oli Piranthathu (Dr. APJ Abdul Kalam Interview)', title_ta: 'ஒளி பிறந்தது (அப்துல் கலாம் நேர்காணல்)', order_index: 4 },
                  { id: 'std-6-t1-i3-les-5', level: 'lesson', title_en: 'Mozhimuthal & Iruthi Eluthukal (Grammar)', title_ta: 'மொழிமுதல், இறுதி எழுத்துகள் (இலக்கணம்)', order_index: 5 },
                ]
              }
            ]
          },
          // Term 2 (பருவம் 2)
          {
            id: 'std-6th-term-2',
            level: 'term',
            title_en: '6th Standard - Term 2',
            title_ta: 'ஆறாம் வகுப்பு - இரண்டாம் பருவம்',
            order_index: 2,
            children: [
              // Iyal 4
              {
                id: 'std-6-t2-iyal-4',
                level: 'unit',
                title_en: 'Iyal 4: Kalvikkan Thiranthavar (கல்விக்கண் திறந்தவர்)',
                title_ta: 'இயல் 4: கல்விக்கண் திறந்தவர்',
                order_index: 1,
                children: [
                  { id: 'std-6-t2-i4-les-1', level: 'lesson', title_en: 'Moodhurai (Avvaiyar)', title_ta: 'மூதுரை (செய்யுள் - ஔவையார்)', order_index: 1 },
                  { id: 'std-6-t2-i4-les-2', level: 'lesson', title_en: 'Thunbam Vellum Kalvi (Pattukottai Kalyanasundaram)', title_ta: 'துன்பம் வெல்லும் கல்வி (பட்டுக்கோட்டை கல்யாணசுந்தரம்)', order_index: 2 },
                  { id: 'std-6-t2-i4-les-3', level: 'lesson', title_en: 'Kalvikkan Thiranthavar (Kamarajar - Prose)', title_ta: 'கல்விக்கண் திறந்தவர் (காமராசர் - உரைநடை)', order_index: 3 },
                  { id: 'std-6-t2-i4-les-4', level: 'lesson', title_en: 'Noolagam Nokki (Anna Centenary Library)', title_ta: 'நூலகம் நோக்கி (அண்ணா நூற்றாண்டு நூலகம்)', order_index: 4 },
                  { id: 'std-6-t2-i4-les-5', level: 'lesson', title_en: 'Ina Eluthukal (Grammar)', title_ta: 'இனவெழுத்துகள் (இலக்கணம்)', order_index: 5 },
                ]
              },
              // Iyal 5
              {
                id: 'std-6-t2-iyal-5',
                level: 'unit',
                title_en: 'Iyal 5: Paadarinthu Ozhuguthal (பாடறிந்து ஒழுகுதல்)',
                title_ta: 'இயல் 5: பாடறிந்து ஒழுகுதல்',
                order_index: 2,
                children: [
                  { id: 'std-6-t2-i5-les-1', level: 'lesson', title_en: 'Aasaarakkovai (Peruvayin Mulliyar)', title_ta: 'ஆசாரக்கோவை (பெருவாயின் முள்ளியார்)', order_index: 1 },
                  { id: 'std-6-t2-i5-les-2', level: 'lesson', title_en: 'Kanmaniye Kannurangu (Lullaby Folklore)', title_ta: 'கண்மணியே கண்ணுறங்கு (நாட்டுப்புறப் பாடல்)', order_index: 2 },
                  { id: 'std-6-t2-i5-les-3', level: 'lesson', title_en: 'Tamizhar Peruvezha (Pongal Festival - Prose)', title_ta: 'தமிழர் பெருவிழா (பொங்கல் விழா உரைநடை)', order_index: 3 },
                  { id: 'std-6-t2-i5-les-4', level: 'lesson', title_en: 'Manam Kavarntha Mamallapuram (Sculptures)', title_ta: 'மனம் கவரும் மாமல்லபுரம் (சிற்பக்கலை)', order_index: 4 },
                  { id: 'std-6-t2-i5-les-5', level: 'lesson', title_en: 'Mayangoligal (Grammar)', title_ta: 'மயங்கொலிகள் (இலக்கணம்)', order_index: 5 },
                ]
              },
              // Iyal 6
              {
                id: 'std-6-t2-iyal-6',
                level: 'unit',
                title_en: 'Iyal 6: Koodi Thozhil Sei (கூடித் தொழில் செய்)',
                title_ta: 'இயல் 6: கூடித் தொழில் செய்',
                order_index: 3,
                children: [
                  { id: 'std-6-t2-i6-les-1', level: 'lesson', title_en: 'Naanilam Padaithavan (Mudiyarasan)', title_ta: 'நானிலம் படைத்தவன் (செய்யுள் - முடியரசன்)', order_index: 1 },
                  { id: 'std-6-t2-i6-les-2', level: 'lesson', title_en: 'Kadalodu Vilaiyaadu (Fishermen Song)', title_ta: 'கடலோடு விளையாடு (நாட்டுப்புறப் பாடல்)', order_index: 2 },
                  { id: 'std-6-t2-i6-les-3', level: 'lesson', title_en: 'Valarum Vanigam (Trade & Commerce - Prose)', title_ta: 'வளரும் வணிகம் (உரைநடை)', order_index: 3 },
                  { id: 'std-6-t2-i6-les-4', level: 'lesson', title_en: 'Uzhaippe Moolathanam (Supplementary)', title_ta: 'உழைப்பே மூலதனம் (துணைப்பாடம்)', order_index: 4 },
                  { id: 'std-6-t2-i6-les-5', level: 'lesson', title_en: 'Suttu & Vina Eluthukal (Grammar)', title_ta: 'சுட்டு எழுத்துகளும் வினா எழுத்துகளும் (இலக்கணம்)', order_index: 5 },
                ]
              }
            ]
          },
          // Term 3 (பருவம் 3)
          {
            id: 'std-6th-term-3',
            level: 'term',
            title_en: '6th Standard - Term 3',
            title_ta: 'ஆறாம் வகுப்பு - மூன்றாம் பருவம்',
            order_index: 3,
            children: [
              // Iyal 7
              {
                id: 'std-6-t3-iyal-7',
                level: 'unit',
                title_en: 'Iyal 7: Puthumaigal Seiyum Desamithu (புதுமைகள் செய்யும் தேசமிது)',
                title_ta: 'இயல் 7: புதுமைகள் செய்யும் தேசமிது',
                order_index: 1,
                children: [
                  { id: 'std-6-t3-i7-les-1', level: 'lesson', title_en: 'Bharatham Anraiya Naatrangal (Thara Bharathi)', title_ta: 'பாரதம் அன்றைய நாற்றங்கால் (தாராபாரதி)', order_index: 1 },
                  { id: 'std-6-t3-i7-les-2', level: 'lesson', title_en: 'Tamilnattil Gandhi (Prose)', title_ta: 'தமிழ்நாட்டில் காந்தி (உரைநடை)', order_index: 2 },
                  { id: 'std-6-t3-i7-les-3', level: 'lesson', title_en: 'Velunachiyar (Veeramangai Velunachiyar)', title_ta: 'வேலுநாச்சியார் (வீரமங்கை வேலுநாச்சியார்)', order_index: 3 },
                  { id: 'std-6-t3-i7-les-4', level: 'lesson', title_en: 'Naalvakai Sorkal (Grammar)', title_ta: 'நால்வகைச் சொற்கள் (இலக்கணம்)', order_index: 4 },
                ]
              },
              // Iyal 8
              {
                id: 'std-6-t3-iyal-8',
                level: 'unit',
                title_en: 'Iyal 8: Ellarum Inbura (எல்லாரும் இன்புற)',
                title_ta: 'இயல் 8: எல்லாரும் இன்புற',
                order_index: 2,
                children: [
                  { id: 'std-6-t3-i8-les-1', level: 'lesson', title_en: 'Paraaparak Kanni (Thayumanavar)', title_ta: 'பராபரக் கண்ணி (தாயுமானவர்)', order_index: 1 },
                  { id: 'std-6-t3-i8-les-2', level: 'lesson', title_en: 'Neengal Nallavar (Kahlil Gibran)', title_ta: 'நீங்கள் நல்லவர் (கலீல் ஜிப்ரான்)', order_index: 2 },
                  { id: 'std-6-t3-i8-les-3', level: 'lesson', title_en: 'Pasipini Pokkiya Paavai (Manimegalai)', title_ta: 'பசிப்பிணி போக்கிய பாவை (மணிமேகலை)', order_index: 3 },
                  { id: 'std-6-t3-i8-les-4', level: 'lesson', title_en: 'Paatham (S. Ramakrishnan Short Story)', title_ta: 'பாதம் (எஸ். ராமகிருஷ்ணன் சிறுகதை)', order_index: 4 },
                  { id: 'std-6-t3-i8-les-5', level: 'lesson', title_en: 'Peyarsol Vagai (Grammar)', title_ta: 'பெயர்ச்சொல் வகைகள் (இலக்கணம்)', order_index: 5 },
                ]
              },
              // Iyal 9
              {
                id: 'std-6-t3-iyal-9',
                level: 'unit',
                title_en: 'Iyal 9: Innuyir Kaappom (இன்னுயிர் காப்போம்)',
                title_ta: 'இயல் 9: இன்னுயிர் காப்போம்',
                order_index: 3,
                children: [
                  { id: 'std-6-t3-i9-les-1', level: 'lesson', title_en: 'Aasiya Jothi (Kavimani Desika Vinayagam Pillai)', title_ta: 'ஆசிய ஜோதி (கவிமணி தேசிக விநாயகம் பிள்ளை)', order_index: 1 },
                  { id: 'std-6-t3-i9-les-2', level: 'lesson', title_en: 'Manitha Neyam (Mother Teresa & Kailash Satyarthi)', title_ta: 'மனிதநேயம் (அன்னை தெரசா, கைலாஷ் சத்யார்த்தி)', order_index: 2 },
                  { id: 'std-6-t3-i9-les-3', level: 'lesson', title_en: 'Oru Puliyamarathin Kathai (Sundara Ramasamy)', title_ta: 'ஒரு புளியமரத்தின் கதை (துணைப்பாடம்)', order_index: 3 },
                  { id: 'std-6-t3-i9-les-4', level: 'lesson', title_en: 'Ani Ilakkanam (Grammar - Iyalbu Navirtchi & Uyarvu Navirtchi)', title_ta: 'அணி இலக்கணம் (இயல்பு நவிற்சி, உயர்வு நவிற்சி அணி)', order_index: 4 },
                ]
              }
            ]
          }
        ]
      },

      // 7th Standard (7-ஆம் வகுப்பு)
      {
        id: 'std-7th',
        level: 'class',
        title_en: '7th Standard Samacheer Kalvi',
        title_ta: '7-ஆம் வகுப்பு (சமச்சீர் பாடநூல்)',
        order_index: 7,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'std-7th-term-1',
            level: 'term',
            title_en: '7th Standard - Term 1',
            title_ta: 'ஏழாம் வகுப்பு - முதல் பருவம்',
            order_index: 1,
            children: [
              { id: 'std-7-t1-i1', level: 'unit', title_en: 'Iyal 1: Mozhi (எங்கள் தமிழ் - நாமக்கல் கவிஞர்)', title_ta: 'இயல் 1: எங்கள் தமிழ் (நாமக்கல் கவிஞர்)', order_index: 1 },
              { id: 'std-7-t1-i2', level: 'unit', title_en: 'Iyal 2: Iyarkkai (காடு - சுரதா)', title_ta: 'இயல் 2: இயற்கை (காடு - சுரதா)', order_index: 2 },
              { id: 'std-7-t1-i3', level: 'unit', title_en: 'Iyal 3: Naadu & Samugam (புலி தங்கிய குகை)', title_ta: 'இயல் 3: நாடு மற்றும் சமூகம் (புலி தங்கிய குகை - காவற்பெண்டு)', order_index: 3 },
            ]
          },
          {
            id: 'std-7th-term-2',
            level: 'term',
            title_en: '7th Standard - Term 2',
            title_ta: 'ஏழாம் வகுப்பு - இரண்டாம் பருவம்',
            order_index: 2,
            children: [
              { id: 'std-7-t2-i1', level: 'unit', title_en: 'Iyal 4: Ariviyal (கலங்கரை விளக்கம் - கடியலூர் உருத்திரங்கண்ணனார்)', title_ta: 'இயல் 4: கலங்கரை விளக்கம் (உருத்திரங்கண்ணனார்)', order_index: 1 },
              { id: 'std-7-t2-i2', level: 'unit', title_en: 'Iyal 5: Kalvi (ஓதுவது ஒழியேல்)', title_ta: 'இயல் 5: கல்வி (இன்பத்தமிழ்க் கல்வி - பாரதிதாசன்)', order_index: 2 },
              { id: 'std-7-t2-i3', level: 'unit', title_en: 'Iyal 6: Kalai (ஒருமைப்பாடு)', title_ta: 'இயல் 6: கலை & பண்பாடு (விருந்தோம்பல்)', order_index: 3 },
            ]
          },
          {
            id: 'std-7th-term-3',
            level: 'term',
            title_en: '7th Standard - Term 3',
            title_ta: 'ஏழாம் வகுப்பு - மூன்றாம் பருவம்',
            order_index: 3,
            children: [
              { id: 'std-7-t3-i1', level: 'unit', title_en: 'Iyal 7: Naadagarai (விருந்தோம்பல் - முன்றுரையரையனார்)', title_ta: 'இயல் 7: நாகரிகம், தொழில் (விருந்தோம்பல்)', order_index: 1 },
              { id: 'std-7-t3-i2', level: 'unit', title_en: 'Iyal 8: Aram (அந்திக்காலக் காட்சி)', title_ta: 'இயல் 8: அறநெறிச் சாரம் (முனைப்பாடியார்)', order_index: 2 },
              { id: 'std-7-t3-i3', level: 'unit', title_en: 'Iyal 9: Manitham (மலைப்பொழிவு - கண்ணதாசன்)', title_ta: 'இயல் 9: மனிதநேயம் (மலைப்பொழிவு - கண்ணதாசன்)', order_index: 3 },
            ]
          }
        ]
      },

      // 8th Standard (8-ஆம் வகுப்பு)
      {
        id: 'std-8th',
        level: 'class',
        title_en: '8th Standard Samacheer Kalvi',
        title_ta: '8-ஆம் வகுப்பு (சமச்சீர் பாடநூல்)',
        order_index: 8,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'std-8th-term-1',
            level: 'term',
            title_en: '8th Standard - Full Year (9 Iyals)',
            title_ta: 'எட்டாம் வகுப்பு - முழு பாடநூல்',
            order_index: 1,
            children: [
              { id: 'std-8-i1', level: 'unit', title_en: 'Iyal 1: Tamizh Inbam (தமிழ்மொழி வாழ்த்து - பாரதியார்)', title_ta: 'இயல் 1: தமிழ்மொழி வாழ்த்து (பாரதியார்)', order_index: 1 },
              { id: 'std-8-i2', level: 'unit', title_en: 'Iyal 2: Iyarkkai (ஓடை - வாணிதாசன்)', title_ta: 'இயல் 2: ஓடை (வாணிதாசன்)', order_index: 2 },
              { id: 'std-8-i3', level: 'unit', title_en: 'Iyal 3: Udalaombal (வருமுன் காப்போம் - கவிமணி)', title_ta: 'இயல் 3: உடலோம்பல் (கவிமணி தேசிக விநாயகம்)', order_index: 3 },
              { id: 'std-8-i4', level: 'unit', title_en: 'Iyal 4: Kalvi (கல்வி அழகே அழகு - குமரகுருபரர்)', title_ta: 'இயல் 4: கல்வி அழகே அழகு (குமரகுருபரர்)', order_index: 4 },
              { id: 'std-8-i5', level: 'unit', title_en: 'Iyal 5: Kalai (திருக்குறள் & தேவாரம்)', title_ta: 'இயல் 5: கலை, அழகியல் (திருவெம்பாவை, தேவாரம்)', order_index: 5 },
              { id: 'std-8-i6', level: 'unit', title_en: 'Iyal 6: Thozhil (வளம் பெருகுக - தகடூர் யாத்திரை)', title_ta: 'இயல் 6: வளம் பெருகுக (தகடூர் யாத்திரை)', order_index: 6 },
              { id: 'std-8-i7', level: 'unit', title_en: 'Iyal 7: Veeram (படைவேழம் - ஜெயங்கொண்டார்)', title_ta: 'இயல் 7: படைவேழம் (கலிங்கத்துப்பரணி - ஜெயங்கொண்டார்)', order_index: 7 },
              { id: 'std-8-i8', level: 'unit', title_en: 'Iyal 8: Aram (ஒன்றே குலம் - திருமூலர்)', title_ta: 'இயல் 8: ஒன்றே குலம் (திருமந்திரம் - திருமூலர்)', order_index: 8 },
              { id: 'std-8-i9', level: 'unit', title_en: 'Iyal 9: Manitham (உயிர் குணங்கள் - இறையரசன்)', title_ta: 'இயல் 9: உயிர் குணங்கள் (கன்னிப்பாவை - இறையரசன்)', order_index: 9 },
            ]
          }
        ]
      },

      // 9th Standard (9-ஆம் வகுப்பு)
      {
        id: 'std-9th',
        level: 'class',
        title_en: '9th Standard Samacheer Kalvi',
        title_ta: '9-ஆம் வகுப்பு (சமச்சீர் பாடநூல்)',
        order_index: 9,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'std-9th-full',
            level: 'term',
            title_en: '9th Standard - Full Course (9 Iyals)',
            title_ta: 'ஒன்பதாம் வகுப்பு - முழு பாடநூல் (9 இயல்கள்)',
            order_index: 1,
            children: [
              { id: 'std-9-i1', level: 'unit', title_en: 'Iyal 1: Dravida Mozhikudumbam & Tamil Vidu Thoothu', title_ta: 'இயல் 1: திராவிட மொழிக்குடும்பம் & தமிழ்விடு தூது', order_index: 1 },
              { id: 'std-9-i2', level: 'unit', title_en: 'Iyal 2: Neerintri Amaiyathu Ulagu & Periyapuranam', title_ta: 'இயல் 2: நீரின்றி அமையாது உலகு & பெரியபுராணம் (சேக்கிழார்)', order_index: 2 },
              { id: 'std-9-i3', level: 'unit', title_en: 'Iyal 3: Eru Thazhuvuthal & Manimegalai', title_ta: 'இயல் 3: ஏறு தழுவுதல் (ஜல்லிக்கட்டு) & மணிமேகலை (சீத்தலைச்சாத்தனார்)', order_index: 3 },
              { id: 'std-9-i4', level: 'unit', title_en: 'Iyal 4: Vinnum Thandiya Nambikkai & O Nalinchi', title_ta: 'இயல் 4: விண்ணைத் தாண்டிய நம்பிக்கை & சீவக சிந்தாமணி (திருத்தக்கதேவர்)', order_index: 4 },
              { id: 'std-9-i5', level: 'unit', title_en: 'Iyal 5: Kudumba Vilakku (Bharathidasan) & Sirupanchamoolam', title_ta: 'இயல் 5: குடும்ப விளக்கு (பாரதிதாசன்) & சிறுபஞ்சமூலம் (காரியாசான்)', order_index: 5 },
              { id: 'std-9-i6', level: 'unit', title_en: 'Iyal 6: Sirpakkalai & Ravana Kaviyam (Pulavar Kuzhanthai)', title_ta: 'இயல் 6: சிற்பக்கலை & இராவண காவியம் (புலவர் குழந்தை)', order_index: 6 },
              { id: 'std-9-i7', level: 'unit', title_en: 'Iyal 7: Tholil Nutpam & Seevaka Chinthamani', title_ta: 'இயல் 7: இந்திய தேசிய இராணுவத்தில் தமிழர் பங்கு & சீவக சிந்தாமணி', order_index: 7 },
              { id: 'std-9-i8', level: 'unit', title_en: 'Iyal 8: Periyarin Sinthanaigal & Muthollayiram', title_ta: 'இயல் 8: பெரியாரின் சிந்தனைகள் & முத்தொள்ளாயிரம்', order_index: 8 },
              { id: 'std-9-i9', level: 'unit', title_en: 'Iyal 9: Sirukathai & Kurunthogai', title_ta: 'இயல் 9: குறுந்தொகை & தாய்மைக்கு வறட்சி இல்லை (சு. சமுத்திரம்)', order_index: 9 },
            ]
          }
        ]
      },

      // 10th Standard (10-ஆம் வகுப்பு)
      {
        id: 'std-10th',
        level: 'class',
        title_en: '10th Standard Samacheer Kalvi (SSLC Core)',
        title_ta: '10-ஆம் வகுப்பு (சமச்சீர் பாடநூல் - முக்கியம்)',
        order_index: 10,
        exam_ids: ['group_4', 'group_2', 'group_2a'],
        children: [
          {
            id: 'std-10th-full',
            level: 'term',
            title_en: '10th Standard - Complete Book (9 Iyals)',
            title_ta: 'பத்தாம் வகுப்பு - முழு பாடநூல் (9 இயல்கள்)',
            order_index: 1,
            children: [
              { id: 'std-10-i1', level: 'unit', title_en: 'Iyal 1: Annai Mozhiye (Pavalareru) & Eluthu Sol', title_ta: 'இயல் 1: அன்னை மொழியே (பெருஞ்சித்திரனார்) & இரட்டுற மொழிதல்', order_index: 1 },
              { id: 'std-10-i2', level: 'unit', title_en: 'Iyal 2: Kaatre Vaa (Bharathiyar) & Mullaippaattu (Nappoothanar)', title_ta: 'இயல் 2: காற்றே வா (பாரதியார்) & முல்லைப்பாட்டு (நப்பூதனார்)', order_index: 2 },
              { id: 'std-10-i3', level: 'unit', title_en: 'Iyal 3: Virunthu Potruthum & Kasi Kandam (Athiveerarama Pandiyar)', title_ta: 'இயல் 3: காசிக் காண்டம் & மலைபடுகடாம் (பெருங்கௌசிகனார்)', order_index: 3 },
              { id: 'std-10-i4', level: 'unit', title_en: 'Iyal 4: Perumal Thirumozhi (Kulashekara Azhwar) & Paripaadal', title_ta: 'இயல் 4: பெருமாள் திருமொழி (குலசேகர ஆழ்வார்) & பரிபாடல் (கீரந்தையார்)', order_index: 4 },
              { id: 'std-10-i5', level: 'unit', title_en: 'Iyal 5: Needhivenba (Kapa Seikuthambi Pavalar) & Thiruvilaiyadal', title_ta: 'இயல் 5: நீதிவெண்பா (செய்குதம்பி பாவலர்) & திருவிளையாடற் புராணம்', order_index: 5 },
              { id: 'std-10-i6', level: 'unit', title_en: 'Iyal 6: Muthukumarasamy Pillaithamizh (Kumaraguruparar) & Kambar', title_ta: 'இயல் 6: முத்துக்குமாரசாமி பிள்ளைத்தமிழ் & கம்பராமாயணம்', order_index: 6 },
              { id: 'std-10-i7', level: 'unit', title_en: 'Iyal 7: Erpudithu (Ku.Pa.Ra) & Mei-keerthi (Raja Raja Chola II)', title_ta: 'இயல் 7: ஏர்ப்பிடித்தல் (கு.ப.ரா) & மெய்க்கீர்த்தி (இரண்டாம் இராசராசன்)', order_index: 7 },
              { id: 'std-10-i8', level: 'unit', title_en: 'Iyal 8: Gnanam (Th.So. Venugopalan) & Kalaikothan', title_ta: 'இயல் 8: ஞானம் (தி.சோ. வேணுகோபாலன்) & காலக்கணிதம் (கண்ணதாசன்)', order_index: 8 },
              { id: 'std-10-i9', level: 'unit', title_en: 'Iyal 9: Thembavani (Veeramamunivar) & Sirukathai', title_ta: 'இயல் 9: தேம்பாவணி (வீரமாமுனிவர்) & ஒருவன் இருக்கிறான் (கு. அழகிரிசாமி)', order_index: 9 },
            ]
          }
        ]
      }
    ];

    async function insertHierarchy(nodeList, parentId = null) {
      for (const node of nodeList) {
        await client.query(
          `INSERT INTO public.syllabus_nodes (id, parent_id, level, title_en, title_ta, order_index, exam_ids, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true)
           ON CONFLICT (id) DO UPDATE SET
              parent_id = EXCLUDED.parent_id,
              level = EXCLUDED.level,
              title_en = EXCLUDED.title_en,
              title_ta = EXCLUDED.title_ta,
              order_index = EXCLUDED.order_index,
              exam_ids = EXCLUDED.exam_ids;`,
          [node.id, parentId, node.level, node.title_en, node.title_ta, node.order_index, node.exam_ids || ['group_4', 'group_2', 'group_2a']]
        );

        if (node.children && node.children.length > 0) {
          await insertHierarchy(node.children, node.id);
        }
      }
    }

    console.log('Seeding Track 1: Official TNPSC Exam Syllabus (Group 4 & Group 2/2A 2024)...');
    await insertHierarchy(officialExamSyllabus);

    console.log('Seeding Track 2: Samacheer Kalvi School Books (6th, 7th, 8th, 9th, 10th Standard with Terms, Iyals, Lessons)...');
    await insertHierarchy(schoolBookSyllabus);

    console.log('Complete Dual-Track Syllabus seeded successfully!');
  } catch (err) {
    console.error('Error seeding complete syllabus:', err);
  } finally {
    await client.end();
  }
}

seedCompleteSyllabus();

