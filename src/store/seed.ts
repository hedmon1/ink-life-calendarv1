import { lifeCalc } from '../lib/calc';
import { Goal, WeekRecord } from './types';

// Demo content lifted from the landing page's ARCHIVE array, so a fresh install
// looks as alive as section 05. Photos use deterministic Lorem Picsum seeds.
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

const RUN: { r: number; s: string; seed: string }[] = [
  { r: 4, s: 'Base week. Easy miles, sore everywhere.', seed: 'ink20' },
  { r: 4, s: 'First tempo since spring. Legs remembered.', seed: 'ink21' },
  { r: 5, s: 'Long run felt like flying. Negative split.', seed: 'ink22' },
  { r: 3, s: 'Skipped two runs. Travel ate the week.', seed: 'ink23' },
  { r: 5, s: 'Race morning. 30k done, cried at the line.', seed: 'ink24' },
  { r: 4, s: 'Recovery week. Walked a lot, slept more.', seed: 'ink25' },
];

export function picsum(seed: string, w = 800, h = 560): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/** Default sentence pre-filled into the Sunday Review for the current week (matches landing screen 04). */
export const CURRENT_WEEK_DRAFT = 'Signed the office lease. Pencil becomes ink.';

export function buildSeed(birthYear: number): { goals: Goal[]; records: WeekRecord[] } {
  const c = lifeCalc(birthYear);
  const cur = c.lived; // current in-progress week index
  const now = Date.now();

  const launch: Goal = {
    id: 'g-launch',
    name: 'Launch the company',
    weeks: 8,
    startWeek: cur - 7, // weeks cur-7 … cur ; current week is week 8 of 8
    ratings: [],
    createdAt: now - 8 * 7 * 86400000,
  };
  const run: Goal = {
    id: 'g-run',
    name: 'Run the city 30k',
    weeks: 6,
    startWeek: cur - 19, // finished a few months back
    ratings: RUN.map((x) => x.r),
    createdAt: now - 20 * 7 * 86400000,
  };

  const records: WeekRecord[] = [];

  // finished "Run the city 30k" weeks: cur-19 … cur-14
  RUN.forEach((x, k) => {
    const weekIndex = run.startWeek + k;
    records.push({ weekIndex, sentence: x.s, rating: x.r, photos: [picsum(x.seed)], goalId: run.id, lockedAt: now });
  });

  // eleven recent locked weeks: cur-11 … cur-1
  RECENT.forEach((x, k) => {
    const weekIndex = cur - 11 + k;
    const goalId = weekIndex >= launch.startWeek && weekIndex < cur ? launch.id : undefined;
    records.push({ weekIndex, sentence: x.s, rating: x.r, photos: [picsum(x.seed)], goalId, lockedAt: now });
    if (goalId === launch.id) launch.ratings.push(x.r);
  });

  return { goals: [launch, run], records };
}
