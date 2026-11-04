-- ========================================================================
-- TNPSC PRACTICE PLATFORM - MODULE 18: TEST TEMPLATES MULTI-EXAM MAPPING
-- Migration 005: Add exam_scope and exam_ids to test_templates
-- ========================================================================

-- 1. Add exam_scope and exam_ids columns to test_templates
ALTER TABLE public.test_templates 
ADD COLUMN IF NOT EXISTS exam_scope TEXT NOT NULL DEFAULT 'selected' CHECK (exam_scope IN ('all_groups', 'selected')),
ADD COLUMN IF NOT EXISTS exam_ids TEXT[] NOT NULL DEFAULT '{}';

-- 2. Populate exam_ids from existing exam_id for backwards compatibility
UPDATE public.test_templates
SET 
  exam_ids = ARRAY[exam_id]::text[],
  exam_scope = 'selected'
WHERE exam_id IS NOT NULL AND (exam_ids IS NULL OR cardinality(exam_ids) = 0);

-- 3. Create index for fast multi-exam queries
CREATE INDEX IF NOT EXISTS idx_test_templates_exam_scope ON public.test_templates(exam_scope);
CREATE INDEX IF NOT EXISTS idx_test_templates_exam_ids ON public.test_templates USING GIN (exam_ids);

