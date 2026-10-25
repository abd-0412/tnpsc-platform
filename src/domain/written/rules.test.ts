import { describe, it, expect } from 'vitest';
import { getWrittenReattemptDate } from './rules';

describe('Domain: Written Practice Re-attempt Intervals (Section 9.3 & 18.1)', () => {
  const today = '2026-10-25';

  it('schedules re-attempt in 7 days for score at 59%', () => {
    expect(getWrittenReattemptDate(59, today)).toBe('2026-11-01'); // 7 days later
  });

  it('schedules re-attempt in 21 days for score at 60%', () => {
    expect(getWrittenReattemptDate(60, today)).toBe('2026-11-15'); // 21 days later
  });

  it('schedules re-attempt in 21 days for score at 79%', () => {
    expect(getWrittenReattemptDate(79, today)).toBe('2026-11-15'); // 21 days later
  });

  it('does not schedule automatic return for score at 80% and above', () => {
    expect(getWrittenReattemptDate(80, today)).toBeNull();
    expect(getWrittenReattemptDate(100, today)).toBeNull();
  });
});
