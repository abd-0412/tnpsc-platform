const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function seedAccurateTamilBooks() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database to seed EXACT 2025 Samacheer Tamil Books (6th to 12th)...');

    const accurateBooks = [
      // =======================================================================
      // 6TH TAMIL (2025 Edition)
      // =======================================================================
      {
        id: 'std-6th',
        level: 'class',
        title_en: '6th Standard Tamil (2025 Edition)',
        title_ta: '6-ஆம் வகுப்பு பொதுத் தமிழ் (2025 புதிய பதிப்பு)',
        order_index: 6,
        children: [
          // Term 1
          {
            id: 'std-6th-term-1',
            level: 'term',
            title_en: '6th Tamil - Term 1',
            title_ta: 'ஆறாம் வகுப்பு - முதல் பருவம்',
            order_index: 1,
            children: [
              {
                id: 'std-6-t1-i1',
                level: 'unit',
                title_en: 'Iyal 1: Tamizh Then (தமிழ்த்தேன்)',
                title_ta: 'இயல் 1: தமிழ்த்தேன் (மொழி)',
                order_index: 1,
                children: [
                  { id: 'std-6-t1-i1-l1', level: 'lesson', title_en: 'Inba Tamizh (Poem - Bharathidasan)', title_ta: 'இன்பத்தமிழ் (கவிதைப்பேழை - பாரதிதாசன்)', order_index: 1 },
                  { id: 'std-6-t1-i1-l2', level: 'lesson', title_en: 'Valar Tamizh (Prose)', title_ta: 'வளர்தமிழ் (உரைநடை உலகம்)', order_index: 2 },
                  { id: 'std-6-t1-i1-l3', level: 'lesson', title_en: 'Oli Piranthathu (APJ Abdul Kalam)', title_ta: 'ஒளி பிறந்தது (விரிவானம் - அப்துல் கலாம் நேர்காணல்)', order_index: 3 },
                  { id: 'std-6-t1-i1-l4', level: 'lesson', title_en: 'Tamizh Letters Classification & Metrics', title_ta: 'தமிழ் எழுத்துகளின் வகையும் தொகையும் (கற்கண்டு / இலக்கணம்)', order_index: 4 },
                ]
              },
              {
                id: 'std-6-t1-i2',
                level: 'unit',
                title_en: 'Iyal 2: Iyarkkai Inbam (இயற்கை இன்பம்)',
                title_ta: 'இயல் 2: இயற்கை இன்பம் (இயற்கை)',
                order_index: 2,
                children: [
                  { id: 'std-6-t1-i2-l1', level: 'lesson', title_en: 'Aethili Kuruvi (Poem)', title_ta: 'ஏதிலிக்குருவிகள் (கவிதைப்பேழை)', order_index: 1 },
                  { id: 'std-6-t1-i2-l2', level: 'lesson', title_en: 'Siragin Oosai (Bird Migration)', title_ta: 'சிறகின் ஓசை (உரைநடை உலகம் - பறவைகள் வலசை போதல்)', order_index: 2 },
                  { id: 'std-6-t1-i2-l3', level: 'lesson', title_en: 'Kilavanum Kadalum (The Old Man & The Sea)', title_ta: 'கிழவனும் கடலும் (விரிவானம் - எர்னஸ்ட் ஹெமிங்வே)', order_index: 3 },
                  { id: 'std-6-t1-i2-l4', level: 'lesson', title_en: 'Muthaleluthum Saarpeluthum (Grammar)', title_ta: 'முதலெழுத்தும் சார்பெழுத்தும் (கற்கண்டு / இலக்கணம்)', order_index: 4 },
                  { id: 'std-6-t1-i2-l5', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 5 },
                ]
              },
              {
                id: 'std-6-t1-i3',
                level: 'unit',
                title_en: 'Iyal 3: Kannena Thagum (கண்ணெனத் தகும்)',
                title_ta: 'இயல் 3: கண்ணெனத் தகும் (கல்வி)',
                order_index: 3,
                children: [
                  { id: 'std-6-t1-i3-l1', level: 'lesson', title_en: 'Kalviyai Potru (Poem)', title_ta: 'கல்வியைப் போற்று (கவிதைப்பேழை)', order_index: 1 },
                  { id: 'std-6-t1-i3-l2', level: 'lesson', title_en: 'Thunbam Vellum Kalvi (Pattukottai Kalyanasundaram)', title_ta: 'துன்பத்தை வெல்லும் கல்வி (பட்டுக்கோட்டை கல்யாணசுந்தரம்)', order_index: 2 },
                  { id: 'std-6-t1-i3-l3', level: 'lesson', title_en: 'Kalvikkan Thiranthavar (Kamarajar)', title_ta: 'கல்விக்கண் திறந்தவர் (காமராசர் - உரைநடை)', order_index: 3 },
                  { id: 'std-6-t1-i3-l4', level: 'lesson', title_en: 'Noolagam Nokki... (Anna Centenary Library)', title_ta: 'நூலகம் நோக்கி... (விரிவானம்)', order_index: 4 },
                  { id: 'std-6-t1-i3-l5', level: 'lesson', title_en: 'Mozhimuthal Eluthukal (Grammar)', title_ta: 'மொழிமுதல் எழுத்துகள் (கற்கண்டு / இலக்கணம்)', order_index: 5 },
                ]
              }
            ]
          },
          // Term 2
          {
            id: 'std-6th-term-2',
            level: 'term',
            title_en: '6th Tamil - Term 2',
            title_ta: 'ஆறாம் வகுப்பு - இரண்டாம் பருவம்',
            order_index: 2,
            children: [
              {
                id: 'std-6-t2-i1',
                level: 'unit',
                title_en: 'Iyal 4: Paadarinthu Ozhuguthal (பாடறிந்து ஒழுகுதல்)',
                title_ta: 'இயல் 4: பாடறிந்து ஒழுகுதல் (நாகரிகம், பண்பாடு)',
                order_index: 1,
                children: [
                  { id: 'std-6-t2-i1-l1', level: 'lesson', title_en: 'Aasaarakkovai (Peruvayin Mulliyar)', title_ta: 'ஆசாரக்கோவை (கவிதைப்பேழை - பெருவாயின் முள்ளியார்)', order_index: 1 },
                  { id: 'std-6-t2-i1-l2', level: 'lesson', title_en: 'Kanmaniye Kannurangu (Folklore Lullaby)', title_ta: 'கண்மணியே கண்ணுறங்கு (நாட்டுப்புறப் பாடல்)', order_index: 2 },
                  { id: 'std-6-t2-i1-l3', level: 'lesson', title_en: 'Tamizhar Peruvezha (Pongal Festival)', title_ta: 'தமிழர் பெருவிழா (உரைநடை உலகம்)', order_index: 3 },
                  { id: 'std-6-t2-i1-l4', level: 'lesson', title_en: 'Arivusaal Avvaiyar (Drama)', title_ta: 'அறிவுசால் ஔவையார் (விரிவானம் / நாடகம்)', order_index: 4 },
                  { id: 'std-6-t2-i1-l5', level: 'lesson', title_en: 'Mozhi Iruthi Eluthukal (Grammar)', title_ta: 'மொழி இறுதி எழுத்துகள் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-6-t2-i1-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              },
              {
                id: 'std-6-t2-i2',
                level: 'unit',
                title_en: 'Iyal 5: Koodi Thozhil Sei (கூடித் தொழில் செய்)',
                title_ta: 'இயல் 5: கூடித் தொழில் செய் (தொழில், வணிகம்)',
                order_index: 2,
                children: [
                  { id: 'std-6-t2-i2-l1', level: 'lesson', title_en: 'Naanilam Padaithavan (Mudiyarasan)', title_ta: 'நானிலம் படைத்தவன் (முடியரசன்)', order_index: 1 },
                  { id: 'std-6-t2-i2-l2', level: 'lesson', title_en: 'Kadalodu Vilaiyaadu (Fishermen Folk Song)', title_ta: 'கடலோடு விளையாடு (நாட்டுப்புறப் பாடல்)', order_index: 2 },
                  { id: 'std-6-t2-i2-l3', level: 'lesson', title_en: 'Valarum Vanigam (Trade & Commerce)', title_ta: 'வளரும் வணிகம் (உரைநடை)', order_index: 3 },
                  { id: 'std-6-t2-i2-l4', level: 'lesson', title_en: 'Uzhaippe Moolathanam (Supplementary)', title_ta: 'உழைப்பே மூலதனம் (விரிவானம்)', order_index: 4 },
                  { id: 'std-6-t2-i2-l5', level: 'lesson', title_en: 'Ina Eluthukal (Grammar)', title_ta: 'இன எழுத்துகள் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-6-t2-i2-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              }
            ]
          },
          // Term 3
          {
            id: 'std-6th-term-3',
            level: 'term',
            title_en: '6th Tamil - Term 3',
            title_ta: 'ஆறாம் வகுப்பு - மூன்றாம் பருவம்',
            order_index: 3,
            children: [
              {
                id: 'std-6-t3-i1',
                level: 'unit',
                title_en: 'Iyal 6: Puthumaigal Seiyum Desamithu (புதுமைகள் செய்யும் தேசமிது)',
                title_ta: 'இயல் 6: புதுமைகள் செய்யும் தேசமிது (நாடு, சமூகம், அரசு)',
                order_index: 1,
                children: [
                  { id: 'std-6-t3-i1-l1', level: 'lesson', title_en: 'Bharatham Anraiya Naatrangal (Thara Bharathi)', title_ta: 'பாரதம் அன்றைய நாற்றங்கால் (தாராபாரதி)', order_index: 1 },
                  { id: 'std-6-t3-i1-l2', level: 'lesson', title_en: 'Panchai Valam (Kattabomman Folk Ballad)', title_ta: 'பாஞ்சை வளம் (வீரபாண்டிய கட்டபொம்மன் கதைப்பாடல்)', order_index: 2 },
                  { id: 'std-6-t3-i1-l3', level: 'lesson', title_en: 'Tamilnattil Gandhi (Prose)', title_ta: 'தமிழ்நாட்டில் காந்தி (உரைநடை)', order_index: 3 },
                  { id: 'std-6-t3-i1-l4', level: 'lesson', title_en: 'Velunachiyar (Veeramangai Velunachiyar)', title_ta: 'வேலுநாச்சியார் (விரிவானம்)', order_index: 4 },
                  { id: 'std-6-t3-i1-l5', level: 'lesson', title_en: 'Suttu & Vina Eluthukal (Grammar)', title_ta: 'சுட்டு எழுத்துகள், வினா எழுத்துகள் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-6-t3-i2',
                level: 'unit',
                title_en: 'Iyal 7: Ellarum Inbura (எல்லாரும் இன்புற)',
                title_ta: 'இயல் 7: எல்லாரும் இன்புற (அறம், தத்துவம்)',
                order_index: 2,
                children: [
                  { id: 'std-6-t3-i2-l1', level: 'lesson', title_en: 'Paraaparak Kanni (Thayumanavar)', title_ta: 'பராபரக் கண்ணி (தாயுமானவர்)', order_index: 1 },
                  { id: 'std-6-t3-i2-l2', level: 'lesson', title_en: 'Nilam Pothu (Chief Seattle Speech)', title_ta: 'நிலம் பொது (சியாட்டல் கடிதம்)', order_index: 2 },
                  { id: 'std-6-t3-i2-l3', level: 'lesson', title_en: 'Paatham (S. Ramakrishnan Short Story)', title_ta: 'பாதம் (எஸ். ராமகிருஷ்ணன் சிறுகதை)', order_index: 3 },
                  { id: 'std-6-t3-i2-l4', level: 'lesson', title_en: 'Naalvakai Sorkal (Grammar)', title_ta: 'நால்வகைச் சொற்கள் (இலக்கணம்)', order_index: 4 },
                  { id: 'std-6-t3-i2-l5', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 5 },
                ]
              },
              {
                id: 'std-6-t3-i3',
                level: 'unit',
                title_en: 'Iyal 8: Innuyir Kaappom (இன்னுயிர் காப்போம்)',
                title_ta: 'இயல் 8: இன்னுயிர் காப்போம் (மனிதநேயம், ஆளுமை)',
                order_index: 3,
                children: [
                  { id: 'std-6-t3-i3-l1', level: 'lesson', title_en: 'Aasiya Jothi (Kavimani Desika Vinayagam)', title_ta: 'ஆசிய ஜோதி (கவிமணி தேசிக விநாயகம் பிள்ளை)', order_index: 1 },
                  { id: 'std-6-t3-i3-l2', level: 'lesson', title_en: 'Ilaiya Thozhanukku (Mu. Metha)', title_ta: 'இளைய தோழனுக்கு (மு. மேத்தா)', order_index: 2 },
                  { id: 'std-6-t3-i3-l3', level: 'lesson', title_en: 'Manitha Neyam (Mother Teresa & Kailash)', title_ta: 'மனிதநேயம் (அன்னை தெரசா, கைலாஷ் சத்யார்த்தி)', order_index: 3 },
                  { id: 'std-6-t3-i3-l4', level: 'lesson', title_en: 'Mudivil Oru Thodakkam (Hithendran Organ Donation)', title_ta: 'முடிவில் ஒரு தொடக்கம் (ஹிதேந்திரன் உடல் உறுப்பு தானம்)', order_index: 4 },
                  { id: 'std-6-t3-i3-l5', level: 'lesson', title_en: 'Peyarsol (Grammar)', title_ta: 'பெயர்ச்சொல் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-6-t3-i3-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              }
            ]
          }
        ]
      },

      // =======================================================================
      // 7TH TAMIL (2025 Edition)
      // =======================================================================
      {
        id: 'std-7th',
        level: 'class',
        title_en: '7th Standard Tamil (2025 Edition)',
        title_ta: '7-ஆம் வகுப்பு பொதுத் தமிழ் (2025 புதிய பதிப்பு)',
        order_index: 7,
        children: [
          // Term 1
          {
            id: 'std-7th-term-1',
            level: 'term',
            title_en: '7th Tamil - Term 1',
            title_ta: 'ஏழாம் வகுப்பு - முதல் பருவம்',
            order_index: 1,
            children: [
              {
                id: 'std-7-t1-i1',
                level: 'unit',
                title_en: 'Iyal 1: Amutha Thamizh (அமுதத் தமிழ்)',
                title_ta: 'இயல் 1: அமுதத் தமிழ் (மொழி)',
                order_index: 1,
                children: [
                  { id: 'std-7-t1-i1-l1', level: 'lesson', title_en: 'Engal Thamizh (Namakkal Kavignar)', title_ta: 'எங்கள் தமிழ் (நாமக்கல் கவிஞர் வே. இராமலிங்கனார்)', order_index: 1 },
                  { id: 'std-7-t1-i1-l2', level: 'lesson', title_en: 'Ondralla Irandalla (Udumalai Narayana Kavi)', title_ta: 'ஒன்றல்ல இரண்டல்ல (உடுமலை நாராயணகவி)', order_index: 2 },
                  { id: 'std-7-t1-i1-l3', level: 'lesson', title_en: 'Pechu Mozhiyum Eluthu Mozhiyum (Prose)', title_ta: 'பேச்சுமொழியும் எழுத்துமொழியும் (உரைநடை)', order_index: 3 },
                  { id: 'std-7-t1-i1-l4', level: 'lesson', title_en: 'Aalukku Oru Velai (Puppet Show Story)', title_ta: 'ஆளுக்கு ஒரு வேலை (பொம்மலாட்டம் - விரிவானம்)', order_index: 4 },
                  { id: 'std-7-t1-i1-l5', level: 'lesson', title_en: 'Kutriyalukaram & Kutriyalikaram (Grammar)', title_ta: 'குற்றியலுகரம், குற்றியலிகரம் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-7-t1-i2',
                level: 'unit',
                title_en: 'Iyal 2: Aninizhal Kaadu (அணிநிழல் காடு)',
                title_ta: 'இயல் 2: அணிநிழல் காடு (இயற்கை)',
                order_index: 2,
                children: [
                  { id: 'std-7-t1-i2-l1', level: 'lesson', title_en: 'Kaadu (Suradha)', title_ta: 'காடு (சுரதா)', order_index: 1 },
                  { id: 'std-7-t1-i2-l2', level: 'lesson', title_en: 'Appadiye Nirkattum Antha Maram (Raja Marthandan)', title_ta: 'அப்படியே நிற்கட்டும் அந்த மரம் (ராஜமார்த்தாண்டன்)', order_index: 2 },
                  { id: 'std-7-t1-i2-l3', level: 'lesson', title_en: 'Thamizharin Kapparkalai (Shipbuilding Art)', title_ta: 'தமிழரின் கப்பற்கலை (உரைநடை)', order_index: 3 },
                  { id: 'std-7-t1-i2-l4', level: 'lesson', title_en: 'Vilangugal Ulagam (Wildlife Sanctuary)', title_ta: 'விலங்குகள் உலகம் (விரிவானம்)', order_index: 4 },
                  { id: 'std-7-t1-i2-l5', level: 'lesson', title_en: 'Naalvakai Kurukkangal (Grammar)', title_ta: 'நால்வகைக் குறுக்கங்கள் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-7-t1-i2-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              },
              {
                id: 'std-7-t1-i3',
                level: 'unit',
                title_en: 'Iyal 3: Naadu Athai Naadu (நாடு அதை நாடு)',
                title_ta: 'இயல் 3: நாடு அதை நாடு (நாடு, சமூகம்)',
                order_index: 3,
                children: [
                  { id: 'std-7-t1-i3-l1', level: 'lesson', title_en: 'Viduthalai Thirunaal (Meera)', title_ta: 'விடுதலைத் திருநாள் (மீரா)', order_index: 1 },
                  { id: 'std-7-t1-i3-l2', level: 'lesson', title_en: 'Thesiyam Kaatha Semmal Pasumpon Muthuramalingathevar', title_ta: 'தேசியம் காத்த செம்மல் பசும்பொன் உ. முத்துராமலிங்கத்தேவர் (உரைநடை)', order_index: 2 },
                  { id: 'std-7-t1-i3-l3', level: 'lesson', title_en: 'Kappalottiya Thamizhar (V.O. Chidambaranar)', title_ta: 'கப்பலோட்டிய தமிழர் (வ.உ.சி - ரா.பி. சேதுப்பிள்ளை)', order_index: 3 },
                  { id: 'std-7-t1-i3-l4', level: 'lesson', title_en: 'Orezhuthu Oru Mozhi, Pagupatham, Pagaapatham', title_ta: 'ஓரெழுத்து ஒருமொழி, பகுபதம், பகாப்பதம் (இலக்கணம்)', order_index: 4 },
                  { id: 'std-7-t1-i3-l5', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 5 },
                ]
              }
            ]
          },
          // Term 2
          {
            id: 'std-7th-term-2',
            level: 'term',
            title_en: '7th Tamil - Term 2',
            title_ta: 'ஏழாம் வகுப்பு - இரண்டாம் பருவம்',
            order_index: 2,
            children: [
              {
                id: 'std-7-t2-i1',
                level: 'unit',
                title_en: 'Iyal 4: Oothuvathu Ozhiyel (ஓதுவது ஒழியேல்)',
                title_ta: 'இயல் 4: ஓதுவது ஒழியேல் (கல்வி)',
                order_index: 1,
                children: [
                  { id: 'std-7-t2-i1-l1', level: 'lesson', title_en: 'Azhiyaa Selvam (Naladiyar - Samana Munivar)', title_ta: 'அழியாச் செல்வம் (நாலடியார் - சமண முனிவர்)', order_index: 1 },
                  { id: 'std-7-t2-i1-l2', level: 'lesson', title_en: 'Theyilaith Thotta Paattu', title_ta: 'தேயிலைத் தோட்டப் பாட்டு', order_index: 2 },
                  { id: 'std-7-t2-i1-l3', level: 'lesson', title_en: 'Vaazhvikkum Kalvi (Thirukkuralar Munisamy)', title_ta: 'வாழ்விக்கும் கல்வி (திருக்குறளார் வீ. முனிசாமி)', order_index: 3 },
                  { id: 'std-7-t2-i1-l4', level: 'lesson', title_en: 'Palli Maruthirappu (Subrabharathimanian)', title_ta: 'பள்ளி மறுதிறப்பு (சுப்ரபாரதிமணியன்)', order_index: 4 },
                  { id: 'std-7-t2-i1-l5', level: 'lesson', title_en: 'Ilakkiyavakai Sorkal (Grammar)', title_ta: 'இலக்கியவகைச் சொற்கள் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-7-t2-i2',
                level: 'unit',
                title_en: 'Iyal 5: Kalaivannam (கலைவண்ணம்)',
                title_ta: 'இயல் 5: கலைவண்ணம் (கலை, அழகியல்)',
                order_index: 2,
                children: [
                  { id: 'std-7-t2-i2-l1', level: 'lesson', title_en: 'Poothoduthal (Uma Maheswari)', title_ta: 'பூத்தொடுத்தல் (உமா மகேஸ்வரி)', order_index: 1 },
                  { id: 'std-7-t2-i2-l2', level: 'lesson', title_en: 'Pesum Oviyangal (Prose)', title_ta: 'பேசும் ஓவியங்கள் (உரைநடை)', order_index: 2 },
                  { id: 'std-7-t2-i2-l3', level: 'lesson', title_en: 'Tamizh Olir Idangal (TN Heritage Centers)', title_ta: 'தமிழ் ஒளிர் இடங்கள் (சரசுவதி மகால், தஞ்சை பெரிய கோவில் etc.)', order_index: 3 },
                  { id: 'std-7-t2-i2-l4', level: 'lesson', title_en: 'Thozhirpeyargal (Grammar)', title_ta: 'தொழிற்பெயர் (இலக்கணம்)', order_index: 4 },
                  { id: 'std-7-t2-i2-l5', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 5 },
                ]
              }
            ]
          },
          // Term 3
          {
            id: 'std-7th-term-3',
            level: 'term',
            title_en: '7th Tamil - Term 3',
            title_ta: 'ஏழாம் வகுப்பு - மூன்றாம் பருவம்',
            order_index: 3,
            children: [
              {
                id: 'std-7-t3-i1',
                level: 'unit',
                title_en: 'Iyal 6: Nayathagu Naagarigam (நயத்தகு நாகரிகம்)',
                title_ta: 'இயல் 6: நயத்தகு நாகரிகம் (நாகரிகம், தொழில், வணிகம்)',
                order_index: 1,
                children: [
                  { id: 'std-7-t3-i1-l1', level: 'lesson', title_en: 'Virunthombal (Munruraiyaraiyanar - Pazhamozhi 400)', title_ta: 'விருந்தோம்பல் (முன்றுரையரையனார் - பழமொழி நானூறு)', order_index: 1 },
                  { id: 'std-7-t3-i1-l2', level: 'lesson', title_en: 'Thikkellam Pugazhurum Thirunelveli', title_ta: 'திக்கெல்லாம் புகழுறும் திருநெல்வேலி (உரைநடை)', order_index: 2 },
                  { id: 'std-7-t3-i1-l3', level: 'lesson', title_en: 'Thirunelveli Seemaiyum Kavigalum (TKC)', title_ta: 'திருநெல்வேலிச் சீமையும் கவிகளும் (டி.கே.சி)', order_index: 3 },
                  { id: 'std-7-t3-i1-l4', level: 'lesson', title_en: 'Vazhakku (Grammar)', title_ta: 'வழக்கு (இயல்பு வழக்கு, தகுதி வழக்கு - இலக்கணம்)', order_index: 4 },
                ]
              },
              {
                id: 'std-7-t3-i2',
                level: 'unit',
                title_en: 'Iyal 7: Oppuravu Ozhugu (ஒப்புரவு ஒழுகு)',
                title_ta: 'இயல் 7: ஒப்புரவு ஒழுகு (அறம், தத்துவம்)',
                order_index: 2,
                children: [
                  { id: 'std-7-t3-i2-l1', level: 'lesson', title_en: 'Puthumai Vilakku (Poigai Azhwar & Boothathazhwar)', title_ta: 'புதுமை விளக்கு (பொய்கையாழ்வார், பூதத்தாழ்வார்)', order_index: 1 },
                  { id: 'std-7-t3-i2-l2', level: 'lesson', title_en: 'Aram Ennum Kathir (Munaippadiyar - Aranericharam)', title_ta: 'அறம் என்னும் கதிர் (முனைப்பாடியார் - அறநெறிச்சாரம்)', order_index: 2 },
                  { id: 'std-7-t3-i2-l3', level: 'lesson', title_en: 'Oppuravu Neri (Kundrakudi Adigalar)', title_ta: 'ஒப்புரவு நெறி (குன்றக்குடி அடிகளார்)', order_index: 3 },
                  { id: 'std-7-t3-i2-l4', level: 'lesson', title_en: 'Unmai Oli (Zen Story)', title_ta: 'உண்மை ஒளி (ஜென் கதை)', order_index: 4 },
                  { id: 'std-7-t3-i2-l5', level: 'lesson', title_en: 'Ilakkanam Pothu (Ani Ilakkanam)', title_ta: 'இலக்கணம் - பொது (அணி இலக்கணம்)', order_index: 5 },
                  { id: 'std-7-t3-i2-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              },
              {
                id: 'std-7-t3-i3',
                level: 'unit',
                title_en: 'Iyal 8: Maanudam Vellum (மானுடம் வெல்லும்)',
                title_ta: 'இயல் 8: மானுடம் வெல்லும் (மனிதநேயம், ஆளுமை)',
                order_index: 3,
                children: [
                  { id: 'std-7-t3-i3-l1', level: 'lesson', title_en: 'Malaippozhivu (Kannadasan - Yesu Kaviyam)', title_ta: 'மலைப்பொழிவு (கண்ணதாசன் - இயேசு காவியம்)', order_index: 1 },
                  { id: 'std-7-t3-i3-l2', level: 'lesson', title_en: 'Thannai Arithal (Se. Brindha)', title_ta: 'தன்னை அறிதல் (சே. பிருந்தா)', order_index: 2 },
                  { id: 'std-7-t3-i3-l3', level: 'lesson', title_en: 'Kanniyamigu Thalaivar (Quaid-e-Millath)', title_ta: 'கண்ணியமிகு தலைவர் (காயிதே மில்லத்)', order_index: 3 },
                  { id: 'std-7-t3-i3-l4', level: 'lesson', title_en: 'Payanam (Paavannan)', title_ta: 'பயணம் (பாவண்ணன் சிறுகதை)', order_index: 4 },
                  { id: 'std-7-t3-i3-l5', level: 'lesson', title_en: 'Vina Vidai Vagaigal & Porulkol', title_ta: 'வினா, விடை வகைகள் & பொருள்கோள் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-7-t3-i3-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              }
            ]
          }
        ]
      },

      // =======================================================================
      // 8TH TAMIL (2025 Edition)
      // =======================================================================
      {
        id: 'std-8th',
        level: 'class',
        title_en: '8th Standard Tamil (2025 Edition)',
        title_ta: '8-ஆம் வகுப்பு பொதுத் தமிழ் (2025 புதிய பதிப்பு)',
        order_index: 8,
        children: [
          {
            id: 'std-8th-full',
            level: 'term',
            title_en: '8th Tamil - Complete Book (8 Iyals)',
            title_ta: 'எட்டாம் வகுப்பு - முழு பாடநூல் (8 இயல்கள்)',
            order_index: 1,
            children: [
              {
                id: 'std-8-i1',
                level: 'unit',
                title_en: 'Iyal 1: Tamizh Inbam (தமிழ் இன்பம்)',
                title_ta: 'இயல் 1: தமிழ் இன்பம் (மொழி)',
                order_index: 1,
                children: [
                  { id: 'std-8-i1-l1', level: 'lesson', title_en: 'Tamizhmozhi Vazhthu (Bharathiyar)', title_ta: 'தமிழ்மொழி வாழ்த்து (பாரதியார்)', order_index: 1 },
                  { id: 'std-8-i1-l2', level: 'lesson', title_en: 'Aazhikku Inai (Sandhakavimani Tamilazhaganar)', title_ta: 'ஆழிக்கு இணை (சந்தக்கவிமணி தமிழழகனார்)', order_index: 2 },
                  { id: 'std-8-i1-l3', level: 'lesson', title_en: 'Tamizh Varivadiva Valarchi (Script Evolution)', title_ta: 'தமிழ் வரிவடிவ வளர்ச்சி (உரைநடை)', order_index: 3 },
                  { id: 'std-8-i1-l4', level: 'lesson', title_en: 'Sorpoonga (R.P. Sethupillai)', title_ta: 'சொற்பூங்கா (ரா.பி. சேதுப்பிள்ளை)', order_index: 4 },
                  { id: 'std-8-i1-l5', level: 'lesson', title_en: 'Eluthukalin Pirappu (Grammar)', title_ta: 'எழுத்துகளின் பிறப்பு (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-8-i2',
                level: 'unit',
                title_en: 'Iyal 2: Eedilla Iyarkkai (ஈடில்லா இயற்கை)',
                title_ta: 'இயல் 2: ஈடில்லா இயற்கை (இயற்கை)',
                order_index: 2,
                children: [
                  { id: 'std-8-i2-l1', level: 'lesson', title_en: 'Iyarkkaiyai Potruvom (Poem)', title_ta: 'இயற்கையைப் போற்றுவோம்', order_index: 1 },
                  { id: 'std-8-i2-l2', level: 'lesson', title_en: 'Pattamaram (Kavignar Tamil Oli)', title_ta: 'பட்டமரம் (கவிஞர் தமிழ்ஒளி)', order_index: 2 },
                  { id: 'std-8-i2-l3', level: 'lesson', title_en: 'Tamizhar Maruthuvam (Traditional Medicine)', title_ta: 'தமிழர் மருத்துவம் (நேர்காணல்)', order_index: 3 },
                  { id: 'std-8-i2-l4', level: 'lesson', title_en: 'Vettukkiliyum Sarugumaanum (Tribal Tale)', title_ta: 'வெட்டுக்கிளியும் சருகுமானும் (காடர் கதை)', order_index: 4 },
                  { id: 'std-8-i2-l5', level: 'lesson', title_en: 'Mayangoligal (Grammar)', title_ta: 'மயங்கொலிகள் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-8-i2-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              },
              {
                id: 'std-8-i3',
                level: 'unit',
                title_en: 'Iyal 3: Kalvi Karaiyila (கல்வி கரையில)',
                title_ta: 'இயல் 3: கல்வி கரையில (கல்வி)',
                order_index: 3,
                children: [
                  { id: 'std-8-i3-l1', level: 'lesson', title_en: 'Paadarinthu Ozhuguthal (Kalithogai)', title_ta: 'பாடறிந்து ஒழுகுதல் (கலித்தொகை - நல்லந்துவனார்)', order_index: 1 },
                  { id: 'std-8-i3-l2', level: 'lesson', title_en: 'Puthiyai Theettu (Alangudi Somu)', title_ta: 'புத்தியைத் தீட்டு (ஆலங்குடி சோமு)', order_index: 2 },
                  { id: 'std-8-i3-l3', level: 'lesson', title_en: 'Palthuraik Kalvi (Thiru.Vi.Ka)', title_ta: 'பல்துறைக் கல்வி (திரு.வி. கலியாணசுந்தரனார்)', order_index: 3 },
                  { id: 'std-8-i3-l4', level: 'lesson', title_en: 'Aandra Kudipirathal (P.S. Kuppusamy)', title_ta: 'ஆன்ற குடிபிறத்தல் (பி.ச. குப்புசாமி)', order_index: 4 },
                  { id: 'std-8-i3-l5', level: 'lesson', title_en: 'Vinaimutru (Grammar)', title_ta: 'வினைமுற்று (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-8-i4',
                level: 'unit',
                title_en: 'Iyal 4: Kuzhalinithu Yaazhinithu (குழலினிது யாழினிது)',
                title_ta: 'இயல் 4: குழலினிது யாழினிது (கலை, அழகியல்)',
                order_index: 4,
                children: [
                  { id: 'std-8-i4-l1', level: 'lesson', title_en: 'Thiruketharam (Sundarar Thevaram)', title_ta: 'திருக்கேதாரம் (சுந்தரர் தேவாரம்)', order_index: 1 },
                  { id: 'std-8-i4-l2', level: 'lesson', title_en: 'Naattuputha Kaivinai Kalaigal (Crafts)', title_ta: 'நாட்டுப்புறக் கைவினைக் கலைகள் (உரைநடை)', order_index: 2 },
                  { id: 'std-8-i4-l3', level: 'lesson', title_en: 'Tamizhar Isaikkaruvigal (Music Instruments)', title_ta: 'தமிழர் இசைக்கருவிகள் (உரைநடை)', order_index: 3 },
                  { id: 'std-8-i4-l4', level: 'lesson', title_en: 'Echam (Grammar)', title_ta: 'எச்சம் (பெயரெச்சம், வினையெச்சம் - இலக்கணம்)', order_index: 4 },
                  { id: 'std-8-i4-l5', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 5 },
                ]
              },
              {
                id: 'std-8-i5',
                level: 'unit',
                title_en: 'Iyal 5: Vaiyampugazh Vanigam (வையம்புகழ் வணிகம்)',
                title_ta: 'இயல் 5: வையம்புகழ் வணிகம் (நாகரிகம், தொழில்)',
                order_index: 5,
                children: [
                  { id: 'std-8-i5-l1', level: 'lesson', title_en: 'Valam Peruguga (Thagadoor Yathirai)', title_ta: 'வளம் பெருகுக (தகடூர் யாத்திரை)', order_index: 1 },
                  { id: 'std-8-i5-l2', level: 'lesson', title_en: 'Konakkathup Paattu (Vengamboor Swaminathan)', title_ta: 'கோணக்காத்துப் பாட்டு (வெங்கம்பூர் சாமிநாதன்)', order_index: 2 },
                  { id: 'std-8-i5-l3', level: 'lesson', title_en: 'Kongunaattu Vanigam (Kongu Trade History)', title_ta: 'கொங்குநாட்டு வணிகம் (உரைநடை)', order_index: 3 },
                  { id: 'std-8-i5-l4', level: 'lesson', title_en: 'Kaalam Udan Varum (Kanniwaadi Sivakumar)', title_ta: 'காலம் உடன் வரும் (கன்னிவாடி சீரங்கராயன் சிவக்குமார்)', order_index: 4 },
                  { id: 'std-8-i5-l5', level: 'lesson', title_en: 'Vinaiyaal Amaiyum Thodargal (Grammar)', title_ta: 'வினையால் அமையும் தொடர்கள் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-8-i6',
                level: 'unit',
                title_en: 'Iyal 6: Paarukkulle Nalla Naadu (பாருக்குள்ளே நல்ல நாடு)',
                title_ta: 'இயல் 6: பாருக்குள்ளே நல்ல நாடு (நாடு, சமூகம்)',
                order_index: 6,
                children: [
                  { id: 'std-8-i6-l1', level: 'lesson', title_en: 'Singi Petra Parisu', title_ta: 'சிங்கி பெற்ற பரிசு', order_index: 1 },
                  { id: 'std-8-i6-l2', level: 'lesson', title_en: 'Bharat Ratna M.G. Ramachandran', title_ta: 'பாரத ரத்னா எம்.ஜி. இராமச்சந்திரன் (உரைநடை)', order_index: 2 },
                  { id: 'std-8-i6-l3', level: 'lesson', title_en: 'Oruvan Irukkiraan (Ku. Azhagirisamy)', title_ta: 'ஒருவன் இருக்கிறான் (கு. அழகிரிசாமி சிறுகதை)', order_index: 3 },
                  { id: 'std-8-i6-l4', level: 'lesson', title_en: 'Idaichol, Urichol (Grammar)', title_ta: 'இடைச்சொல், உரிச்சொல் (இலக்கணம்)', order_index: 4 },
                ]
              },
              {
                id: 'std-8-i7',
                level: 'unit',
                title_en: 'Iyal 7: Arathaal Varuvathe Inbam (அறத்தால் வருவதே இன்பம்)',
                title_ta: 'இயல் 7: அறத்தால் வருவதே இன்பம் (அறம், தத்துவம்)',
                order_index: 7,
                children: [
                  { id: 'std-8-i7-l1', level: 'lesson', title_en: 'Ondre Kulam (Thirumoolar - Thirumanthiram)', title_ta: 'ஒன்றே குலம் (திருமூலர் - திருமந்திரம்)', order_index: 1 },
                  { id: 'std-8-i7-l2', level: 'lesson', title_en: 'Meignana Oli (Gunangudi Masthan Sahib)', title_ta: 'மெய்ஞ்ஞான ஒளி (குணங்குடி மஸ்தான் சாகிபு)', order_index: 2 },
                  { id: 'std-8-i7-l3', level: 'lesson', title_en: 'Ayothithasar Sinthanaigal', title_ta: 'அயோத்திதாசர் சிந்தனைகள் (உரைநடை)', order_index: 3 },
                  { id: 'std-8-i7-l4', level: 'lesson', title_en: 'Manitha Yanthiram (Puthumaipithan)', title_ta: 'மனித எந்திரம் (சிறுகதை - புதுமைப்பித்தன்)', order_index: 4 },
                  { id: 'std-8-i7-l5', level: 'lesson', title_en: 'Vetrumai (Grammar - Case Markers)', title_ta: 'வேற்றுமை (வேற்றுமை உருபுகள் - இலக்கணம்)', order_index: 5 },
                  { id: 'std-8-i7-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              },
              {
                id: 'std-8-i8',
                level: 'unit',
                title_en: 'Iyal 8: Kundrena Nimirnthunil (குன்றென நிமிர்ந்துநில்)',
                title_ta: 'இயல் 8: குன்றென நிமிர்ந்துநில் (மனிதநேயம், ஆளுமை)',
                order_index: 8,
                children: [
                  { id: 'std-8-i8-l1', level: 'lesson', title_en: 'Noyum Marunthum (Neelakesi)', title_ta: 'நோயும் மருந்தும் (நீலகேசி)', order_index: 1 },
                  { id: 'std-8-i8-l2', level: 'lesson', title_en: 'Sattamethai Ambedkar (Dr. B.R. Ambedkar)', title_ta: 'சட்டமேதை அம்பேத்கர் (உரைநடை)', order_index: 2 },
                  { id: 'std-8-i8-l3', level: 'lesson', title_en: 'Paal Manam (Komagal)', title_ta: 'பால் மனம் (கோமகள் சிறுகதை)', order_index: 3 },
                  { id: 'std-8-i8-l4', level: 'lesson', title_en: 'Punarchi (Grammar)', title_ta: 'புணர்ச்சி (உயிர் ஈறு, மெய் ஈறு - இலக்கணம்)', order_index: 4 },
                  { id: 'std-8-i8-l5', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 5 },
                ]
              }
            ]
          }
        ]
      },

      // =======================================================================
      // 9TH TAMIL (2025 Edition)
      // =======================================================================
      {
        id: 'std-9th',
        level: 'class',
        title_en: '9th Standard Tamil (2025 Edition)',
        title_ta: '9-ஆம் வகுப்பு பொதுத் தமிழ் (2025 புதிய பதிப்பு)',
        order_index: 9,
        children: [
          {
            id: 'std-9th-full',
            level: 'term',
            title_en: '9th Tamil - Complete Book (7 Iyals)',
            title_ta: 'ஒன்பதாம் வகுப்பு - முழு பாடநூல் (7 இயல்கள்)',
            order_index: 1,
            children: [
              {
                id: 'std-9-i1',
                level: 'unit',
                title_en: 'Iyal 1: Amuthendru Per (அமுதென்று பேர்)',
                title_ta: 'இயல் 1: அமுதென்று பேர் (மொழி)',
                order_index: 1,
                children: [
                  { id: 'std-9-i1-l1', level: 'lesson', title_en: 'Tamizh Vidu Thoothu', title_ta: 'தமிழ்விடு தூது', order_index: 1 },
                  { id: 'std-9-i1-l2', level: 'lesson', title_en: 'Dravida Mozhikudumbam', title_ta: 'திராவிட மொழிக் குடும்பம் (உரைநடை)', order_index: 2 },
                  { id: 'std-9-i1-l3', level: 'lesson', title_en: 'Tamizhoviyam (Erode Tamilanban)', title_ta: 'தமிழோவியம் (ஈரோடு தமிழன்பன்)', order_index: 3 },
                  { id: 'std-9-i1-l4', level: 'lesson', title_en: 'Aaraam Thinai (Dr. M. Varatharasanar)', title_ta: 'ஆறாம் திணை (மு. வரதராசனார்)', order_index: 4 },
                  { id: 'std-9-i1-l5', level: 'lesson', title_en: 'Eluthu Alapedai (Grammar)', title_ta: 'எழுத்து - அளபெடை (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-9-i2',
                level: 'unit',
                title_en: 'Iyal 2: Uyirukku Ver (உயிருக்கு வேர்)',
                title_ta: 'இயல் 2: உயிருக்கு வேர் (இயற்கை, சுற்றுச்சூழல்)',
                order_index: 2,
                children: [
                  { id: 'std-9-i2-l1', level: 'lesson', title_en: 'Neerintri Amaiyathu Ulagu', title_ta: 'நீரின்றி அமையாது உலகு (கருத்தரங்கம்)', order_index: 1 },
                  { id: 'std-9-i2-l2', level: 'lesson', title_en: 'Periyapuranam (Sekkizhar)', title_ta: 'பெரியபுராணம் (சேக்கிழார்)', order_index: 2 },
                  { id: 'std-9-i2-l3', level: 'lesson', title_en: 'Purananuru (Kudapulaviyanar)', title_ta: 'புறநானூறு (குடபுலவியனார்)', order_index: 3 },
                  { id: 'std-9-i2-l4', level: 'lesson', title_en: 'Thanneer (Kantharvan)', title_ta: 'தண்ணீர் (கந்தர்வன் சிறுகதை)', order_index: 4 },
                  { id: 'std-9-i2-l5', level: 'lesson', title_en: 'Pagupatha Uruppilakkanam (Grammar)', title_ta: 'பகுபத உறுப்பிலக்கணம் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-9-i3',
                level: 'unit',
                title_en: 'Iyal 3: Ullathin Seer (உள்ளத்தின் சீர்)',
                title_ta: 'இயல் 3: உள்ளத்தின் சீர் (பண்பாடு, மனிதநேயம்)',
                order_index: 3,
                children: [
                  { id: 'std-9-i3-l1', level: 'lesson', title_en: 'Eru Thazhuvuthal (Jallikattu)', title_ta: 'ஏறு தழுவுதல் (உரைநடை)', order_index: 1 },
                  { id: 'std-9-i3-l2', level: 'lesson', title_en: 'Manimegalai (Seethalai Saathanar)', title_ta: 'மணிமேகலை (சீத்தலைச் சாத்தனார்)', order_index: 2 },
                  { id: 'std-9-i3-l3', level: 'lesson', title_en: 'Margazhi Peruvezha', title_ta: 'மார்கழிப் பெருவிழா', order_index: 3 },
                  { id: 'std-9-i3-l4', level: 'lesson', title_en: 'Thaimaikku Varatchi Illai! (S. Samuthiram)', title_ta: 'தாய்மைக்கு வறட்சி இல்லை! (சு. சமுத்திரம்)', order_index: 4 },
                  { id: 'std-9-i3-l5', level: 'lesson', title_en: 'Thodar Ilakkanam, Aagupeyar (Grammar)', title_ta: 'தொடர் இலக்கணம், ஆகுபெயர் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-9-i3-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              },
              {
                id: 'std-9-i4',
                level: 'unit',
                title_en: 'Iyal 4: Kasadara Mozhithal (கசடற மொழிதல்)',
                title_ta: 'இயல் 4: கசடற மொழிதல் (கல்வி)',
                order_index: 4,
                children: [
                  { id: 'std-9-i4-l1', level: 'lesson', title_en: 'Kalviyil Sirantha Pengal (Women in Education)', title_ta: 'கல்வியில் சிறந்த பெண்கள் (உரைநடை)', order_index: 1 },
                  { id: 'std-9-i4-l2', level: 'lesson', title_en: 'Kudumba Vilakku (Bharathidasan)', title_ta: 'குடும்ப விளக்கு (பாரதிதாசன்)', order_index: 2 },
                  { id: 'std-9-i4-l3', level: 'lesson', title_en: 'Uyir Vagai (Tholkappiyam)', title_ta: 'உயிர்வகை (தொல்காப்பியம்)', order_index: 3 },
                  { id: 'std-9-i4-l4', level: 'lesson', title_en: 'Veettirkor Puthagasaalai (Arignar Anna)', title_ta: 'வீட்டிற்கோர் புத்தகசாலை (அறிஞர் அண்ணா)', order_index: 4 },
                  { id: 'std-9-i4-l5', level: 'lesson', title_en: 'Thunaivinaigal (Grammar)', title_ta: 'துணைவினைகள் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-9-i5',
                level: 'unit',
                title_en: 'Iyal 5: Kalai Pala Valarthal (கலை பல வளர்த்தல்)',
                title_ta: 'இயல் 5: கலை பல வளர்த்தல் (கலை, அழகியல்)',
                order_index: 5,
                children: [
                  { id: 'std-9-i5-l1', level: 'lesson', title_en: 'Sirpakkalai (Sculpture Art)', title_ta: 'சிற்பக்கலை (உரைநடை)', order_index: 1 },
                  { id: 'std-9-i5-l2', level: 'lesson', title_en: 'Ravana Kaviyam (Pulavar Kuzhanthai)', title_ta: 'இராவண காவியம் (புலவர் குழந்தை)', order_index: 2 },
                  { id: 'std-9-i5-l3', level: 'lesson', title_en: 'Seithi (Thi. Janakiraman)', title_ta: 'செய்தி (தி. ஜானகிராமன் சிறுகதை)', order_index: 3 },
                  { id: 'std-9-i5-l4', level: 'lesson', title_en: 'Vallinam Migum Idangal (Grammar)', title_ta: 'வல்லினம் மிகும் இடங்கள் (இலக்கணம்)', order_index: 4 },
                  { id: 'std-9-i5-l5', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 5 },
                ]
              },
              {
                id: 'std-9-i6',
                level: 'unit',
                title_en: 'Iyal 6: Vaazhiya Nilane (வாழிய நிலனே)',
                title_ta: 'இயல் 6: வாழிய நிலனே (நாடு, சமூகம், அரசு)',
                order_index: 6,
                children: [
                  { id: 'std-9-i6-l1', level: 'lesson', title_en: 'Indian National Army Tamil Role', title_ta: 'இந்திய தேசிய இராணுவத்தில் தமிழர் பங்கு (மா.சு. அண்ணாமலை)', order_index: 1 },
                  { id: 'std-9-i6-l2', level: 'lesson', title_en: 'Seevaka Chinthamani (Thirutakkadevar)', title_ta: 'சீவக சிந்தாமணி (திருத்தக்கதேவர்)', order_index: 2 },
                  { id: 'std-9-i6-l3', level: 'lesson', title_en: 'Vinnaiyum Saaduvom (Space Science - Mayilsamy)', title_ta: 'விண்ணையும் சாடுவோம் (மயில்சாமி அண்ணாதுரை)', order_index: 3 },
                  { id: 'std-9-i6-l4', level: 'lesson', title_en: 'Vallinam Migaa Idangal (Grammar)', title_ta: 'வல்லினம் மிகா இடங்கள் (இலக்கணம்)', order_index: 4 },
                ]
              },
              {
                id: 'std-9-i7',
                level: 'unit',
                title_en: 'Iyal 7: Endrライ கடனே (என்றலைக் கடனே)',
                title_ta: 'இயல் 7: என்றலைக் கடனே (அறம், தத்துவம்)',
                order_index: 7,
                children: [
                  { id: 'std-9-i7-l1', level: 'lesson', title_en: 'Periyarin Sinthanaigal', title_ta: 'பெரியாரின் சிந்தனைகள் (உரைநடை)', order_index: 1 },
                  { id: 'std-9-i7-l2', level: 'lesson', title_en: 'O, En Samakaala Thozhargale! (Vairamuthu)', title_ta: 'ஓ, என் சமகாலத் தோழர்களே! (வைரமுத்து)', order_index: 2 },
                  { id: 'std-9-i7-l3', level: 'lesson', title_en: 'Yasodhara Kaviyam', title_ta: 'யசோதர காவியம்', order_index: 3 },
                  { id: 'std-9-i7-l4', level: 'lesson', title_en: 'Maganukku Ezhuthiya Kaditham (Na. Muthukumar)', title_ta: 'மகனுக்கு எழுதிய கடிதம் (நா. முத்துக்குமார்)', order_index: 4 },
                  { id: 'std-9-i7-l5', level: 'lesson', title_en: 'Yappilakkanam (Grammar - Prosody)', title_ta: 'யாப்பிலக்கணம் (யாப்பின் உறுப்புகள் - இலக்கணம்)', order_index: 5 },
                  { id: 'std-9-i7-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              }
            ]
          }
        ]
      },

      // =======================================================================
      // 10TH TAMIL (2025 Edition - SSLC Core)
      // =======================================================================
      {
        id: 'std-10th',
        level: 'class',
        title_en: '10th Standard Tamil (2025 Edition)',
        title_ta: '10-ஆம் வகுப்பு பொதுத் தமிழ் (2025 புதிய பதிப்பு)',
        order_index: 10,
        children: [
          {
            id: 'std-10th-full',
            level: 'term',
            title_en: '10th Tamil - Complete Book (7 Iyals)',
            title_ta: 'பத்தாம் வகுப்பு - முழு பாடநூல் (7 இயல்கள்)',
            order_index: 1,
            children: [
              {
                id: 'std-10-i1',
                level: 'unit',
                title_en: 'Iyal 1: Amuthaoottru (அமுதஊற்று)',
                title_ta: 'இயல் 1: அமுதஊற்று (மொழி, மனிதநேயம்)',
                order_index: 1,
                children: [
                  { id: 'std-10-i1-l1', level: 'lesson', title_en: 'Annai Mozhiye (Pavalareru Perunchithiranar)', title_ta: 'அன்னை மொழியே (பாவலரேறு பெருஞ்சித்திரனார்)', order_index: 1 },
                  { id: 'std-10-i1-l2', level: 'lesson', title_en: 'Pavanar Parvaiyil Tamizhsoll Valam (Devaneya Pavanar)', title_ta: 'பாவாணர் பார்வையில் தமிழ்ச்சொல் வளம் (தேவநேயப் பாவாணர்)', order_index: 2 },
                  { id: 'std-10-i1-l3', level: 'lesson', title_en: 'Kaalakkanitham (Kannadasan)', title_ta: 'காலக்கணிதம் (கண்ணதாசன்)', order_index: 3 },
                  { id: 'std-10-i1-l4', level: 'lesson', title_en: 'Puyalile Oru Thoni (Pa. Singaram)', title_ta: 'புயலிலே ஒரு தோணி (ப. சிங்காரம்)', order_index: 4 },
                  { id: 'std-10-i1-l5', level: 'lesson', title_en: 'Sol (Grammar)', title_ta: 'சொல் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-10-i2',
                level: 'unit',
                title_en: 'Iyal 2: Uyirin Oosai (உயிரின் ஓசை)',
                title_ta: 'இயல் 2: உயிரின் ஓசை (இயற்கை, சுற்றுச்சூழல், அறிவியல்)',
                order_index: 2,
                children: [
                  { id: 'std-10-i2-l1', level: 'lesson', title_en: 'Ketkiratha En Kural! (Air Prose)', title_ta: 'கேட்கிறதா என் குரல்! (காற்று உரைநடை)', order_index: 1 },
                  { id: 'std-10-i2-l2', level: 'lesson', title_en: 'Paripaadal (Keeranthaiyar)', title_ta: 'பரிபாடல் (கீரந்தையார்)', order_index: 2 },
                  { id: 'std-10-i2-l3', level: 'lesson', title_en: 'Megam (Poem)', title_ta: 'மேகம்', order_index: 3 },
                  { id: 'std-10-i2-l4', level: 'lesson', title_en: 'Birummam', title_ta: 'பிரும்மம்', order_index: 4 },
                  { id: 'std-10-i2-l5', level: 'lesson', title_en: 'Thogaanilaith Thodargal (Grammar)', title_ta: 'தொகாநிலைத் தொடர்கள் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-10-i3',
                level: 'unit',
                title_en: 'Iyal 3: Koottanjoru (கூட்டாஞ்சோறு)',
                title_ta: 'இயல் 3: கூட்டாஞ்சோறு (பண்பாடு)',
                order_index: 3,
                children: [
                  { id: 'std-10-i3-l1', level: 'lesson', title_en: 'Virunthu Potruthum! (Prose)', title_ta: 'விருந்து போற்றுதும்! (உரைநடை)', order_index: 1 },
                  { id: 'std-10-i3-l2', level: 'lesson', title_en: 'Kasi Kandam (Athiveerarama Pandiyar)', title_ta: 'காசிக் காண்டம் (அதிவீரராம பாண்டியர்)', order_index: 2 },
                  { id: 'std-10-i3-l3', level: 'lesson', title_en: 'Muthukumarasamy Pillaithamizh (Kumaraguruparar)', title_ta: 'முத்துக்குமாரசாமி பிள்ளைத்தமிழ் (குமரகுருபரர்)', order_index: 3 },
                  { id: 'std-10-i3-l4', level: 'lesson', title_en: 'Gopallapurathu Makkal (Ki. Rajanarayanan)', title_ta: 'கோபல்லபுரத்து மக்கள் (கி. ராஜநாராயணன்)', order_index: 4 },
                  { id: 'std-10-i3-l5', level: 'lesson', title_en: 'Thogainilaith Thodargal (Grammar)', title_ta: 'தொகைநிலைத் தொடர்கள் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-10-i3-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              },
              {
                id: 'std-10-i4',
                level: 'unit',
                title_en: 'Iyal 4: Manarkeni (மணற்கேணி)',
                title_ta: 'இயல் 4: மணற்கேணி (கல்வி)',
                order_index: 4,
                children: [
                  { id: 'std-10-i4-l1', level: 'lesson', title_en: 'Mozhipeyarppuk Kalvi (Translation Studies)', title_ta: 'மொழிபெயர்ப்புக் கல்வி (உரைநடை)', order_index: 1 },
                  { id: 'std-10-i4-l2', level: 'lesson', title_en: 'Thiruvilaiyadar Puranam (Paranjothi Munivar)', title_ta: 'திருவிளையாடற் புராணம் (பரஞ்சோதி முனிவர்)', order_index: 2 },
                  { id: 'std-10-i4-l3', level: 'lesson', title_en: 'Puthiya Nambikkai (Mary McLeod Bethune)', title_ta: 'புதிய நம்பிக்கை (மேரி மெக்லியோட் பெத்யூன் வரலாறு)', order_index: 3 },
                  { id: 'std-10-i4-l4', level: 'lesson', title_en: 'Ilakkanam Pothu (Grammar)', title_ta: 'இலக்கணம் - பொது (இலக்கணம்)', order_index: 4 },
                ]
              },
              {
                id: 'std-10-i5',
                level: 'unit',
                title_en: 'Iyal 5: Nilaa Mutram (நிலா முற்றம்)',
                title_ta: 'இயல் 5: நிலா முற்றம் (கலை, அழகியல்)',
                order_index: 5,
                children: [
                  { id: 'std-10-i5-l1', level: 'lesson', title_en: 'Panmuga Kalaignar (Prose)', title_ta: 'பன்முகக் கலைஞர்', order_index: 1 },
                  { id: 'std-10-i5-l2', level: 'lesson', title_en: 'Kambaramayanam (Kambar)', title_ta: 'கம்பராமாயணம் (கம்பர்)', order_index: 2 },
                  { id: 'std-10-i5-l3', level: 'lesson', title_en: 'Paaichal (Sa. Kandasamy)', title_ta: 'பாய்ச்சல் (சா. கந்தசாமி சிறுகதை)', order_index: 3 },
                  { id: 'std-10-i5-l4', level: 'lesson', title_en: 'Agapporul Ilakkanam (Grammar)', title_ta: 'அகப்பொருள் இலக்கணம் (இலக்கணம்)', order_index: 4 },
                  { id: 'std-10-i5-l5', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 5 },
                ]
              },
              {
                id: 'std-10-i6',
                level: 'unit',
                title_en: 'Iyal 6: Vithai Nel (விதை நெல்)',
                title_ta: 'இயல் 6: விதை நெல் (நாகரிகம், நாடு, சமூகம்)',
                order_index: 6,
                children: [
                  { id: 'std-10-i6-l1', level: 'lesson', title_en: 'Sitragal Oli (Ma.Po.Si Biography)', title_ta: 'சிற்றகல் ஒளி (ம.பொ. சிவஞானம் தன்வரலாறு)', order_index: 1 },
                  { id: 'std-10-i6-l2', level: 'lesson', title_en: 'Silappathikaram (Ilango Adigal)', title_ta: 'சிலப்பதிகாரம் (இளங்கோவடிகள்)', order_index: 2 },
                  { id: 'std-10-i6-l3', level: 'lesson', title_en: 'Muthollayiram', title_ta: 'முத்தொள்ளாயிரம்', order_index: 3 },
                  { id: 'std-10-i6-l4', level: 'lesson', title_en: 'Mangaiyaraaip Pirappatharke... (Women Achievers)', title_ta: 'மங்கையராய்ப் பிறப்பதற்கே... (எம்.எஸ். சுப்புலட்சுமி etc.)', order_index: 4 },
                  { id: 'std-10-i6-l5', level: 'lesson', title_en: 'Purapporul Ilakkanam (Grammar)', title_ta: 'புறப்பொருள் இலக்கணம் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-10-i7',
                level: 'unit',
                title_en: 'Iyal 7: Peruvazhi (பெருவழி)',
                title_ta: 'இயல் 7: பெருவழி (அறம், தத்துவம்)',
                order_index: 7,
                children: [
                  { id: 'std-10-i7-l1', level: 'lesson', title_en: 'Sanga Ilakkiyathil Aram (Dr. A. Sivalinganar)', title_ta: 'சங்க இலக்கியத்தில் அறம் (முனைவர் ஆ. சிவலிங்கனார்)', order_index: 1 },
                  { id: 'std-10-i7-l2', level: 'lesson', title_en: 'Thembavani (Veeramamunivar)', title_ta: 'தேம்பாவணி (வீரமாமுனிவர்)', order_index: 2 },
                  { id: 'std-10-i7-l3', level: 'lesson', title_en: 'Akkarai (Kalyanji)', title_ta: 'அக்கறை (கல்யாண்ஜி கவிதை)', order_index: 3 },
                  { id: 'std-10-i7-l4', level: 'lesson', title_en: 'Ramanujar (Drama)', title_ta: 'இராமானுசர் - நாடகம்', order_index: 4 },
                  { id: 'std-10-i7-l5', level: 'lesson', title_en: 'Paa Vagai, Alagiduthal (Grammar)', title_ta: 'பா வகை, அலகிடுதல் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-10-i7-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              }
            ]
          }
        ]
      },

      // =======================================================================
      // 11TH TAMIL (2025 Edition)
      // =======================================================================
      {
        id: 'std-11th',
        level: 'class',
        title_en: '11th Standard Tamil (2025 Edition)',
        title_ta: '11-ஆம் வகுப்பு பொதுத் தமிழ் (2025 புதிய பதிப்பு)',
        order_index: 11,
        children: [
          {
            id: 'std-11th-full',
            level: 'term',
            title_en: '11th Tamil - Complete Book (6 Iyals)',
            title_ta: 'பதினொன்றாம் வகுப்பு - முழு பாடநூல் (6 இயல்கள்)',
            order_index: 1,
            children: [
              {
                id: 'std-11-i1',
                level: 'unit',
                title_en: 'Iyal 1: Ennuyir Enben (என்னுயிர் என்பேன்)',
                title_ta: 'இயல் 1: என்னுயிர் என்பேன் (மொழி, கலை)',
                order_index: 1,
                children: [
                  { id: 'std-11-i1-l1', level: 'lesson', title_en: 'Yugathin Paadal (Su. Vilvarathinam)', title_ta: 'யுகத்தின் பாடல் (சு. வில்வரத்தினம்)', order_index: 1 },
                  { id: 'std-11-i1-l2', level: 'lesson', title_en: 'Pechumozhiyum Kavithai Mozhiyum (Indiran)', title_ta: 'பேச்சுமொழியும் கவிதை மொழியும் (இந்திரன்)', order_index: 2 },
                  { id: 'std-11-i1-l3', level: 'lesson', title_en: 'Ovvovru Pullaivum', title_ta: 'ஒவ்வொரு புல்லையும்', order_index: 3 },
                  { id: 'std-11-i1-l4', level: 'lesson', title_en: 'Isai Thamizhar Iruvar', title_ta: 'இசைத்தமிழர் இருவர்', order_index: 4 },
                  { id: 'std-11-i1-l5', level: 'lesson', title_en: 'Mozhi Muthal, Iruthi Eluthukal (Grammar)', title_ta: 'மொழி முதல், இறுதி எழுத்துகள் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-11-i2',
                level: 'unit',
                title_en: 'Iyal 2: Maamazhai Potruthum (மாமழை போற்றுதும்)',
                title_ta: 'இயல் 2: மாமழை போற்றுதும் (இயற்கை, வேளாண்மை)',
                order_index: 2,
                children: [
                  { id: 'std-11-i2-l1', level: 'lesson', title_en: 'Iyarkkai Velanmai (Natural Agriculture)', title_ta: 'இயற்கை வேளாண்மை (உரைநடை)', order_index: 1 },
                  { id: 'std-11-i2-l2', level: 'lesson', title_en: 'Aingurunuru (Peyanar)', title_ta: 'ஐங்குறுநூறு (பேயனார்)', order_index: 2 },
                  { id: 'std-11-i2-l3', level: 'lesson', title_en: 'Manonmaniyam (Prof. Sundaranar)', title_ta: 'மனோன்மணீயம் (பேராசிரியர் சுந்தரனார்)', order_index: 3 },
                  { id: 'std-11-i2-l4', level: 'lesson', title_en: 'Yanai Doctor (Jeyamohan)', title_ta: 'யானை டாக்டர் (ஜெயமோகன்)', order_index: 4 },
                  { id: 'std-11-i2-l5', level: 'lesson', title_en: 'Punarchi Vithigal (Grammar)', title_ta: 'புணர்ச்சி விதிகள் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-11-i2-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              },
              {
                id: 'std-11-i3',
                level: 'unit',
                title_en: 'Iyal 3: Peedu Pera Nil (பீடு பெற நில்)',
                title_ta: 'இயல் 3: பீடு பெற நில் (பண்பாடு)',
                order_index: 3,
                children: [
                  { id: 'std-11-i3-l1', level: 'lesson', title_en: 'Malai Idapechargal (R. Balakrishnan IAS)', title_ta: 'மலை இடப்பெயர்கள்: ஓர் ஆய்வு (ஆர். பாலகிருஷ்ணன் இ.ஆ.ப)', order_index: 1 },
                  { id: 'std-11-i3-l2', level: 'lesson', title_en: 'Kavadichinthu (Annamalaiyar)', title_ta: 'காவடிச்சிந்து (அண்ணாமலையார்)', order_index: 2 },
                  { id: 'std-11-i3-l3', level: 'lesson', title_en: 'Kurunthogai (Velliveethiyar)', title_ta: 'குறுந்தொகை (வெள்ளிவீதியார்)', order_index: 3 },
                  { id: 'std-11-i3-l4', level: 'lesson', title_en: 'Vadivasal (C.S. Chellappa)', title_ta: 'வாடிவாசல் (சி.சு. செல்லப்பா)', order_index: 4 },
                  { id: 'std-11-i3-l5', level: 'lesson', title_en: 'Pagupatha Uruppugal (Grammar)', title_ta: 'பகுபத உறுப்புகள் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-11-i4',
                level: 'unit',
                title_en: 'Iyal 4: Kedil Vizhuselvam (கேடில் விழுச்செல்வம்)',
                title_ta: 'இயல் 4: கேடில் விழுச்செல்வம் (கல்வி, அழகியல்)',
                order_index: 4,
                children: [
                  { id: 'std-11-i4-l1', level: 'lesson', title_en: 'Tamilnattu Kalvi Varalaru', title_ta: 'தமிழ்நாட்டுக் கல்வி வரலாறு (உரைநடை)', order_index: 1 },
                  { id: 'std-11-i4-l2', level: 'lesson', title_en: 'Pillaikkoodam (Na. Pitchamurthy)', title_ta: 'பிள்ளைக்கூடம் (ந. பிச்சமூர்த்தி)', order_index: 2 },
                  { id: 'std-11-i4-l3', level: 'lesson', title_en: 'Tholainthu Ponawargal (Abdul Rahman)', title_ta: 'தொலைந்து போனவர்கள் (அப்துல் ரகுமான்)', order_index: 3 },
                  { id: 'std-11-i4-l4', level: 'lesson', title_en: 'Ore Nanban', title_ta: 'ஒரே நண்பன்', order_index: 4 },
                  { id: 'std-11-i4-l5', level: 'lesson', title_en: 'Kalaichollakkam (Grammar)', title_ta: 'கலைச்சொல்லாக்கம் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-11-i4-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              },
              {
                id: 'std-11-i5',
                level: 'unit',
                title_en: 'Iyal 5: Naalellam Vinaisei (நாளெல்லாம் வினைசெய்)',
                title_ta: 'இயல் 5: நாளெல்லாம் வினைசெய் (நாகரிகம், தொழில்)',
                order_index: 5,
                children: [
                  { id: 'std-11-i5-l1', level: 'lesson', title_en: 'Anandarangar Naatkurippu', title_ta: 'ஆனந்தரங்கர் நாட்குறிப்பு (உரைநடை)', order_index: 1 },
                  { id: 'std-11-i5-l2', level: 'lesson', title_en: 'Seerapuranam (Umaru Pulavar)', title_ta: 'சீறாப்புராணம் (உமறுப்புலவர்)', order_index: 2 },
                  { id: 'std-11-i5-l3', level: 'lesson', title_en: 'Pathitruppathu (Kumattoor Kannanar)', title_ta: 'பதிற்றுப்பத்து (குமட்டூர்க் கண்ணனார்)', order_index: 3 },
                  { id: 'std-11-i5-l4', level: 'lesson', title_en: 'Sevvi', title_ta: 'செவ்வி', order_index: 4 },
                  { id: 'std-11-i5-l5', level: 'lesson', title_en: 'Aakkappeyargal (Grammar)', title_ta: 'ஆக்கப்பெயர்கள் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-11-i6',
                level: 'unit',
                title_en: 'Iyal 6: Vaiyath Thalaaimai Kol (வையத் தலைமை கொள்)',
                title_ta: 'இயல் 6: வையத் தலைமை கொள் (நாடு, அரசு, சமூகம்)',
                order_index: 6,
                children: [
                  { id: 'std-11-i6-l1', level: 'lesson', title_en: 'Kaattril Kalantha Peroosai (Sundara Ramasamy)', title_ta: 'காற்றில் கலந்த பேரோசை (சுந்தர ராமசாமி)', order_index: 1 },
                  { id: 'std-11-i6-l2', level: 'lesson', title_en: 'Puratchikavi (Bharathidasan)', title_ta: 'புரட்சிக்கவி (பாரதிதாசன்)', order_index: 2 },
                  { id: 'std-11-i6-l3', level: 'lesson', title_en: 'Athisayamalar', title_ta: 'அதிசயமலர்', order_index: 3 },
                  { id: 'std-11-i6-l4', level: 'lesson', title_en: 'Ayalnaattavarin Arum Thamizhppani', title_ta: 'அயல்நாட்டவரின் அருந்தமிழ்ப் பணி (உரைநடை)', order_index: 4 },
                  { id: 'std-11-i6-l5', level: 'lesson', title_en: 'Meypputh Thiruthak Kuriyeedugal (Grammar)', title_ta: 'மெய்ப்புத் திருத்தக் குறியீடுகள் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-11-i6-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              }
            ]
          }
        ]
      },

      // =======================================================================
      // 12TH TAMIL (2025 Edition)
      // =======================================================================
      {
        id: 'std-12th',
        level: 'class',
        title_en: '12th Standard Tamil (2025 Edition)',
        title_ta: '12-ஆம் வகுப்பு பொதுத் தமிழ் (2025 புதிய பதிப்பு)',
        order_index: 12,
        children: [
          {
            id: 'std-12th-full',
            level: 'term',
            title_en: '12th Tamil - Complete Book (6 Iyals)',
            title_ta: 'பன்னிரண்டாம் வகுப்பு - முழு பாடநூல் (6 இயல்கள்)',
            order_index: 1,
            children: [
              {
                id: 'std-12-i1',
                level: 'unit',
                title_en: 'Iyal 1: Uyirinum Oombappadum (உயிரினும் ஓம்பப் படும்)',
                title_ta: 'இயல் 1: உயிரினும் ஓம்பப் படும் (மொழி, கலை)',
                order_index: 1,
                children: [
                  { id: 'std-12-i1-l1', level: 'lesson', title_en: 'Thanner Illatha Thamizh (Dandi Alankaram)', title_ta: 'தன்னேர் இல்லாத தமிழ் (தண்டியலங்காரம்)', order_index: 1 },
                  { id: 'std-12-i1-l2', level: 'lesson', title_en: 'Namathu Mozhiyin Adayalangalai Meettavar', title_ta: 'நமது மொழியின் அடையாளங்களை மீட்டவர் (உரைநடை)', order_index: 2 },
                  { id: 'std-12-i1-l3', level: 'lesson', title_en: 'Ilam Thamizhe! (Sirpi Balasubramaniam)', title_ta: 'இளந்தமிழே! (சிற்பி பாலசுப்பிரமணியம்)', order_index: 3 },
                  { id: 'std-12-i1-l4', level: 'lesson', title_en: 'Thambi Nellaiyapparukku (Bharathiyar)', title_ta: 'தம்பி நெல்லையப்பருக்கு (பாரதியார் கடிதம்)', order_index: 4 },
                  { id: 'std-12-i1-l5', level: 'lesson', title_en: 'Tamizhaai Ezhuthuvom (Grammar)', title_ta: 'தமிழாய் எழுதுவோம் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-12-i2',
                level: 'unit',
                title_en: 'Iyal 2: Peyyenap Peyyum Mazhai (பெய்யெனப் பெய்யும் மழை)',
                title_ta: 'இயல் 2: பெய்யெனப் பெய்யும் மழை (இயற்கை, வேளாண்மை)',
                order_index: 2,
                children: [
                  { id: 'std-12-i2-l1', level: 'lesson', title_en: 'Madrasapattinam (Chennai History)', title_ta: 'மதராசப்பட்டினம் (சென்னை வரலாறு - உரைநடை)', order_index: 1 },
                  { id: 'std-12-i2-l2', level: 'lesson', title_en: 'Piragoru Naal Kodai (Ayyappa Madhavan)', title_ta: 'பிறகொரு நாள் கோடை (அய்யப்ப மாதவன்)', order_index: 2 },
                  { id: 'std-12-i2-l3', level: 'lesson', title_en: 'Nedunalvaadai (Nakkeerar)', title_ta: 'நெடுநல்வாடை (நக்கீரர்)', order_index: 3 },
                  { id: 'std-12-i2-l4', level: 'lesson', title_en: 'Muthalkal (Uthama Chozhan)', title_ta: 'முதல்கல் (உத்தமசோழன் சிறுகதை)', order_index: 4 },
                  { id: 'std-12-i2-l5', level: 'lesson', title_en: 'Naalvakai Poruthangal (Grammar)', title_ta: 'நால்வகைப் பொருத்தங்கள் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-12-i2-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              },
              {
                id: 'std-12-i3',
                level: 'unit',
                title_en: 'Iyal 3: Suttathaar Kanne Ula (சுற்றத்தார் கண்ணே உள)',
                title_ta: 'இயல் 3: சுற்றத்தார் கண்ணே உள (பண்பாடு)',
                order_index: 3,
                children: [
                  { id: 'std-12-i3-l1', level: 'lesson', title_en: 'Tamizhar Kudumba Murai (Bakthavathsala Bharathi)', title_ta: 'தமிழர் குடும்ப முறை (பக்தவத்சல பாரதி)', order_index: 1 },
                  { id: 'std-12-i3-l2', level: 'lesson', title_en: 'Virunthinar Illam (Jalaluddin Rumi)', title_ta: 'விருந்தினர் இல்லம் (ஜலாலுத்தீன் ரூமி)', order_index: 2 },
                  { id: 'std-12-i3-l3', level: 'lesson', title_en: 'Kambaramayanam (Kambar)', title_ta: 'கம்பராமாயணம் (கம்பர்)', order_index: 3 },
                  { id: 'std-12-i3-l4', level: 'lesson', title_en: 'Urimai Thaagam (Poomani)', title_ta: 'உரிமைத் தாகம் (பூமணி)', order_index: 4 },
                  { id: 'std-12-i3-l5', level: 'lesson', title_en: 'Porul Mayakkam (Grammar)', title_ta: 'பொருள் மயக்கம் (இலக்கணம்)', order_index: 5 },
                ]
              },
              {
                id: 'std-12-i4',
                level: 'unit',
                title_en: 'Iyal 4: Selvathul Ellam Thalai (செல்வத்துள் எல்லாம் தலை)',
                title_ta: 'இயல் 4: செல்வத்துள் எல்லாம் தலை (கல்வி, அழகியல்)',
                order_index: 4,
                children: [
                  { id: 'std-12-i4-l1', level: 'lesson', title_en: 'Pandaiya Kaalathu Pallikkoodangal (U.Ve.Sa)', title_ta: 'பண்டைய காலத்துப் பள்ளிக்கூடங்கள் (உ.வே. சாமிநாதையர்)', order_index: 1 },
                  { id: 'std-12-i4-l2', level: 'lesson', title_en: 'Nakulan Kavithaigal', title_ta: 'நகுலன் கவிதைகள்', order_index: 2 },
                  { id: 'std-12-i4-l3', level: 'lesson', title_en: 'Kaviyam (Pramil)', title_ta: 'காவியம் (பிரமிள்)', order_index: 3 },
                  { id: 'std-12-i4-l4', level: 'lesson', title_en: 'Silappathikaram (Vazhakurai Kaathai)', title_ta: 'சிலப்பதிகாரம் (இளங்கோவடிகள்)', order_index: 4 },
                  { id: 'std-12-i4-l5', level: 'lesson', title_en: 'Sirpanaip Pirasavikkum Paarai', title_ta: 'சிற்பனைப் பிரசவிக்கும் பாறை', order_index: 5 },
                  { id: 'std-12-i4-l6', level: 'lesson', title_en: 'Meyppaadu (Grammar)', title_ta: 'மெய்ப்பாடு (இலக்கணம்)', order_index: 6 },
                  { id: 'std-12-i4-l7', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 7 },
                ]
              },
              {
                id: 'std-12-i5',
                level: 'unit',
                title_en: 'Iyal 5: Arumai Udaya Seyal (அருமை உடைய செயல்)',
                title_ta: 'இயல் 5: அருமை உடைய செயல் (நாகரிகம், தொழில்)',
                order_index: 5,
                children: [
                  { id: 'std-12-i5-l1', level: 'lesson', title_en: 'Thiraimozhi (Cinema Language)', title_ta: 'திரைமொழி (உரைநடை)', order_index: 1 },
                  { id: 'std-12-i5-l2', level: 'lesson', title_en: 'Dheivamanimaalai (Vallalar)', title_ta: 'தெய்வமணிமாலை (வள்ளலார் - இராமலிங்க அடிகள்)', order_index: 2 },
                  { id: 'std-12-i5-l3', level: 'lesson', title_en: 'Perumal Thirumozhi (Kulashekara Azhwar)', title_ta: 'பெருமாள் திருமொழி (குலசேகராழ்வார்)', order_index: 3 },
                  { id: 'std-12-i5-l4', level: 'lesson', title_en: 'Thevaram (Thirugnanasambandar)', title_ta: 'தேவாரம் (திருஞானசம்பந்தர்)', order_index: 4 },
                  { id: 'std-12-i5-l5', level: 'lesson', title_en: 'Nadigar Thilagam Sivaji Ganesan', title_ta: 'நடிகர் திலகம் (சிவாஜி கணேசன்)', order_index: 5 },
                  { id: 'std-12-i5-l6', level: 'lesson', title_en: 'Padaippaakka Utthigal (Grammar)', title_ta: 'படைப்பாக்க உத்திகள் (உவமை, உருவகம் etc.)', order_index: 6 },
                ]
              },
              {
                id: 'std-12-i6',
                level: 'unit',
                title_en: 'Iyal 6: Ella Uyirum Thozhum (எல்லா உயிரும் தொழும்)',
                title_ta: 'இயல் 6: எல்லா உயிரும் தொழும் (நாடு, சமூகம், மனிதநேயம்)',
                order_index: 6,
                children: [
                  { id: 'std-12-i6-l1', level: 'lesson', title_en: 'Ilakkiyathil Melaanmai (V. Irai Anbu IAS)', title_ta: 'இலக்கியத்தில் மேலாண்மை (வே. இறையன்பு இ.ஆ.ப)', order_index: 1 },
                  { id: 'std-12-i6-l2', level: 'lesson', title_en: 'Ratchaniya Yaathirigam (H.A. Krishna Pillai)', title_ta: 'இரட்சணிய யாத்திரிகம் (எச்.ஏ. கிருஷ்ணபிள்ளை)', order_index: 2 },
                  { id: 'std-12-i6-l3', level: 'lesson', title_en: 'Purananuru (Okkoor Maasathiyar)', title_ta: 'புறநானூறு (ஒக்கூர் மாசாத்தியார்)', order_index: 3 },
                  { id: 'std-12-i6-l4', level: 'lesson', title_en: 'Kodaimazhai', title_ta: 'கோடைமழை', order_index: 4 },
                  { id: 'std-12-i6-l5', level: 'lesson', title_en: 'Thonmam (Grammar - Myth)', title_ta: 'தொன்மம் (இலக்கணம்)', order_index: 5 },
                  { id: 'std-12-i6-l6', level: 'lesson', title_en: 'Thirukkural', title_ta: 'திருக்குறள்', order_index: 6 },
                ]
              }
            ]
          }
        ]
      }
    ];

    async function insertNodeRecursive(node, parentId = null) {
      await client.query(
        `INSERT INTO public.syllabus_nodes (id, parent_id, level, title_en, title_ta, order_index, exam_ids, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (id) DO UPDATE SET
            parent_id = EXCLUDED.parent_id,
            level = EXCLUDED.level,
            title_en = EXCLUDED.title_en,
            title_ta = EXCLUDED.title_ta,
            order_index = EXCLUDED.order_index;`,
        [node.id, parentId, node.level, node.title_en, node.title_ta, node.order_index, ['group_4', 'group_2', 'group_2a']]
      );

      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          await insertNodeRecursive(child, node.id);
        }
      }
    }

    // Delete old placeholder standard nodes
    await client.query(`DELETE FROM public.syllabus_nodes WHERE level = 'class' OR parent_id LIKE 'std-%';`);

    for (const book of accurateBooks) {
      console.log(`Seeding exact 2025 structure for: ${book.title_ta}...`);
      await insertNodeRecursive(book);
    }

    console.log('ALL 11 Tamil Books (6th to 12th) 2025 Edition Seeded Successfully!');
  } catch (err) {
    console.error('Error seeding accurate Tamil books:', err);
  } finally {
    await client.end();
  }
}

seedAccurateTamilBooks();

