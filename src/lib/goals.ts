import { Goal, GoalPhase } from '../store/types';

export function goalPhase(goal: Goal, lived: number): GoalPhase {
  const end = goal.startWeek + goal.weeks; // exclusive
  if (goal.ratings.length >= goal.weeks) return 'finished';
  if (lived >= end) return 'finished';
  if (lived < goal.startWeek) return 'penciled';
  return 'active';
}

/** 1-based week of the goal currently in progress (clamped to [1, weeks]). */
export function goalCurrentWeek(goal: Goal, lived: number): number {
  return Math.max(1, Math.min(goal.weeks, lived - goal.startWeek + 1));
}

export function goalAvg(goal: Goal): number {
  if (!goal.ratings.length) return 0;
  return goal.ratings.reduce((a, b) => a + b, 0) / goal.ratings.length;
}

/** Is `lived` the final week of this goal? */
export function isGoalFinalWeek(goal: Goal, lived: number): boolean {
  return lived === goal.startWeek + goal.weeks - 1;
}

/** 1-based inclusive week range the goal spans, e.g. { from: 1453, to: 1460 }. */
export function goalWeekRange(goal: Goal): { from: number; to: number } {
  return { from: goal.startWeek + 1, to: goal.startWeek + goal.weeks };
}
