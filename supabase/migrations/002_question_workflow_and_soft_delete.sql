-- ========================================================================
-- 002: QUESTION WORKFLOW, AUDIT, AND SOFT DELETION ENHANCEMENTS
-- ========================================================================

-- 1. Add soft deletion and archive columns to questions table
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES public.profiles(id) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS archive_reason TEXT DEFAULT NULL;

-- 2. Performance indexes for workflow filtering and soft deletion
CREATE INDEX IF NOT EXISTS idx_questions_deleted_at ON public.questions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_questions_archived_deleted ON public.questions(is_archived, deleted_at);

-- 3. Update learner policy on questions to ensure deleted/archived/draft questions are never exposed to learners
DROP POLICY IF EXISTS "Learners can read verified published questions" ON public.questions;
CREATE POLICY "Learners can read verified published questions" ON public.questions
    FOR SELECT TO authenticated USING (
        (workflow->>'status' = 'published' AND is_archived = false AND deleted_at IS NULL)
        OR public.is_admin()
    );

-- 4. Audit logs index on entity
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
