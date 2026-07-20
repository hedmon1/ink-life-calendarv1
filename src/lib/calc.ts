// Life-calendar math — mirrors the landing page calc() exactly.

export const WEEKS_PER_YEAR = 52;
export const LIFE_YEARS = 90;
export const TOTAL_WEEKS = LIFE_YEARS * WEEKS_PER_YEAR; // 4,680
export const PRIME_AGE = 35;
export const PRIME_END = PRIME_AGE * WEEKS_PER_YEAR; // 1,820
export const DEFAULT_PROXIMITY = 86;
export const MIN_BIRTH_YEAR = 1930;
export const MAX_BIRTH_YEAR = 2024;

const WEEK_MS = 7 * 86400000;

export type LifeCalc = {
  total: number;
  /** 0-based index of the week currently being lived (the white "this week" box). */
  lived: number;
  /** 1-based week number shown to the user (lived + 1). */
  weekNumber: number;
  left: number;
  primeEnd: number;
  primeLeft: number;
  proxLeft: number;
  /** days until the week locks (next Sunday). */
  daysToLock: number;
};

export function clampBirthYear(year: number): number {
  const y = Math.trunc(year);
  return y >= MIN_BIRTH_YEAR && y <= MAX_BIRTH_YEAR ? y : 1998;
}

export function lifeCalc(
  birthYear: number,
  proximityWeeks: number = DEFAULT_PROXIMITY,
  now: number = Date.now()
): LifeCalc {
  const by = clampBirthYear(birthYear);
  const birth = new Date(by, 5, 15).getTime(); // June 15 of birth year
  let lived = Math.floor((now - birth) / WEEK_MS);
  lived = Math.max(0, Math.min(TOTAL_WEEKS - 1, lived));
  const left = TOTAL_WEEKS - lived;
  const primeLeft = Math.max(0, PRIME_END - lived);
  const proxLeft = Math.min(proximityWeeks, left);
  const d = new Date(now);
  const daysToLock = (7 - d.getDay()) % 7 || 7; // until Sunday
  return {
    total: TOTAL_WEEKS,
    lived,
    weekNumber: lived + 1,
    left,
    primeEnd: PRIME_END,
    primeLeft,
    proxLeft,
    daysToLock,
  };
}

// --- formatting (manual, to avoid relying on Hermes Intl) ---

export function fmt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function todayLabel(now: number = Date.now()): string {
  const d = new Date(now);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Calendar range for a given absolute week index, e.g. "JUN 1 – JUN 7, 2026". */
export function weekDateRange(birthYear: number, weekIndex: number): string {
  const by = clampBirthYear(birthYear);
  const start = new Date(new Date(by, 5, 15).getTime() + weekIndex * WEEK_MS);
  const end = new Date(start.getTime() + 6 * 86400000);
  const f = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  return `${f(start)} – ${f(end)}, ${end.getFullYear()}`;
}
