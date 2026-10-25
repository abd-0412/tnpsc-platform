/**
 * Pure Question Kind Validation & Structured Answer Verification (Section 6.1 & 6.7)
 * Ensures that the machine-readable structure strictly agrees with the official answer key.
 */

import { 
  QuestionRecord, 
  QuestionOption, 
  ValidationResult, 
  StemBlock, 
  OptionKey 
} from './types';

export function validateQuestion(q: QuestionRecord): ValidationResult {
  const errors: string[] = [];

  // 1. Basic field checks
  if (!q.id || q.id.trim() === '') {
    errors.push('Question id is required.');
  }

  if (!['A', 'B', 'C', 'D'].includes(q.correct_key)) {
    errors.push(`Invalid correct_key "${q.correct_key}". Must be A, B, C, or D.`);
  }

  // At least one language is required
  const availableLangs = (['ta', 'en'] as const).filter(lang => !!q.texts[lang]);
  if (availableLangs.length === 0) {
    errors.push('Question must have texts in at least one language (Tamil or English).');
    return { valid: false, errors };
  }

  // 2. Options and Block Validation per language
  for (const lang of availableLangs) {
    const textData = q.texts[lang]!;
    
    // Check exactly 4 options with keys A, B, C, D in order
    const options = textData.options || [];
    if (options.length !== 4) {
      errors.push(`[${lang}] Exactly 4 options are required. Found ${options.length}.`);
    } else {
      const keys = options.map(o => o.key);
      if (keys.join('') !== 'ABCD') {
        errors.push(`[${lang}] Options must have keys A, B, C, D in exact order. Found: ${keys.join(', ')}.`);
      }

      // Check no two identical option texts
      const textSet = new Set<string>();
      for (const opt of options) {
        const str = (opt.text || '').trim();
        if (str) {
          if (textSet.has(str)) {
            errors.push(`[${lang}] Duplicate option text detected: "${str}".`);
          }
          textSet.add(str);
        }
      }
    }

    // Check required stem blocks by kind
    validateBlocksByKind(q.kind, textData.blocks, options, errors, lang);
  }

  // 3. Structured Answer Verification (Section 6.7 rule 4)
  const canonicalOptions = q.texts.en?.options || q.texts.ta?.options || [];
  validateStructuredAnswer(q, canonicalOptions, errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateBlocksByKind(
  kind: string, 
  blocks: StemBlock[], 
  options: QuestionOption[], 
  errors: string[], 
  lang: string
) {
  switch (kind) {
    case 'statements': {
      const statementBlocks = blocks.filter(b => b.type === 'statement');
      if (statementBlocks.length < 2) {
        errors.push(`[${lang}] Statements question must have at least 2 statement blocks.`);
      }
      break;
    }
    case 'assertion_reason': {
      const assertions = blocks.filter(b => b.type === 'assertion');
      const reasons = blocks.filter(b => b.type === 'reason');
      if (assertions.length !== 1 || reasons.length !== 1) {
        errors.push(`[${lang}] Assertion-Reason question must have exactly 1 assertion and 1 reason block.`);
      }
      break;
    }
    case 'match': {
      const lists = blocks.filter(b => b.type === 'list');
      if (lists.length !== 2) {
        errors.push(`[${lang}] Match question must have exactly 2 list blocks (List I and List II).`);
      }
      break;
    }
    case 'arrange': {
      const lists = blocks.filter(b => b.type === 'list');
      if (lists.length < 1) {
        errors.push(`[${lang}] Arrange question must have at least 1 list block containing the items to order.`);
      }
      break;
    }
    case 'quote': {
      const quotes = blocks.filter(b => b.type === 'quote');
      if (quotes.length < 1) {
        errors.push(`[${lang}] Quote question must contain at least 1 quote block.`);
      }
      break;
    }
    case 'visual': {
      const hasStemImage = blocks.some(b => b.type === 'image');
      const hasOptionImages = options.some(o => !!o.image);
      if (!hasStemImage && !hasOptionImages) {
        errors.push(`[${lang}] Visual question must have an image in the stem or in the options.`);
      }
      break;
    }
  }
}

function validateStructuredAnswer(
  q: QuestionRecord, 
  options: QuestionOption[], 
  errors: string[]
) {
  if (!q.structure) return;

  if (q.structure.kind === 'statements') {
    const truth = q.structure.truth;
    // Determine expected true labels (inverting if negative stem, e.g. "which are incorrect?")
    const expectedLabels = Object.entries(truth)
      .filter(([, val]) => q.is_negative ? !val : val)
      .map(([label]) => label)
      .sort();

    const matchingOptions: OptionKey[] = [];

    for (const opt of options) {
      if (opt.selects) {
        if (opt.selects === 'none' && expectedLabels.length === 0) {
          matchingOptions.push(opt.key);
        } else if (opt.selects === 'all' && expectedLabels.length === Object.keys(truth).length) {
          matchingOptions.push(opt.key);
        } else if (Array.isArray(opt.selects)) {
          const selectedSorted = [...opt.selects].sort();
          if (JSON.stringify(selectedSorted) === JSON.stringify(expectedLabels)) {
            matchingOptions.push(opt.key);
          }
        }
      } else if (opt.count !== undefined) {
        if (opt.count === expectedLabels.length) {
          matchingOptions.push(opt.key);
        }
      }
    }

    if (matchingOptions.length === 0) {
      errors.push(`Structured check failed: No option matches the statements truth table.`);
    } else if (matchingOptions.length > 1) {
      errors.push(`Structured check failed: Multiple options (${matchingOptions.join(', ')}) match the truth table.`);
    } else if (matchingOptions[0] !== q.correct_key) {
      errors.push(`Structured check failed: Truth resolves to option ${matchingOptions[0]}, but correct_key is ${q.correct_key}.`);
    }
  }

  if (q.structure.kind === 'assertion_reason') {
    const { a_true, r_true, r_explains_a } = q.structure;
    let expectedSemantic: string;

    if (a_true && r_true && r_explains_a) {
      expectedSemantic = 'both_true_explains';
    } else if (a_true && r_true && !r_explains_a) {
      expectedSemantic = 'both_true_not_explains';
    } else if (a_true && !r_true) {
      expectedSemantic = 'a_true_r_false';
    } else if (!a_true && r_true) {
      expectedSemantic = 'a_false_r_true';
    } else {
      expectedSemantic = 'both_false';
    }

    const matchingOptions = options.filter(o => o.semantic === expectedSemantic);

    if (matchingOptions.length === 0) {
      errors.push(`Structured check failed: No option matches semantic "${expectedSemantic}".`);
    } else if (matchingOptions.length > 1) {
      errors.push(`Structured check failed: Multiple options match semantic "${expectedSemantic}".`);
    } else if (matchingOptions[0].key !== q.correct_key) {
      errors.push(`Structured check failed: Semantic "${expectedSemantic}" resolves to option ${matchingOptions[0].key}, but correct_key is ${q.correct_key}.`);
    }
  }

  if (q.structure.kind === 'match') {
    const targetPairs = q.structure.pairs;
    const matchingOptions: OptionKey[] = [];

    for (const opt of options) {
      if (opt.mapping && isObjectEqual(opt.mapping, targetPairs)) {
        matchingOptions.push(opt.key);
      }
    }

    if (matchingOptions.length === 0) {
      errors.push('Structured check failed: No option matches the pairs mapping.');
    } else if (matchingOptions.length > 1) {
      errors.push(`Structured check failed: Multiple options (${matchingOptions.join(', ')}) match the pairs mapping.`);
    } else if (matchingOptions[0] !== q.correct_key) {
      errors.push(`Structured check failed: Pairs resolve to option ${matchingOptions[0]}, but correct_key is ${q.correct_key}.`);
    }
  }

  if (q.structure.kind === 'arrange') {
    const targetOrder = JSON.stringify(q.structure.order);
    const matchingOptions: OptionKey[] = [];

    for (const opt of options) {
      if (opt.sequence && JSON.stringify(opt.sequence) === targetOrder) {
        matchingOptions.push(opt.key);
      }
    }

    if (matchingOptions.length === 0) {
      errors.push('Structured check failed: No option matches the chronological/logical sequence.');
    } else if (matchingOptions.length > 1) {
      errors.push(`Structured check failed: Multiple options (${matchingOptions.join(', ')}) match the sequence.`);
    } else if (matchingOptions[0] !== q.correct_key) {
      errors.push(`Structured check failed: Sequence resolves to option ${matchingOptions[0]}, but correct_key is ${q.correct_key}.`);
    }
  }
}

function isObjectEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (key !== keysB[i] || a[key] !== b[key]) return false;
  }
  return true;
}
