import type { GoalMilestone, GoalStatus, GoalTask, LifeGoal } from '../types';

export const GOAL_STATUSES = ['active', 'paused', 'completed', 'cancelled'] as const;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export function isCalendarDate(value: string): boolean {
  if (!dateRegex.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export function goalStatus(goal: LifeGoal): GoalStatus {
  return GOAL_STATUSES.includes(goal.status as GoalStatus) ? goal.status! : 'active';
}

const validTitle = (value: unknown): value is string => typeof value === 'string' && value.trim().length >= 2 && value.trim().length <= 90;
const validDescription = (value: unknown): value is string => typeof value === 'string' && value.length <= 500;
const validDueDate = (value: unknown) => value === undefined || (typeof value === 'string' && isCalendarDate(value));
const validCompletedAt = (value: unknown) => value === undefined || value === null || (typeof value === 'string' && !Number.isNaN(Date.parse(value)));

export function validMilestone(value: unknown): value is GoalMilestone {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<GoalMilestone>;
  return typeof item.id === 'string' && item.id.length > 0 && typeof item.goalId === 'string' &&
    validTitle(item.title) && validDescription(item.description) &&
    typeof item.order === 'number' && Number.isInteger(item.order) && item.order >= 0 && item.order <= 10000 &&
    validDueDate(item.dueDate) && validCompletedAt(item.completedAt) &&
    typeof item.createdAt === 'string' && !Number.isNaN(Date.parse(item.createdAt));
}

export function validGoalTask(value: unknown): value is GoalTask {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<GoalTask>;
  return typeof item.id === 'string' && item.id.length > 0 && typeof item.goalId === 'string' &&
    (item.milestoneId === null || typeof item.milestoneId === 'string') &&
    validTitle(item.title) && validDescription(item.description) &&
    validDueDate(item.dueDate) && validCompletedAt(item.completedAt) &&
    typeof item.createdAt === 'string' && !Number.isNaN(Date.parse(item.createdAt));
}

export function milestoneProgress(goalId: string, milestones: readonly GoalMilestone[]) {
  const relevant = milestones.filter(item => item.goalId === goalId);
  const completed = relevant.filter(item => !!item.completedAt).length;
  return { completed, total: relevant.length, percent: relevant.length ? Math.round(completed / relevant.length * 100) : 0 };
}

export function taskProgress(goalId: string, tasks: readonly GoalTask[]) {
  const relevant = tasks.filter(item => item.goalId === goalId);
  const completed = relevant.filter(item => !!item.completedAt).length;
  return { completed, total: relevant.length, percent: relevant.length ? Math.round(completed / relevant.length * 100) : 0 };
}

/** Show a task on its due date; also show outstanding overdue tasks on today. */
export function tasksForDay(tasks: readonly GoalTask[], day: string, today: string): GoalTask[] {
  return tasks.filter(task => task.dueDate === day || (!task.dueDate && day === today && !task.completedAt) ||
      (day === today && !!task.dueDate && task.dueDate < today && !task.completedAt))
    .sort((a, b) => (a.completedAt ? 1 : 0) - (b.completedAt ? 1 : 0) ||
      (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31') || a.createdAt.localeCompare(b.createdAt));
}

export interface GoalOutlineRow { goal: LifeGoal; depth: number; children: number; }
/** Flatten the actual parent-child graph, not just horizon buckets. Defensive against malformed backups. */
export function goalOutline(goals: readonly LifeGoal[], expanded: ReadonlySet<string>): GoalOutlineRow[] {
  const byParent = new Map<string | null, LifeGoal[]>();
  const ids = new Set(goals.map(goal => goal.id));
  const rank = { 'five-years': 0, year: 1, quarter: 2, month: 3 };
  for (const goal of goals) {
    const parent = goal.parentId && ids.has(goal.parentId) && goal.parentId !== goal.id ? goal.parentId : null;
    const list = byParent.get(parent) ?? [];
    list.push(goal);
    byParent.set(parent, list);
  }
  byParent.forEach(items => items.sort((a, b) => rank[a.horizon] - rank[b.horizon] || a.createdAt.localeCompare(b.createdAt)));
  const rows: GoalOutlineRow[] = [];
  const visited = new Set<string>();
  const walk = (goal: LifeGoal, depth: number) => {
    if (visited.has(goal.id)) return;
    visited.add(goal.id);
    const children = byParent.get(goal.id) ?? [];
    rows.push({ goal, depth, children: children.length });
    if (expanded.has(goal.id)) children.forEach(child => walk(child, depth + 1));
  };
  (byParent.get(null) ?? []).forEach(goal => walk(goal, 0));
  // Cycles or corrupt records should not disappear completely.
  goals.filter(goal => !visited.has(goal.id) && !(goal.parentId && ids.has(goal.parentId))).forEach(goal => walk(goal, 0));
  if (expanded.size >= goals.length) goals.forEach(goal => { if (!visited.has(goal.id)) walk(goal, 0); });
  return rows;
}
