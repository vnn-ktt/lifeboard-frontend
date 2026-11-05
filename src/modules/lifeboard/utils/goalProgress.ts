import { dateKey } from '../date';
import { goalOutcomeProgress } from './goalMetrics';
import type { GoalMetricEntry, LifeGoal, LifeRoutine } from '../types';

export interface GoalProgress {
  /** Primary result measurement. Existing consumers use this percentage. */
  done: number;
  target: number;
  percent: number;
  outcome: ReturnType<typeof goalOutcomeProgress>;
  activity: { done: number; target: number; percent: number };
}

/**
 * For legacy goals, preserve rolling calendar windows and their historical percentages.
 * New goals use fixed inclusive start and due dates instead.
 * Iterate only over completed occurrences; no multi-year day arrays are allocated.
 */
export function getGoalProgress(
  goal: LifeGoal,
  routines: readonly LifeRoutine[],
  checks: Readonly<Record<string, boolean>>,
  at: Date = new Date(),
  entries: readonly GoalMetricEntry[] = [],
): GoalProgress {
  const routineIds = new Set(routines.filter(routine => routine.goalId === goal.id).map(routine => routine.id));
  const year = at.getFullYear();
  const month = at.getMonth();
  const rollingStart = goal.horizon === 'month'
    ? new Date(year, month, 1)
    : goal.horizon === 'quarter'
      ? new Date(year, Math.floor(month / 3) * 3, 1)
      : new Date(year, 0, 1);
  const rollingEnd = goal.horizon === 'month'
    ? new Date(year, month + 1, 1)
    : goal.horizon === 'quarter'
      ? new Date(year, Math.floor(month / 3) * 3 + 3, 1)
      : goal.horizon === 'year' ? new Date(year + 1, 0, 1) : new Date(year + 5, 0, 1);
  const from = goal.startDate ?? dateKey(rollingStart);
  const toExclusive = goal.dueDate ? null : dateKey(rollingEnd);
  const through = dateKey(at);
  let completed = 0;
  for (const [key, checked] of Object.entries(checks)) {
    if (!checked) continue;
    const [day, routineId] = key.split('|');
    if (!routineIds.has(routineId) || day < from) continue;
    if ((goal.startDate || goal.dueDate) && day > through) continue;
    if (goal.dueDate ? day > goal.dueDate : day >= toExclusive!) continue;
    completed += 1;
  }
  const activity = { done: completed, target: goal.target, percent: Math.min(100, Math.round((completed / Math.max(1, goal.target)) * 100)) };
  const outcome = goalOutcomeProgress(goal, entries, at);
  return outcome
    ? { done: outcome.current, target: outcome.target, percent: outcome.percent, outcome, activity }
    : { done: activity.done, target: activity.target, percent: activity.percent, outcome: null, activity };
}
