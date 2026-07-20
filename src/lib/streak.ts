import { WeekRecord } from '../store/types';

/**
 * Consecutive self-logged check-in weeks ending at the current week — or at
 * last week, so a not-yet-locked current week doesn't break the streak.
 * Seeded example records don't count.
 */
export function checkinStreak(records: WeekRecord[], lived: number): number {
  const weeks = new Set(records.filter((r) => !r.seed).map((r) => r.weekIndex));
  let w = weeks.has(lived) ? lived : lived - 1;
  let n = 0;
  while (weeks.has(w)) {
    n++;
    w--;
  }
  return n;
}
