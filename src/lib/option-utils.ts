/**
 * Normalizes any question option identifier (e.g. 'opt_a', 'OPT_A', 'option_a', '1', 'A')
 * into the standard official TNPSC uppercase single-letter format: 'A' | 'B' | 'C' | 'D' | 'E'.
 */
export function normalizeOptionId(raw: any, fallbackIndex?: number): string {
  if (raw === undefined || raw === null || raw === '') {
    if (fallbackIndex !== undefined && fallbackIndex >= 0 && fallbackIndex < 5) {
      return ['A', 'B', 'C', 'D', 'E'][fallbackIndex];
    }
    return '';
  }

  const str = String(raw).trim().toUpperCase();

  // Common raw variations
  if (str === 'A' || str === 'OPT_A' || str === 'OPTION_A' || str === 'OPTION A' || str === '1') return 'A';
  if (str === 'B' || str === 'OPT_B' || str === 'OPTION_B' || str === 'OPTION B' || str === '2') return 'B';
  if (str === 'C' || str === 'OPT_C' || str === 'OPTION_C' || str === 'OPTION C' || str === '3') return 'C';
  if (str === 'D' || str === 'OPT_D' || str === 'OPTION_D' || str === 'OPTION D' || str === '4') return 'D';
  if (str === 'E' || str === 'OPT_E' || str === 'OPTION_E' || str === 'OPTION E' || str === '5') return 'E';

  // Handle prefix like 'OPT_' or suffix like '_A'
  const lastChar = str.slice(-1);
  if (['A', 'B', 'C', 'D', 'E'].includes(lastChar)) {
    return lastChar;
  }

  if (fallbackIndex !== undefined && fallbackIndex >= 0 && fallbackIndex < 5) {
    return ['A', 'B', 'C', 'D', 'E'][fallbackIndex];
  }

  return str;
}

/**
 * Compares two option IDs leniently (e.g. 'opt_c' matches 'C')
 */
export function isMatchingOption(optA: any, optB: any): boolean {
  if (!optA || !optB) return false;
  return normalizeOptionId(optA) === normalizeOptionId(optB);
}

