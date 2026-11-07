import { dateKey, mondayIndex, parseDate, shiftDays } from '../date';
import { goalOutcomeProgress, validGoalDate } from './goalMetrics';
import type { GoalCheckin, GoalCheckinSchedule, GoalMetricEntry, LifeGoal, PendingGoalCheckin } from '../types';

export const CHECKIN_FREQUENCIES = ['off', 'manual', 'daily', 'weekly'] as const;
const MAX_SCHEDULE_SPAN_DAYS = 20_000;

export function defaultCheckinSchedule(from: string = dateKey(new Date())): GoalCheckinSchedule {
  return { frequency: 'weekly', weekday: 7, fromDate: from };
}

export function validCheckinSchedule(schedule: unknown): schedule is GoalCheckinSchedule {
  if (!schedule || typeof schedule !== 'object') return false;
  const candidate = schedule as Partial<GoalCheckinSchedule>;
  return CHECKIN_FREQUENCIES.some(value => candidate.frequency === value) &&
    validGoalDate(candidate.fromDate) &&
    (candidate.weekday === undefined || (Number.isInteger(candidate.weekday) && Number(candidate.weekday) >= 1 && Number(candidate.weekday) <= 7)) &&
    (candidate.frequency !== 'weekly' || Number.isInteger(candidate.weekday));
}

export function validCheckinRecord(value: unknown): value is GoalCheckin {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<GoalCheckin>;
  return typeof item.id === 'string' && !!item.id &&
    typeof item.goalId === 'string' && !!item.goalId &&
    validGoalDate(item.dueDate) &&
    typeof item.completedAt === 'string' && Number.isFinite(Date.parse(item.completedAt)) &&
    (item.status === 'updated' || item.status === 'unchanged' || item.status === 'skipped') &&
    (item.metricEntryId === undefined || typeof item.metricEntryId === 'string');
}

export function checkinDueDates(goal: LifeGoal, to: string): string[] {
  const schedule = goal.checkin;
  if (!schedule || !validCheckinSchedule(schedule) || !['daily', 'weekly'].includes(schedule.frequency) || !validGoalDate(to)) return [];
  if (goal.measurement?.kind === 'activity' || !goal.measurement) return [];
  const from = [schedule.fromDate, goal.startDate].filter((d): d is string => typeof d === 'string').sort().at(-1)!;
  const last = goal.dueDate && goal.dueDate < to ? goal.dueDate : to;
  if (from > last) return [];
  let current = parseDate(from);
  if (schedule.frequency === 'weekly') {
    const days = (schedule.weekday! - mondayIndex(current) + 7) % 7;
    current = shiftDays(current, days);
  }
  const end = parseDate(last);
  const output: string[] = [];
  const step = schedule.frequency === 'weekly' ? 7 : 1;
  for (let i = 0; i < MAX_SCHEDULE_SPAN_DAYS && current <= end; i += step) {
    output.push(dateKey(current));
    current = shiftDays(current, step);
  }
  return output;
}

/** The oldest unresolved check-in stays visible until resolved, including after its due week. */
export function pendingGoalCheckins(
  goals: readonly LifeGoal[],
  checkins: readonly GoalCheckin[],
  metrics: readonly GoalMetricEntry[],
  asOf: Date = new Date(),
): PendingGoalCheckin[] {
  const today = dateKey(asOf);
  const resolved = new Set(checkins.map(entry => `${entry.goalId}|${entry.dueDate}`));
  return goals.flatMap(goal => {
    const outcome = goalOutcomeProgress(goal, metrics, asOf);
    if (!outcome || outcome.complete) return [];
    const pending = checkinDueDates(goal, today).filter(due => !resolved.has(`${goal.id}|${due}`));
    if (!pending.length) return [];
    return [{ goal, dueDate: pending[0], pendingCount: pending.length, overdue: pending[0] < today }];
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.goal.title.localeCompare(b.goal.title));
}

export function nextGoalCheckinDate(goal: LifeGoal, today: string = dateKey(new Date())): string | null {
  const schedule = goal.checkin;
  if (!schedule || !validCheckinSchedule(schedule) || (schedule.frequency !== 'daily' && schedule.frequency !== 'weekly')) return null;
  let candidate = parseDate(today < schedule.fromDate ? schedule.fromDate : today);
  if (schedule.frequency === 'weekly') {
    const diff = (schedule.weekday! - mondayIndex(candidate) + 7) % 7;
    candidate = shiftDays(candidate, diff);
  }
  const result = dateKey(candidate);
  return goal.dueDate && result > goal.dueDate ? null : result;
}
