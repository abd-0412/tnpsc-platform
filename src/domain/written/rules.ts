/**
 * Pure Domain Rules for Written Practice (Section 9.3 & 18.1)
 * Schedules re-attempt intervals based on self-assessment percentages.
 */

/**
 * Re-attempt rule (Section 9.3):
 * - Below 60% (< 60): returns in 7 days
 * - 60% to 79%: returns in 21 days
 * - 80% and above: does not return unless requested (returns null)
 */
export function getWrittenReattemptDate(scorePct: number, today: string): string | null {
  if (scorePct < 60) {
    return addDays(today, 7);
  }
  if (scorePct < 80) {
    return addDays(today, 21);
  }
  return null;
}

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}
