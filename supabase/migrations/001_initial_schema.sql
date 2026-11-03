
-- ========================================================================
-- TNPSC PRACTICE PLATFORM - COMPLETE DATABASE SCHEMA & RLS POLICIES
-- ========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------------------
-- 1. PROFILES & ROLES
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'learner')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    target_exam_id TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'ta' CHECK (preferred_language IN ('ta', 'en')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------
-- 2. EXAMINATIONS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exams (
    id TEXT PRIMARY KEY, -- 'group_4', 'group_2', 'group_2a'
    title_en TEXT NOT NULL,
    title_ta TEXT NOT NULL,
    description_en TEXT,
    description_ta TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    config JSONB NOT NULL DEFAULT '{"total_marks": 300, "duration_minutes": 180, "total_questions": 200, "negative_marking": false}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------
-- 3. SYLLABUS HIERARCHY
-- Class -> Subject -> Term -> Unit -> Lesson -> Chapter -> Topic -> Subtopic
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.syllabus_nodes (
    id TEXT PRIMARY KEY,
    parent_id TEXT REFERENCES public.syllabus_nodes(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('class', 'subject', 'term', 'unit', 'lesson', 'chapter', 'topic', 'subtopic')),
    code TEXT,
    title_en TEXT NOT NULL,
    title_ta TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    exam_ids TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_syllabus_parent ON public.syllabus_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_level ON public.syllabus_nodes(level);
CREATE INDEX IF NOT EXISTS idx_syllabus_exams ON public.syllabus_nodes USING GIN(exam_ids);

-- ------------------------------------------------------------------------
-- 4. QUESTION BANK (Universal Authoritative Schema)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    schema_version TEXT NOT NULL DEFAULT '1.0.0',
    kind TEXT NOT NULL CHECK (kind IN (
        'direct_mcq', 
        'statement_analysis', 
        'assertion_reason', 
        'match_the_following', 
        'arrange_in_order', 
        'numeric', 
        'odd_one_out', 
        'grammar_application', 
        'quote_completion', 
        'passage_based', 
        'table_based', 
        'image_based'
    )),
    level TEXT NOT NULL DEFAULT 'prelims' CHECK (level IN ('prelims', 'mains', 'foundation')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    exam_mappings JSONB NOT NULL DEFAULT '[]'::jsonb,
    syllabus JSONB NOT NULL DEFAULT '{}'::jsonb,
    texts JSONB NOT NULL, -- { ta: { question, options, explanation }, en: { question, options, explanation } }
    question_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- extra payload (pairs, statements, passage)
    answer JSONB NOT NULL, -- { correct_option_id, acceptable_answers, match_pairs, ... }
    question_settings JSONB NOT NULL DEFAULT '{"marks": 1.5, "negative_marks": 0.0}'::jsonb,
    source JSONB NOT NULL DEFAULT '{}'::jsonb, -- { book, standard, term, page }
    previous_year JSONB NOT NULL DEFAULT '{}'::jsonb, -- { exam, year, session, q_no }
    media JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] NOT NULL DEFAULT '{}',
    language_status TEXT NOT NULL DEFAULT 'bilingual' CHECK (language_status IN ('bilingual', 'tamil_only', 'english_only')),
    workflow JSONB NOT NULL DEFAULT '{"status": "draft", "verified_by": null, "verified_at": null, "verification_comments": []}'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_kind ON public.questions(kind);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_workflow_status ON public.questions((workflow->>'status'));
CREATE INDEX IF NOT EXISTS idx_questions_is_archived ON public.questions(is_archived);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON public.questions USING GIN(tags);

-- Trigram index for search on questions in Tamil and English
CREATE INDEX IF NOT EXISTS idx_questions_texts_trgm ON public.questions USING GIN((texts::text) gin_trgm_ops);

-- ------------------------------------------------------------------------
-- 5. TEST TEMPLATES & CONFIGURATIONS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.test_templates (
    id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ta TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'full_mock', 
        'previous_year', 
        'part_test', 
        'unit_quiz', 
        'chapter_quiz', 
        'current_affairs', 
        'practice_now', 
        'due_review', 
        'custom'
    )),
    exam_id TEXT REFERENCES public.exams(id) ON DELETE SET NULL,
    duration_minutes INTEGER NOT NULL,
    total_marks NUMERIC(6,2) NOT NULL,
    negative_marking_rate NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    question_count INTEGER NOT NULL,
    question_ids TEXT[] NOT NULL DEFAULT '{}',
    rules JSONB NOT NULL DEFAULT '{"randomize_questions": false, "randomize_options": false, "allow_language_toggle": true}'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------
-- 6. TEST ATTEMPTS (Learner Private)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    test_template_id TEXT REFERENCES public.test_templates(id) ON DELETE SET NULL,
    exam_id TEXT REFERENCES public.exams(id) ON DELETE SET NULL,
    title_en TEXT,
    title_ta TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    total_time_seconds INTEGER NOT NULL DEFAULT 0,
    score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    accuracy_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL DEFAULT 0,
    wrong_count INTEGER NOT NULL DEFAULT 0,
    unanswered_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON public.test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_status ON public.test_attempts(status);

-- ------------------------------------------------------------------------
-- 7. TEST ATTEMPT ITEMS (Question Snapshots & Answers)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.test_attempt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES public.questions(id),
    question_order INTEGER NOT NULL DEFAULT 0,
    question_snapshot JSONB NOT NULL, -- Preserves exact question text, options, answer key at time of test
    selected_answer JSONB, -- Selected option or response
    is_answered BOOLEAN NOT NULL DEFAULT false,
    is_marked_for_review BOOLEAN NOT NULL DEFAULT false,
    is_correct BOOLEAN,
    marks_obtained NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_test_attempt_items_attempt ON public.test_attempt_items(attempt_id);
CREATE INDEX IF NOT EXISTS idx_test_attempt_items_user ON public.test_attempt_items(user_id);

-- ------------------------------------------------------------------------
-- 8. MISTAKE VAULT & REVISION SYSTEM (Learner Private)
-- Spaced repetition intervals: Level 0 (1d), 1 (3d), 2 (7d), 3 (14d), 4 (30d), 5 (Mastered)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mistake_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES public.questions(id),
    source_attempt_id UUID REFERENCES public.test_attempts(id) ON DELETE SET NULL,
    reason TEXT NOT NULL CHECK (reason IN ('wrong_answer', 'unanswered', 'marked_difficult', 'manual_add')),
    repetition_level INTEGER NOT NULL DEFAULT 0 CHECK (repetition_level BETWEEN 0 AND 5),
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 day'),
    review_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 1,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    last_reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_mistake_vault_user ON public.mistake_vault(user_id);
CREATE INDEX IF NOT EXISTS idx_mistake_vault_next_review ON public.mistake_vault(user_id, next_review_at) WHERE is_resolved = false;

-- ------------------------------------------------------------------------
-- 9. LEARNER SYLLABUS PROGRESS (Learner Private)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learner_syllabus_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    syllabus_node_id TEXT NOT NULL REFERENCES public.syllabus_nodes(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    questions_practiced INTEGER NOT NULL DEFAULT 0,
    accuracy_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, syllabus_node_id)
);

CREATE INDEX IF NOT EXISTS idx_learner_syllabus_user ON public.learner_syllabus_progress(user_id);

-- ------------------------------------------------------------------------
-- 10. AUDIT LOGS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistake_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_syllabus_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON public.profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Users can update own non-role fields" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. Exams Policies
CREATE POLICY "Authenticated users can read active exams" ON public.exams
    FOR SELECT TO authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage exams" ON public.exams
    FOR ALL TO authenticated USING (public.is_admin());

-- 3. Syllabus Policies
CREATE POLICY "Authenticated users can read active syllabus" ON public.syllabus_nodes
    FOR SELECT TO authenticated USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage syllabus" ON public.syllabus_nodes
    FOR ALL TO authenticated USING (public.is_admin());

-- 4. Questions Policies
CREATE POLICY "Learners can read verified published questions" ON public.questions
    FOR SELECT TO authenticated USING (
        (workflow->>'status' = 'published' AND is_archived = false)
        OR public.is_admin()
    );

CREATE POLICY "Admins can manage all questions" ON public.questions
    FOR ALL TO authenticated USING (public.is_admin());

-- 5. Test Templates Policies
CREATE POLICY "Learners can read published test templates" ON public.test_templates
    FOR SELECT TO authenticated USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins can manage all test templates" ON public.test_templates
    FOR ALL TO authenticated USING (public.is_admin());

-- 6. Test Attempts (STRICT LEARNER ISOLATION)
CREATE POLICY "Users can only read own test attempts" ON public.test_attempts
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test attempts" ON public.test_attempts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test attempts" ON public.test_attempts
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 7. Test Attempt Items (STRICT LEARNER ISOLATION)
CREATE POLICY "Users can only read own attempt items" ON public.test_attempt_items
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempt items" ON public.test_attempt_items
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempt items" ON public.test_attempt_items
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 8. Mistake Vault (STRICT LEARNER ISOLATION)
CREATE POLICY "Users can only read own mistake vault" ON public.mistake_vault
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mistake vault items" ON public.mistake_vault
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mistake vault items" ON public.mistake_vault
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mistake vault items" ON public.mistake_vault
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 9. Learner Syllabus Progress (STRICT LEARNER ISOLATION)
CREATE POLICY "Users can only read own syllabus progress" ON public.learner_syllabus_progress
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own syllabus progress" ON public.learner_syllabus_progress
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 10. Audit Logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);

-- ------------------------------------------------------------------------
-- SEED INITIAL EXAMS (Group 4, Group 2, Group 2A)
-- ------------------------------------------------------------------------
INSERT INTO public.exams (id, title_en, title_ta, description_en, description_ta, is_active, config)
VALUES 
    (
        'group_4', 
        'TNPSC Group 4 (VAO & Junior Assistant)', 
        'டி.என்.பி.எஸ்.சி குரூப் 4 (கிராம நிர்வாக அலுவலர் & இளநிலை உதவியாளர்)',
        'Single stage written examination comprising General Tamil/English (100 Qs), General Studies (75 Qs), and Aptitude (25 Qs).',
        'பொதுத் தமிழ் (100 வினாக்கள்), பொது அறிவு (75 வினாக்கள்), திறனறி தேர்வு (25 வினாக்கள்) கொண்ட தேர்வு.',
        true,
        '{"total_marks": 300, "duration_minutes": 180, "total_questions": 200, "negative_marking": false}'::jsonb
    ),
    (
        'group_2', 
        'TNPSC Group 2 (Interview Posts)', 
        'டி.என்.பி.எஸ்.சி குரூப் 2 (நேர்முகப் பதவிகள்)',
        'Combined Civil Services Examination-II for executive and interview posts.',
        'ஒருங்கிணைந்த குடிமைப் பணிகள் தேர்வு-II (நேர்முகப் பதவிகள்).',
        true,
        '{"total_marks": 300, "duration_minutes": 180, "total_questions": 200, "negative_marking": false}'::jsonb
    ),
    (
        'group_2a', 
        'TNPSC Group 2A (Non-Interview Posts)', 
        'டி.என்.பி.எஸ்.சி குரூப் 2A (நேர்முகத் தேர்வல்லா பதவிகள்)',
        'Combined Civil Services Examination-IIA for non-interview ministerial posts.',
        'ஒருங்கிணைந்த குடிமைப் பணிகள் தேர்வு-IIA (நேர்முகத் தேர்வல்லா பதவிகள்).',
        true,
        '{"total_marks": 300, "duration_minutes": 180, "total_questions": 200, "negative_marking": false}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;
