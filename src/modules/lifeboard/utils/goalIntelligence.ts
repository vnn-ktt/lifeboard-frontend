import type { GoalMetricEntry, LifeGoal } from '../types';
import { goalMetricHistory, goalOutcomeProgress, validGoalDate } from './goalMetrics';

/** UTC calendar arithmetic avoids DST shifts for local YYYY-MM-DD observations. */
export function calendarDayNumber(day: string): number {
  if (!validGoalDate(day)) return Number.NaN;
  const [year, month, date] = day.split('-').map(Number);
  return Math.round(Date.UTC(year, month - 1, date) / 86_400_000);
}

export function calendarDayFromNumber(day: number): string {
  return new Date(day * 86_400_000).toISOString().slice(0, 10);
}

export interface IntelligenceReading { date: string; value: number; }
export type ForecastStatus = 'unsupported' | 'insufficient' | 'achieved' | 'moving-away' | 'no-deadline' | 'on-track' | 'at-risk' | 'overdue' | 'stale';
export interface GoalForecast {
  status: ForecastStatus;
  /** The estimated achievement date is a linear extrapolation, not a guarantee. */
  estimatedDate: string | null;
  /** Progress in the direction of the target, in goal units per calendar day. */
  pacePerDay: number | null;
  /** True only for at least two real measurements on different days, 7+ days apart. */
  hasTrend: boolean;
  readings: IntelligenceReading[];
}

/** Collapse edits on the same day. Future observations do not influence today's forecast. */
export function outcomeReadings(goal: LifeGoal, entries: readonly GoalMetricEntry[], asOf: string): IntelligenceReading[] {
  const byDay = new Map<string, number>();
  if (!validGoalDate(asOf)) return [];
  for (const entry of goalMetricHistory(goal.id, entries)) {
    if (entry.date > asOf || (goal.startDate && entry.date < goal.startDate) ||
        !validGoalDate(entry.date) || !Number.isFinite(entry.value)) continue;
    byDay.set(entry.date, entry.value);
  }
  return [...byDay].map(([date, value]) => ({ date, value }));
}

export function forecastGoal(goal: LifeGoal, entries: readonly GoalMetricEntry[], asOf: string): GoalForecast {
  const readings = outcomeReadings(goal, entries, asOf);
  const base: GoalForecast = { status: 'unsupported', estimatedDate: null, pacePerDay: null, hasTrend: false, readings };
  if (goal.measurement?.kind !== 'numeric' || !validGoalDate(asOf)) return base;
  const { direction, targetValue, startValue } = goal.measurement;
  const sign = direction === 'decrease' ? -1 : 1;
  const current = readings.at(-1)?.value ?? startValue;
  if ((targetValue - current) * sign <= 0) return { ...base, status: 'achieved' };
  if (goal.dueDate && goal.dueDate < asOf) return { ...base, status: 'overdue' };
  // A single measurement or two measurements on the same day cannot establish a pace.
  if (readings.length < 2) return { ...base, status: 'insufficient' };
  const first = readings[0];
  const last = readings[readings.length - 1];
  const elapsed = calendarDayNumber(last.date) - calendarDayNumber(first.date);
  if (elapsed < 7) return { ...base, status: 'insufficient' };
  // Forecasting from old readings creates false confidence; request a fresh update.
  if (calendarDayNumber(asOf) - calendarDayNumber(last.date) > 45) return { ...base, status: 'stale' };
  const pacePerDay = (last.value - first.value) * sign / elapsed;
  if (!Number.isFinite(pacePerDay) || pacePerDay <= 0) return { ...base, status: 'moving-away', hasTrend: true, pacePerDay };
  const neededDays = Math.ceil(((targetValue - current) * sign) / pacePerDay);
  // Limit projection to a sensible horizon; dates 100+ years in the future are not actionable.
  if (!Number.isFinite(neededDays) || neededDays > 36500 || neededDays < 0) {
    return { ...base, status: 'insufficient', hasTrend: true, pacePerDay };
  }
  const estimatedDate = calendarDayFromNumber(calendarDayNumber(asOf) + neededDays);
  if (!goal.dueDate) return { ...base, status: 'no-deadline', hasTrend: true, pacePerDay, estimatedDate };
  return { ...base, status: estimatedDate <= goal.dueDate ? 'on-track' : 'at-risk', hasTrend: true, pacePerDay, estimatedDate };
}

export interface WeeklyOutcome {
  kind: 'numeric' | 'binary' | 'activity';
  /** Only measured changes are reported, never an inferred delta from absent observations. */
  hasUpdate: boolean;
  delta: number | null;
  current: number | null;
  previous: number | null;
  /** Numeric change expressed as progress towards the target, positive = improvement. */
  directedDelta: number | null;
  updatedCount: number;
}

export function weeklyGoalOutcome(goal: LifeGoal, entries: readonly GoalMetricEntry[], weekStart: string, weekEnd: string): WeeklyOutcome {
  const kind = goal.measurement?.kind === 'numeric' ? 'numeric' : goal.measurement?.kind === 'binary' ? 'binary' : 'activity';
  const empty: WeeklyOutcome = { kind, hasUpdate: false, delta: null, current: null, previous: null, directedDelta: null, updatedCount: 0 };
  if (kind === 'activity' || !validGoalDate(weekStart) || !validGoalDate(weekEnd) || weekStart > weekEnd) return empty;
  const readings = outcomeReadings(goal, entries, weekEnd);
  const inWeek = readings.filter(item => item.date >= weekStart);
  if (!inWeek.length) return empty;
  const previous = readings.filter(item => item.date < weekStart).at(-1)?.value ??
    (goal.measurement?.kind === 'numeric' && goal.startDate && goal.startDate <= weekStart ? goal.measurement.startValue : null);
  const current = readings.at(-1)?.value ?? null;
  const delta = previous !== null && current !== null ? current - previous : null;
  const directedDelta = delta === null ? null : delta * (goal.measurement?.kind === 'numeric' && goal.measurement.direction === 'decrease' ? -1 : 1);
  return { kind, hasUpdate: true, delta, current, previous, directedDelta, updatedCount: inWeek.length };
}

export function outcomeAsOf(goal: LifeGoal, entries: readonly GoalMetricEntry[], date: Date) {
  return goalOutcomeProgress(goal, entries, date);
}
