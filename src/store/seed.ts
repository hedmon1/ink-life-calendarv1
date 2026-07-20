import { Goal, WeekRecord } from './types';

// Deterministic photo URLs — used only for the tutorial's illustrative previews.
export function picsum(seed: string, w = 800, h = 560): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/** Sentence the first check-in starts with (empty — the user writes their own). */
export const CURRENT_WEEK_DRAFT = '';

/** Fresh installs start with a clean slate — no example goals or memories. */
export function buildSeed(_birthYear: number): { goals: Goal[]; records: WeekRecord[] } {
  return { goals: [], records: [] };
}
