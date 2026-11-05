-- ========================================================================
-- TNPSC PRACTICE PLATFORM - MODULE 17: PYQ ARCHIVE & QUESTION MANAGEMENT
-- Migration 004: pyq_papers and pyq_paper_questions tables
-- ========================================================================

-- 1. Create PYQ Papers Table
CREATE TABLE IF NOT EXISTS public.pyq_papers (
    id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ta TEXT NOT NULL,
    exam_id TEXT NOT NULL REFERENCES public.exams(id) ON DELETE RESTRICT,
    exam_group TEXT NOT NULL DEFAULT 'Group 4',
    year INTEGER NOT NULL,
    date_held DATE,
    paper_code TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 180,
    total_marks NUMERIC(6,2) NOT NULL DEFAULT 300.00,
    expected_question_count INTEGER NOT NULL DEFAULT 200,
    instructions_en TEXT,
    instructions_ta TEXT,
    high_yield_topics TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'ready_to_publish', 'published', 'archived')),
    is_archived BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMPTZ,
    archived_by UUID REFERENCES public.profiles(id),
    archive_reason TEXT,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.profiles(id),
    deletion_reason TEXT,
    test_template_id TEXT REFERENCES public.test_templates(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pyq_papers_exam ON public.pyq_papers(exam_id);
CREATE INDEX IF NOT EXISTS idx_pyq_papers_year ON public.pyq_papers(year);
CREATE INDEX IF NOT EXISTS idx_pyq_papers_status ON public.pyq_papers(status);
CREATE INDEX IF NOT EXISTS idx_pyq_papers_archived ON public.pyq_papers(is_archived);
CREATE INDEX IF NOT EXISTS idx_pyq_papers_deleted ON public.pyq_papers(deleted_at);

-- 2. Create PYQ Paper Questions Mapping Table
CREATE TABLE IF NOT EXISTS public.pyq_paper_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id TEXT NOT NULL REFERENCES public.pyq_papers(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL DEFAULT 1,
    section_name TEXT,
    marks NUMERIC(5,2) DEFAULT 1.5,
    negative_marks NUMERIC(4,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(paper_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_pyq_paper_questions_paper_order ON public.pyq_paper_questions(paper_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_pyq_paper_questions_question ON public.pyq_paper_questions(question_id);

-- Enable RLS
ALTER TABLE public.pyq_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pyq_paper_questions ENABLE ROW LEVEL SECURITY;

-- Admins: Full Access
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admin full access on pyq_papers" ON public.pyq_papers;
    DROP POLICY IF EXISTS "Admin full access on pyq_paper_questions" ON public.pyq_paper_questions;
    DROP POLICY IF EXISTS "Learners can view published pyq_papers" ON public.pyq_papers;
    DROP POLICY IF EXISTS "Learners can view questions of published papers" ON public.pyq_paper_questions;
END $$;

CREATE POLICY "Admin full access on pyq_papers"
    ON public.pyq_papers FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access on pyq_paper_questions"
    ON public.pyq_paper_questions FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Learners: Read-only on published active papers
CREATE POLICY "Learners can view published pyq_papers"
    ON public.pyq_papers FOR SELECT
    USING (status = 'published' AND is_archived = false AND deleted_at IS NULL);

CREATE POLICY "Learners can view questions of published papers"
    ON public.pyq_paper_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.pyq_papers p
            WHERE p.id = pyq_paper_questions.paper_id
            AND p.status = 'published'
            AND p.is_archived = false
            AND p.deleted_at IS NULL
        )
    );

-- Seed Initial Official PYQ Papers
INSERT INTO public.pyq_papers (
    id, title_en, title_ta, exam_id, exam_group, year, date_held, paper_code,
    duration_minutes, total_marks, expected_question_count, high_yield_topics, status
) VALUES 
(
    'PYQ-G4-2024',
    'TNPSC Group 4 Official Question Paper 2024',
    'டி.என்.பி.எஸ்.சி குரூப் 4 அசல் வினாத்தாள் 2024',
    'group_4',
    'Group 4',
    2024,
    '2024-06-09',
    'G4-2024-FN',
    180,
    300.00,
    200,
    ARRAY['பகுதி அ: தமிழ் இலக்கணம் & மரபு', 'திருக்குறள் அதிகாரங்கள்', 'அரசியலமைப்பு முகப்புரை & அடிப்படை உரிமைகள்', 'கணிதம்: தனிவட்டி, கூட்டுவட்டி', 'விடுதலைப் போராட்டத்தில் தமிழகத்தின் பங்கு'],
    'ready_to_publish'
),
(
    'PYQ-G4-2022',
    'TNPSC Group 4 Official Question Paper 2022',
    'டி.என்.பி.எஸ்.சி குரூப் 4 அசல் வினாத்தாள் 2022',
    'group_4',
    'Group 4',
    2022,
    '2022-07-24',
    'G4-2022-FN',
    180,
    300.00,
    200,
    ARRAY['பாரதிதாசன் & பாரதியார் படைப்புகள்', '42-வது அரசியலமைப்பு சட்டத்திருத்தம்', 'கீழடி தொல்லியல் அகழாய்வு', 'மீ.பொ.வ மற்றும் மீ.பொ.ம கணக்குகள்', 'நீதிக்கட்சி & சுயமரியாதை இயக்கம்'],
    'published'
),
(
    'PYQ-G2-2022',
    'TNPSC Group 2 & 2A Prelims Official Question Paper 2022',
    'டி.என்.பி.எஸ்.சி குரூப் 2 / 2A முதல்நிலை அசல் வினாத்தாள் 2022',
    'group_2',
    'Group 2',
    2022,
    '2022-05-21',
    'G2-2022-PRE',
    180,
    300.00,
    200,
    ARRAY['சங்க இலக்கியம்: புறநானூறு & நற்றிணை', 'மத்திய-மாநில உறவுகள் (சர்க்காரியா ஆணையம்)', 'அறிவியல்: மரபியல் & நோயியல்', 'விகிதம் & விகிதாச்சாரம்', 'வைக்கம் போராட்டம் & பெரியார்'],
    'ready_to_publish'
),
(
    'PYQ-G4-2019',
    'TNPSC Group 4 Official Question Paper 2019',
    'டி.என்.பி.எஸ்.சி குரூப் 4 அசல் வினாத்தாள் 2019',
    'group_4',
    'Group 4',
    2019,
    '2019-09-01',
    'G4-2019-FN',
    180,
    300.00,
    200,
    ARRAY['எட்டுத்தொகை & பத்துப்பாட்டு நூல்கள்', 'பஞ்சாயத்து ராஜ் & 73-வது சட்டத்திருத்தம்', 'காலம் மற்றும் வேலை கணக்குகள்', 'வேலு நாச்சியார் & மருது சகோதரர்கள்', 'சுருக்குதல் & வர்க்கமூலம்'],
    'ready_to_publish'
)
ON CONFLICT (id) DO NOTHING;

