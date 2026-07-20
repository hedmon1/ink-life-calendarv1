export type GoalPhase = 'penciled' | 'active' | 'finished';

export type Goal = {
  id: string;
  name: string;
  /** number of weeks the goal spans */
  weeks: number;
  /** absolute (0-based) week index the goal starts on */
  startWeek: number;
  /** fulfillment ratings collected as each goal week locks */
  ratings: number[];
  createdAt: number;
  /** true for the demo goal seeded on first run */
  seed?: boolean;
};

export type WeekRecord = {
  /** absolute (0-based) week index — matches `lived` at the moment it locked */
  weekIndex: number;
  sentence: string;
  rating: number; // 1–5
  photos: string[]; // up to 3 uris
  goalId?: string; // set when the week belonged to a goal
  lockedAt: number;
  /** true for the demo content seeded on first run */
  seed?: boolean;
};

export type Overlays = { prime: boolean; prox: boolean };

export type AppState = {
  birthYear: number;
  proximityWeeks: number;
  overlays: Overlays;
  goals: Goal[];
  records: WeekRecord[];
  onboarded: boolean;
  /** weekday (0=Sun..6=Sat) the user does check-ins; null until the first one */
  checkinWeekday: number | null;
  lastCheckinAt: number | null;
  tutorialSeen: boolean;
  /** absolute week index when the app was first opened — marked green on the grid */
  installWeekIndex: number | null;
};
