/**
 * Question Types & Kind Definitions (Section 6.1, 6.2, 6.3)
 * Pure domain types with no external dependencies.
 */

export type QuestionKind = 
  | 'direct'
  | 'statements'
  | 'assertion_reason'
  | 'match'
  | 'arrange'
  | 'numeric'
  | 'visual'
  | 'quote';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export type StemBlock =
  | { type: 'text'; text: string }
  | { type: 'statement'; label: string; text: string }
  | { type: 'assertion'; text: string }
  | { type: 'reason'; text: string }
  | { type: 'list'; name: string; items: { label: string; text: string }[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'blank'; placeholder?: string }
  | { type: 'image'; file: string; alt: string; width?: number; height?: number };

export interface QuestionOption {
  key: OptionKey;
  text?: string;
  image?: { file: string; alt: string };
  // Structured metadata per option depending on kind
  selects?: string[] | 'none' | 'all'; // for 'statements'
  count?: number;                      // for 'statements' count variant
  semantic?: 
    | 'both_true_explains'
    | 'both_true_not_explains'
    | 'a_true_r_false'
    | 'a_false_r_true'
    | 'both_false';                   // for 'assertion_reason'
  mapping?: Record<string, string>;   // for 'match' e.g. {"A": "1", "B": "2"}
  sequence?: string[];                // for 'arrange' e.g. ["I", "III", "II", "IV"]
}

export type QuestionStructure =
  | { kind: 'statements'; truth: Record<string, boolean> }
  | { kind: 'assertion_reason'; a_true: boolean; r_true: boolean; r_explains_a: boolean }
  | { kind: 'match'; pairs: Record<string, string> }
  | { kind: 'arrange'; order: string[] }
  | { kind: 'numeric'; answer_value?: number };

export interface QuestionLanguageText {
  blocks: StemBlock[];
  options: QuestionOption[];
  explanation?: string;
}

export interface QuestionRecord {
  id: string;
  kind: QuestionKind;
  unit_id: string;
  level?: 'SSLC' | 'DEGREE';
  chapter_id?: string;
  topic_tags?: string[];
  correct_key: OptionKey;
  structure?: QuestionStructure;
  is_negative?: boolean;
  texts: {
    ta?: QuestionLanguageText;
    en?: QuestionLanguageText;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
