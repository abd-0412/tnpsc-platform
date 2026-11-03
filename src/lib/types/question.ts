// ========================================================================
// TNPSC PRACTICE PLATFORM - QUESTION TYPES & ENUMS
// ========================================================================

export type QuestionKind =
  | 'direct_mcq'
  | 'statement_analysis'
  | 'assertion_reason'
  | 'match_the_following'
  | 'arrange_in_order'
  | 'numeric'
  | 'odd_one_out'
  | 'grammar_application'
  | 'quote_completion'
  | 'passage_based'
  | 'table_based'
  | 'image_based';

export type ExamLevel = 'prelims' | 'mains' | 'foundation';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type LanguageStatus = 'bilingual' | 'tamil_only' | 'english_only';
export type WorkflowStatus = 'draft' | 'under_review' | 'verified' | 'published' | 'rejected';

export interface ExamMapping {
  exam_id: 'group_4' | 'group_2' | 'group_2a' | string;
  is_relevant: boolean;
  frequency_score?: number;
  notes?: string;
}

export interface SyllabusMapping {
  class_id?: string;
  subject_id: string;
  term_id?: string;
  unit_id?: string;
  lesson_id?: string;
  chapter_id?: string;
  topic_id?: string;
  subtopic_id?: string;
}

export interface OptionItem {
  id: string; // e.g., 'A', 'B', 'C', 'D'
  text: string;
}

export interface LanguageContent {
  question: string;
  options?: OptionItem[];
  explanation?: string;
}

export interface BilingualTexts {
  ta: LanguageContent;
  en: LanguageContent;
}

// Polymorphic extra question data depending on kind
export interface QuestionDataPayload {
  // Statement Analysis (e.g. 1. Statement 1, 2. Statement 2. Which is correct?)
  statements?: Array<{ id: number; text_ta: string; text_en: string }>;
  
  // Assertion and Reason
  assertion?: { ta: string; en: string };
  reason?: { ta: string; en: string };

  // Match the Following (Left list vs Right list)
  matching?: {
    left_column: Array<{ id: string; text_ta: string; text_en: string }>;
    right_column: Array<{ id: string; text_ta: string; text_en: string }>;
  };

  // Arrange in Order (Chronological, hierarchical, process steps)
  arrange_items?: Array<{ id: string; text_ta: string; text_en: string }>;

  // Passage based
  passage?: {
    text_ta: string;
    text_en: string;
    passage_title_ta?: string;
    passage_title_en?: string;
  };

  // Table based
  table?: {
    headers_ta: string[];
    headers_en: string[];
    rows_ta: string[][];
    rows_en: string[][];
  };

  // Quote completion / Grammar
  source_quote?: {
    incomplete_quote_ta?: string;
    incomplete_quote_en?: string;
    author_or_text?: string;
  };
}

export interface QuestionAnswer {
  correct_option_id?: string; // e.g. 'A' | 'B' | 'C' | 'D'
  acceptable_answers?: string[];
  match_pairs?: Record<string, string>; // e.g. { "1": "B", "2": "C", "3": "A", "4": "D" }
  numeric_target?: number;
  tolerance?: number;
  ordered_sequence?: string[]; // e.g. ['3', '1', '4', '2']
  explanation_summary?: string;
}

export interface QuestionSettings {
  marks: number;
  negative_marks: number;
  time_guideline_seconds?: number;
}

export interface QuestionSource {
  book?: string;
  standard?: string; // e.g. "6th Standard", "10th Standard", "12th Standard"
  term?: string;
  chapter?: string;
  page_number?: string;
  edition?: string;
}

export interface PreviousYearReference {
  is_pyq: boolean;
  exam_name?: string; // e.g. "TNPSC Group 4 - 2022"
  year?: number;
  session?: string;
  question_number?: number;
}

export interface MediaItem {
  type: 'image' | 'diagram' | 'map';
  url: string;
  caption_ta?: string;
  caption_en?: string;
}

export interface VerificationComment {
  author_id: string;
  author_name: string;
  comment: string;
  created_at: string;
}

export interface QuestionWorkflow {
  status: WorkflowStatus;
  verified_by?: string | null;
  verified_at?: string | null;
  verification_comments: VerificationComment[];
}

export interface Question {
  id: string;
  schema_version: string;
  kind: QuestionKind;
  level: ExamLevel;
  difficulty: DifficultyLevel;
  exam_mappings: ExamMapping[];
  syllabus: SyllabusMapping;
  texts: BilingualTexts;
  question_data: QuestionDataPayload;
  answer: QuestionAnswer;
  question_settings: QuestionSettings;
  source: QuestionSource;
  previous_year: PreviousYearReference;
  media: MediaItem[];
  tags: string[];
  language_status: LanguageStatus;
  workflow: QuestionWorkflow;
  version: number;
  is_archived?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

