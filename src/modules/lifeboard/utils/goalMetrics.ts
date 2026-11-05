import { dateKey } from '../date';
import type { GoalMeasurement, GoalMetricEntry, Horizon, LifeGoal } from '../types';

export const GOAL_KINDS = ['activity', 'increase', 'decrease', 'binary'] as const;
export type GoalKind = typeof GOAL_KINDS[number];

const DATE_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
const MAX_VALUE = 1_000_000_000_000;

export function validGoalDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d;
}

export function validGoalPeriod(start?: string, due?: string): boolean {
  if (start && !validGoalDate(start)) return false;
  if (due && !validGoalDate(due)) return false;
  return !start || !due || start <= due;
}

export function goalKind(measurement: GoalMeasurement | undefined): GoalKind {
  if (measurement?.kind === 'numeric') return measurement.direction;
  return measurement?.kind === 'binary' ? 'binary' : 'activity';
}

export function validGoalMeasurement(measurement: GoalMeasurement | undefined): boolean {
  if (!measurement) return true; // legacy activity goal
  if (measurement.kind === 'activity' || measurement.kind === 'binary') return true;
  if (measurement.kind !== 'numeric') return false;
  const { startValue, targetValue, direction, unit } = measurement;
  return Number.isFinite(startValue) && Number.isFinite(targetValue) &&
    Math.abs(startValue) <= MAX_VALUE && Math.abs(targetValue) <= MAX_VALUE &&
    typeof unit === 'string' && unit.trim().length >= 1 && unit.trim().length <= 20 &&
    (direction === 'increase' ? targetValue > startValue : direction === 'decrease' && targetValue < startValue);
}

export function validMetricEntry(entry: GoalMetricEntry): boolean {
  return !!entry && typeof entry.id === 'string' && !!entry.id &&
    typeof entry.goalId === 'string' && !!entry.goalId &&
    validGoalDate(entry.date) && typeof entry.note === 'string' && entry.note.length <= 300 &&
    Number.isFinite(entry.value) && Math.abs(entry.value) <= MAX_VALUE &&
    typeof entry.createdAt === 'string' && Number.isFinite(Date.parse(entry.createdAt));
}

export function defaultGoalDueDate(start: string, horizon: Horizon): string {
  if (!validGoalDate(start)) return start;
  const [year, month, day] = start.split('-').map(Number);
  const months = horizon === 'month' ? 1 : horizon === 'quarter' ? 3 : horizon === 'year' ? 12 : 60;
  // Clamp 29/30/31 to the target month's final day.
  const monthIndex = month - 1 + months;
  const endYear = year + Math.floor(monthIndex / 12);
  const endMonth = ((monthIndex % 12) + 12) % 12;
  const finalDay = new Date(endYear, endMonth + 1, 0).getDate();
  return dateKey(new Date(endYear, endMonth, Math.min(day, finalDay)));
}

/** Historical results can be edited backdated; most recent date and timestamp win. */
export function goalMetricHistory(goalId: string, entries: readonly GoalMetricEntry[]): GoalMetricEntry[] {
  return entries.filter(entry => entry.goalId === goalId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)); // Stable sort preserves insert order for same-millisecond updates.
}

export function latestGoalMetricEntry(goalId: string, entries: readonly GoalMetricEntry[], at: Date = new Date()): GoalMetricEntry | undefined {
  const through = dateKey(at);
  return goalMetricHistory(goalId, entries).filter(entry => entry.date <= through).at(-1);
}

export function goalOutcomeProgress(goal: LifeGoal, entries: readonly GoalMetricEntry[] = [], at: Date = new Date()): {
  kind: GoalKind;
  current: number;
  start: number;
  target: number;
  percent: number;
  unit: string;
  complete: boolean;
} | null {
  const measurement = goal.measurement;
  if (!measurement || measurement.kind === 'activity') return null;
  const last = latestGoalMetricEntry(goal.id, entries, at);
  if (measurement.kind === 'binary') {
    const complete = last?.value === 1;
    return { kind: 'binary', current: complete ? 1 : 0, start: 0, target: 1, percent: complete ? 100 : 0, unit: '', complete };
  }
  const current = last?.value ?? measurement.startValue;
  const fraction = (current - measurement.startValue) / (measurement.targetValue - measurement.startValue);
  const percent = Math.max(0, Math.min(100, Math.round(fraction * 100)));
  return { kind: measurement.direction, current, start: measurement.startValue, target: measurement.targetValue, percent, unit: measurement.unit, complete: fraction >= 1 };
}

export function formatGoalValue(value: number, unit: string, locale: string): string {
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(value);
  return unit ? `${number} ${unit}` : number;
}
