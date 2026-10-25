/**
 * Bilingual Parity Validator (Section 6.4 & 18.1)
 * Enforces structural parity between Tamil and English texts when both are present.
 */

import { QuestionRecord, ValidationResult } from './types';

export function validateBilingualParity(q: QuestionRecord): ValidationResult {
  const errors: string[] = [];

  // Parity check only applies when both languages are present
  if (!q.texts.ta || !q.texts.en) {
    return { valid: true, errors: [] };
  }

  const taBlocks = q.texts.ta.blocks;
  const enBlocks = q.texts.en.blocks;

  // 1. Block count check
  if (taBlocks.length !== enBlocks.length) {
    errors.push(
      `Block count mismatch: Tamil has ${taBlocks.length} blocks, but English has ${enBlocks.length} blocks.`
    );
    return { valid: false, errors };
  }

  // 2. Block type and label parity
  for (let i = 0; i < taBlocks.length; i++) {
    const taBlock = taBlocks[i];
    const enBlock = enBlocks[i];

    if (taBlock.type !== enBlock.type) {
      errors.push(
        `Block [${i}] type mismatch: Tamil is "${taBlock.type}", but English is "${enBlock.type}".`
      );
      continue;
    }

    if (taBlock.type === 'statement' && enBlock.type === 'statement') {
      if (taBlock.label !== enBlock.label) {
        errors.push(
          `Statement block [${i}] label mismatch: Tamil is "${taBlock.label}", English is "${enBlock.label}".`
        );
      }
    }

    if (taBlock.type === 'list' && enBlock.type === 'list') {
      if (taBlock.items.length !== enBlock.items.length) {
        errors.push(
          `List block [${i}] items count mismatch: Tamil has ${taBlock.items.length}, English has ${enBlock.items.length}.`
        );
      } else {
        for (let j = 0; j < taBlock.items.length; j++) {
          if (taBlock.items[j].label !== enBlock.items[j].label) {
            errors.push(
              `List block [${i}] item [${j}] label mismatch: Tamil is "${taBlock.items[j].label}", English is "${enBlock.items[j].label}".`
            );
          }
        }
      }
    }
  }

  // 3. Option parity
  const taOpts = q.texts.ta.options;
  const enOpts = q.texts.en.options;

  if (taOpts.length !== enOpts.length) {
    errors.push(
      `Options count mismatch: Tamil has ${taOpts.length} options, English has ${enOpts.length} options.`
    );
  } else {
    for (let i = 0; i < taOpts.length; i++) {
      if (taOpts[i].key !== enOpts[i].key) {
        errors.push(
          `Option [${i}] key mismatch: Tamil is "${taOpts[i].key}", English is "${enOpts[i].key}".`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
