import { describe, it, expect } from 'vitest';
import { 
  processTimeSegment, 
  evaluateDayHabit, 
  calculateStreak, 
  DailyActivitySummary 
} from './streak';

describe('Domain: Study Habit & Streak Engine (Section 8.7 & 8.8 & 18.1)', () => {
  describe('Segment Processing', () => {
    it('drops segments under 10 seconds', () => {
      const start = 1000000;
      const end = start + 9000; // 9 seconds
      const res = processTimeSegment(start, end, end);
      expect(res.valid).toBe(false);
      expect(res.activeSeconds).toBe(0);
    });

    it('cuts off active time 120s after the last user input', () => {
      const start = 1000000;
      const lastInput = start + 60000; // input at 60s
      const end = start + 600000;      // left tab open for 600s
      
      const res = processTimeSegment(start, end, lastInput);
      expect(res.valid).toBe(true);
      // Active seconds = 60s + 120s cutoff = 180s
      expect(res.activeSeconds).toBe(180);
      expect(res.flagged).toBe(false);
    });

    it('caps and flags segments longer than 3 hours', () => {
      const start = 1000000;
      const end = start + 4 * 60 * 60 * 1000; // 4 hours with continuous input
      
      const res = processTimeSegment(start, end, end);
      expect(res.valid).toBe(true);
      expect(res.activeSeconds).toBe(3 * 60 * 60); // 10,800s
      expect(res.flagged).toBe(true);
    });
  });

  describe('Daily Goal Evaluation', () => {
    it('fails when neither 60 minutes nor 20 questions is reached', () => {
      const activity: DailyActivitySummary = {
        date: '2026-10-25',
        activeSeconds: 59 * 60, // 59 minutes
        manualMinutes: 0,
        questionsAnswered: 19,  // 19 questions
      };

      const res = evaluateDayHabit(activity, false);
      expect(res.goalMet).toBe(false);
      expect(res.countsForStreak).toBe(false);
    });

    it('counts if 60 minutes is reached even with 0 questions', () => {
      const activity: DailyActivitySummary = {
        date: '2026-10-25',
        activeSeconds: 30 * 60, // 30m in-app
        manualMinutes: 30,      // 30m book study
        questionsAnswered: 0,
      };

      const res = evaluateDayHabit(activity, false);
      expect(res.goalMet).toBe(true);
      expect(res.countsForStreak).toBe(true);
    });

    it('counts if 20 questions is reached even with low time', () => {
      const activity: DailyActivitySummary = {
        date: '2026-10-25',
        activeSeconds: 15 * 60, // 15 mins
        manualMinutes: 0,
        questionsAnswered: 20,  // 20 questions met!
      };

      const res = evaluateDayHabit(activity, false);
      expect(res.goalMet).toBe(true);
      expect(res.countsForStreak).toBe(true);
    });

    it('counts if designated as an allowable rest day even with 0 activity', () => {
      const activity: DailyActivitySummary = {
        date: '2026-10-25',
        activeSeconds: 0,
        manualMinutes: 0,
        questionsAnswered: 0,
      };

      const res = evaluateDayHabit(activity, true);
      expect(res.goalMet).toBe(false);
      expect(res.isRestDay).toBe(true);
      expect(res.countsForStreak).toBe(true); // streak preserved
    });
  });

  describe('Streak Calculation & Rolling Rest Days', () => {
    it('maintains streak across regular active days and resets on missed day', () => {
      const days = [
        { activity: { date: '2026-10-20', activeSeconds: 3600, manualMinutes: 0, questionsAnswered: 25 } },
        { activity: { date: '2026-10-21', activeSeconds: 3600, manualMinutes: 0, questionsAnswered: 25 } },
        { activity: { date: '2026-10-22', activeSeconds: 3600, manualMinutes: 0, questionsAnswered: 25 } },
        { activity: { date: '2026-10-23', activeSeconds: 0, manualMinutes: 0, questionsAnswered: 0 } }, // missed!
        { activity: { date: '2026-10-24', activeSeconds: 3600, manualMinutes: 0, questionsAnswered: 25 } },
      ];

      const streak = calculateStreak(days);
      expect(streak.longestStreak).toBe(3);
      expect(streak.currentStreak).toBe(1); // reset after 23rd
    });

    it('allows 1 rest day in 7 days to preserve streak, but denies a 2nd rest day in the same window', () => {
      const days = [
        { activity: { date: '2026-10-20', activeSeconds: 3600, manualMinutes: 0, questionsAnswered: 25 } },
        // Day 2: First rest day in window -> Allowed
        { activity: { date: '2026-10-21', activeSeconds: 0, manualMinutes: 0, questionsAnswered: 0 }, wantsRestDay: true },
        { activity: { date: '2026-10-22', activeSeconds: 3600, manualMinutes: 0, questionsAnswered: 25 } },
        // Day 4: Second rest day within 7 days -> Disallowed, resets streak!
        { activity: { date: '2026-10-23', activeSeconds: 0, manualMinutes: 0, questionsAnswered: 0 }, wantsRestDay: true },
      ];

      const streak = calculateStreak(days);
      expect(streak.history[1].isRestDay).toBe(true);
      expect(streak.history[1].countsForStreak).toBe(true);

      expect(streak.history[3].isRestDay).toBe(false);
      expect(streak.history[3].countsForStreak).toBe(false);
      expect(streak.currentStreak).toBe(0);
      expect(streak.longestStreak).toBe(3);
    });
  });
});
