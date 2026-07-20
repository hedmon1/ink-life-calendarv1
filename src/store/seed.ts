import { lifeCalc } from '../lib/calc';
import { Goal, WeekRecord } from './types';

/** Deterministic photo URLs (Lorem Picsum). Small sizes keep loads fast. */
export function picsum(seed: string, w = 480, h = 320): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/** Sentence the first check-in starts with (empty — the user writes their own). */
export const CURRENT_WEEK_DRAFT = '';

// Example memories, removable from the Memories tab. Lifted from the landing
// page's ARCHIVE so a fresh install shows what an inked week looks like.
const RECENT: { r: number; s: string; seed: string }[] = [
  { r: 3, s: 'Scoped the pivot. Too many meetings about meetings.', seed: 'ink31' },
  { r: 4, s: 'First outside check cleared. Called Dad.', seed: 'ink32' },
  { r: 2, s: 'Sick most of it. The grid does not care.', seed: 'ink33' },
  { r: 5, s: 'Demo day. They laughed at the right parts.', seed: 'ink34' },
  { r: 3, s: 'Rebuilt onboarding twice. Should have talked to users first.', seed: 'ink35' },
  { r: 4, s: 'Long run Sunday. 30k, no wall.', seed: 'ink36' },
  { r: 4, s: 'Hired the first engineer. She is better than me.', seed: 'ink37' },
  { r: 1, s: 'Lost the week to a fundraise that went nowhere.', seed: 'ink38' },
  { r: 5, s: 'Shipped the beta to 40 users. Slept like a child.', seed: 'ink39' },
  { r: 3, s: 'Quiet week. Read, cooked, recovered. Worth it.', seed: 'ink40' },
  { r: 4, s: 'Two users churned. Fixed the thing they hated.', seed: 'ink41' },
];

/** Fresh installs start with no goals and eleven removable example memories. */
export function buildSeed(birthYear: number): { goals: Goal[]; records: WeekRecord[] } {
  const cur = lifeCalc(birthYear).lived;
  const now = Date.now();
  const records: WeekRecord[] = RECENT.map((x, k) => ({
    weekIndex: cur - RECENT.length + k,
    sentence: x.s,
    rating: x.r,
    photos: [picsum(x.seed)],
    lockedAt: now,
    seed: true,
  }));
  return { goals: [], records };
}
