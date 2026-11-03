import { dateKey } from '../date';
import type { LifeGoal, LifeRoutine } from '../types';

/**
 * Progress is measured by completed routine occurrences inside a goal's time horizon.
 * Iterate over *actual checks*, not every day in a five-year date range; this avoids
 * allocating thousands of Date objects while rendering a garden with 30–50 goals.
 */
export function getGoalProgress(
  goal: LifeGoal,
  routines: readonly LifeRoutine[],
  checks: Readonly<Record<string, boolean>>,
  at: Date = new Date(),
): { done: number; target: number; percent: number } {
  const goalRoutineIds = new Set(routines.filter(routine => routine.goalId === goal.id).map(routine => routine.id));
  const year = at.getFullYear();
  const month = at.getMonth();
  const periodStart = goal.horizon === 'month'
    ? new Date(year, month, 1)
    : goal.horizon === 'quarter'
      ? new Date(year, Math.floor(month / 3) * 3, 1)
      : new Date(year, 0, 1);
  const periodEnd = goal.horizon === 'month'
    ? new Date(year, month + 1, 1)
    : goal.horizon === 'quarter'
      ? new Date(year, Math.floor(month / 3) * 3 + 3, 1)
      : goal.horizon === 'year' ? new Date(year + 1, 0, 1) : new Date(year + 5, 0, 1);
  const from = dateKey(periodStart), to = dateKey(periodEnd);
  let done = 0;
  for (const [key, completed] of Object.entries(checks)) {
    if (!completed) continue;
    const [day, routineId] = key.split('|');
    if (day >= from && day < to && goalRoutineIds.has(routineId)) done++;
  }
  return { done, target: goal.target, percent: Math.min(100, Math.round((done / Math.max(1, goal.target)) * 100)) };
}
