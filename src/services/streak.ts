// Pure streak logic: a "streak day" is a local calendar day on which every
// check shown on the home screen was verified (scanned or by hand).
import type { Check, Streak } from '../types';

/** Local-time day key, e.g. "2026-10-22". */
export function dayKey(timestamp: number): string {
  const d = new Date(timestamp);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function previousDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return dayKey(new Date(y, m - 1, d - 1, 12).getTime()); // noon avoids DST edges
}

export function allEnabledDone(checks: readonly Check[]): boolean {
  const enabled = checks.filter((c) => c.enabled);
  return enabled.length > 0 && enabled.every((c) => c.verification !== null);
}

/** Call after any change; extends the streak once per day when everything is done. */
export function updateStreak(streak: Streak, checks: readonly Check[], now: number): Streak {
  if (!allEnabledDone(checks)) return streak;
  const today = dayKey(now);
  if (streak.lastDay === today) return streak;
  const continues = streak.lastDay === previousDayKey(today);
  return { count: continues ? streak.count + 1 : 1, lastDay: today };
}

/** What to display: a streak survives until the end of the day after it was last extended. */
export function visibleStreak(streak: Streak, now: number): number {
  const today = dayKey(now);
  if (streak.lastDay === today || streak.lastDay === previousDayKey(today)) return streak.count;
  return 0;
}
