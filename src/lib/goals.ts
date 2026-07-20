import { Goal, GoalPhase } from '../store/types';

export function goalPhase(goal: Goal, lived: number): GoalPhase {
  if (goal.outcome) return goal.outcome;
  return lived < goal.startWeek + goal.weeks ? 'active' : 'missed';
}

/** 1-based week of the goal currently in progress (clamped to [1, weeks]). */
export function goalCurrentWeek(goal: Goal, lived: number): number {
  return Math.max(1, Math.min(goal.weeks, lived - goal.startWeek + 1));
}

/** Share (0..1) of the goal's time frame that has passed. */
export function goalProgress(goal: Goal, lived: number): number {
  return Math.max(0, Math.min(1, (lived - goal.startWeek + 1) / goal.weeks));
}

/** Is `lived` the final week of this goal? */
export function isGoalFinalWeek(goal: Goal, lived: number): boolean {
  return lived === goal.startWeek + goal.weeks - 1;
}
