// ========================================================================
// TNPSC PRACTICE PLATFORM - ZOD QUESTION SCHEMA FOR VALIDATION & IMPORTS
// ========================================================================
import { z } from 'zod';

export const OptionItemSchema = z.object({
  id: z.string().min(1, 'Option key/id is required (e.g., A, B, C, D)'),
  text: z.string().min(1, 'Option text cannot be empty'),
});

export const LanguageContentSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  options: z.array(OptionItemSchema).optional(),
  explanation: z.string().optional().default(''),
});

export const BilingualTextsSchema = z.object({
  ta: LanguageContentSchema,
  en: LanguageContentSchema.optional(),
});

export const ExamMappingSchema = z.object({
  exam_id: z.string().min(1, 'Exam ID is required'),
  is_relevant: z.boolean().default(true),
  frequency_score: z.number().optional(),
  notes: z.string().nullable().optional(),
});

export const SyllabusMappingSchema = z.object({
  class_id: z.string().nullable().optional(),
  subject_id: z.string().default('general_tamil'),
  term_id: z.string().nullable().optional(),
  unit_id: z.string().nullable().optional(),
  lesson_id: z.string().nullable().optional(),
  chapter_id: z.string().nullable().optional(),
  topic_id: z.string().nullable().optional(),
  subtopic_id: z.string().nullable().optional(),
}).passthrough();

export const QuestionDataPayloadSchema = z.record(z.string(), z.any()).default({});

export const QuestionAnswerSchema = z.object({
  correct_option_id: z.string().optional(),
  correct_key: z.string().optional(),
  acceptable_answers: z.array(z.string()).optional(),
  accepted_keys: z.array(z.string()).optional(),
  correct_order: z.array(z.any()).optional(),
  matching_answer: z.array(z.any()).optional(),
  numeric_value: z.any().optional(),
  answer_notes: z.string().nullable().optional(),
  match_pairs: z.record(z.string(), z.string()).optional(),
  numeric_target: z.number().optional(),
  tolerance: z.number().optional(),
  ordered_sequence: z.array(z.string()).optional(),
  explanation_summary: z.string().optional(),
}).passthrough();

export const QuestionSettingsSchema = z.object({
  marks: z.number().default(1.5),
  negative_marks: z.number().default(0.0),
  time_guideline_seconds: z.number().optional().default(60),
}).passthrough();

export const QuestionSourceSchema = z.record(z.string(), z.any()).default({});

export const PreviousYearReferenceSchema = z.record(z.string(), z.any()).default({});

export const MediaItemSchema = z.object({
  type: z.enum(['image', 'diagram', 'map']),
  url: z.string().url('Media item must have a valid URL'),
  caption_ta: z.string().optional(),
  caption_en: z.string().optional(),
});

export const VerificationCommentSchema = z.object({
  author_id: z.string(),
  author_name: z.string(),
  comment: z.string(),
  created_at: z.string(),
});

export const QuestionWorkflowSchema = z.object({
  status: z.enum(['draft', 'under_review', 'verified', 'published', 'rejected']).default('draft'),
  verified_by: z.string().nullable().optional(),
  verified_at: z.string().nullable().optional(),
  verification_comments: z.array(VerificationCommentSchema).default([]),
}).passthrough().default({ status: 'draft', verification_comments: [] });

export const QuestionSchema = z.object({
  id: z.string().min(1, 'Question ID is required'),
  schema_version: z.string().default('1.0.0'),
  kind: z.enum([
    'direct_mcq',
    'direct',
    'statement_analysis',
    'assertion_reason',
    'match_the_following',
    'match',
    'arrange_in_order',
    'numeric',
    'odd_one_out',
    'grammar_application',
    'quote_completion',
    'passage_based',
    'table_based',
    'image_based'
  ]),
  level: z.string().default('prelims'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  exam_mappings: z.array(z.union([z.string(), ExamMappingSchema])).min(1, 'At least one target examination mapping is required'),
  syllabus: SyllabusMappingSchema,
  texts: BilingualTextsSchema,
  question_data: QuestionDataPayloadSchema,
  answer: QuestionAnswerSchema,
  question_settings: QuestionSettingsSchema.default({ marks: 1.5, negative_marks: 0.0, time_guideline_seconds: 60 }),
  source: QuestionSourceSchema,
  previous_year: PreviousYearReferenceSchema,
  media: z.union([z.array(z.any()), z.record(z.string(), z.any())]).default([]),
  tags: z.array(z.string()).default([]),
  language_status: z.union([
    z.enum(['bilingual', 'tamil_only', 'english_only']),
    z.record(z.string(), z.any())
  ]).default('bilingual'),
  workflow: QuestionWorkflowSchema,
  version: z.union([z.number(), z.record(z.string(), z.any())]).default(1),
  is_archived: z.boolean().default(false),
  created_by: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type QuestionInput = z.infer<typeof QuestionSchema>;
