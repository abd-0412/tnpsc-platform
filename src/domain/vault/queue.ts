/**
 * Mistake Vault Due Queue Ordering & Selection (Section 8.6 & 18.1)
 * Prioritizes due items and caps sessions at 30 items.
 */

import { VaultItemState } from './ladder';

export interface PrioritizedQueueItem {
  item: VaultItemState;
  daysOverdue: number;
  whyChosen: string;
}

export const MAX_REVIEW_SESSION_ITEMS = 30;

/**
 * Calculates how many days an item is overdue relative to today.
 * Returns positive integer for overdue, 0 for due today, negative for not yet due.
 */
export function getDaysOverdue(nextDue: string, today: string): number {
  const [ny, nm, nd] = nextDue.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);

  const dueTime = Date.UTC(ny, nm - 1, nd);
  const todayTime = Date.UTC(ty, tm - 1, td);

  const diffMs = todayTime - dueTime;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Generates the human-readable "why this question was chosen" explanation (Section 8.6).
 */
export function generateWhyChosenText(
  item: VaultItemState,
  daysOverdue: number,
  lang: 'en' | 'ta' = 'en'
): string {
  const isTa = lang === 'ta';

  const parts: string[] = [];

  if (daysOverdue > 0) {
    parts.push(
      isTa
        ? `${daysOverdue} நாட்கள் தாமதம்`
        : `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`
    );
  } else {
    parts.push(isTa ? 'இன்று மீளாய்வு செய்ய வேண்டியது' : 'Due today');
  }

  parts.push(isTa ? `நிலை ${item.stage}` : `Stage ${item.stage}`);

  if (item.mistakes > 0) {
    parts.push(
      isTa
        ? `${item.mistakes} முறை தவறியது`
        : `missed ${item.mistakes} time${item.mistakes > 1 ? 's' : ''}`
    );
  } else if (item.hard) {
    parts.push(isTa ? 'கடினம் எனக் குறிக்கப்பட்டது' : 'marked hard');
  }

  return parts.join(', ');
}

/**
 * Selects and orders due items according to Section 8.6 rules:
 * 1. Overdue (longest overdue first)
 * 2. Due today (lowest stage first)
 * 3. Most mistakes (highest mistake count first)
 * Caps at MAX_REVIEW_SESSION_ITEMS (30 items).
 */
export function buildDueQueue(
  items: VaultItemState[],
  today: string,
  limit: number = MAX_REVIEW_SESSION_ITEMS,
  lang: 'en' | 'ta' = 'en'
): PrioritizedQueueItem[] {
  // Filter only items that are due (nextDue <= today)
  const dueItems = items
    .map(item => ({
      item,
      daysOverdue: getDaysOverdue(item.nextDue, today),
    }))
    .filter(entry => entry.daysOverdue >= 0);

  // Sort by priority rules:
  // 1. daysOverdue descending (most overdue first)
  // 2. stage ascending (lowest stage first)
  // 3. mistakes descending (highest mistakes first)
  dueItems.sort((a, b) => {
    // 1. Longest overdue first
    if (a.daysOverdue !== b.daysOverdue) {
      return b.daysOverdue - a.daysOverdue;
    }
    // 2. Lowest stage first
    if (a.item.stage !== b.item.stage) {
      return a.item.stage - b.item.stage;
    }
    // 3. Most mistakes first
    return b.item.mistakes - a.item.mistakes;
  });

  // Cap to session limit and attach whyChosen explanation
  return dueItems.slice(0, limit).map(({ item, daysOverdue }) => ({
    item,
    daysOverdue,
    whyChosen: generateWhyChosenText(item, daysOverdue, lang),
  }));
}
