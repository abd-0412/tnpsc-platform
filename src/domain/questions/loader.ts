/**
 * JSON Lines Question File Loader (Section 7.3)
 * Parses JSONL files, safely skipping comment lines (lines starting with // or #) and empty lines.
 */

import { QuestionRecord } from './types';

export function parseJsonLines(content: string): QuestionRecord[] {
  const lines = content.split('\n');
  const questions: QuestionRecord[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty lines and comment lines
    if (!line || line.startsWith('//') || line.startsWith('#')) {
      continue;
    }

    try {
      const q = JSON.parse(line) as QuestionRecord;
      questions.push(q);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`JSONL Parse Error on line ${i + 1}: ${errMsg}\nLine content: "${line}"`);
    }
  }

  return questions;
}
