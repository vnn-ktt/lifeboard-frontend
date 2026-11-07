import { describe, expect, it } from 'vitest';
import type { GoalMetricEntry, LifeGoal } from '../types';
import { calendarDayNumber, forecastGoal, outcomeReadings, weeklyGoalOutcome } from './goalIntelligence';

const goal = (direction: 'increase' | 'decrease' = 'increase'): LifeGoal => ({
  id: 'g', areaId: 'finance', title: 'Test', description: '', horizon: 'year', target: 8,
  createdAt: '2026-01-01T00:00:00Z', startDate: '2026-01-01', dueDate: '2026-12-31',
  measurement: direction === 'increase'
    ? { kind: 'numeric', direction, startValue: 0, targetValue: 100, unit: '$' }
    : { kind: 'numeric', direction, startValue: 100, targetValue: 80, unit: 'kg' },
});
const entry = (date: string, value: number, id = date): GoalMetricEntry => ({ id, goalId: 'g', date, value, note: '', createdAt: `${date}T12:00:00Z` });

describe('Progress Intelligence v0.17', () => {
  it('uses calendar arithmetic with no DST shift', () => {
    expect(calendarDayNumber('2026-03-30') - calendarDayNumber('2026-03-28')).toBe(2);
  });
  it('predicts on-track increase from distinct observations', () => {
    const result = forecastGoal(goal(), [entry('2026-01-01', 10), entry('2026-02-01', 40)], '2026-02-01');
    expect(result.status).toBe('on-track');
    expect(result.pacePerDay).toBeCloseTo(30 / 31);
    expect(result.estimatedDate).toBe('2026-04-04');
  });
  it('predicts falling metric in correct direction', () => {
    const result = forecastGoal(goal('decrease'), [entry('2026-01-01', 98), entry('2026-02-01', 90)], '2026-02-01');
    expect(result.status).toBe('on-track');
    expect(result.pacePerDay).toBeGreaterThan(0);
  });
  it('flags readings older than 45 days as stale', () => {
    expect(forecastGoal(goal(), [entry('2026-01-01', 10), entry('2026-02-01', 20)], '2026-04-01').status).toBe('stale');
  });
  it('does not fabricate a projection with zero/one or tightly spaced readings', () => {
    expect(forecastGoal(goal(), [], '2026-02-01').status).toBe('insufficient');
    expect(forecastGoal(goal(), [entry('2026-02-01', 10)], '2026-02-01').status).toBe('insufficient');
    expect(forecastGoal(goal(), [entry('2026-02-01', 10), entry('2026-02-03', 20)], '2026-02-03').status).toBe('insufficient');
  });
  it('identifies declining pace and no-deadline projections', () => {
    expect(forecastGoal(goal(), [entry('2026-01-01', 50), entry('2026-02-01', 40)], '2026-02-01').status).toBe('moving-away');
    expect(forecastGoal({ ...goal(), dueDate: undefined }, [entry('2026-01-01', 10), entry('2026-02-01', 20)], '2026-02-01').status).toBe('no-deadline');
  });
  it('indicates at risk, overdue and achieved goals', () => {
    expect(forecastGoal(goal(), [entry('2026-01-01', 1), entry('2026-10-01', 2)], '2026-10-01').status).toBe('at-risk');
    expect(forecastGoal(goal(), [entry('2026-01-01', 10)], '2027-01-01').status).toBe('overdue');
    expect(forecastGoal(goal(), [entry('2026-01-01', 105)], '2026-02-01').status).toBe('achieved');
  });
  it('deduplicates same-day readings and ignores future observations', () => {
    const readings = outcomeReadings(goal(), [entry('2026-02-01', 10, 'a'), entry('2026-02-01', 20, 'b'), entry('2027-01-01', 30)], '2026-02-02');
    expect(readings).toEqual([{ date: '2026-02-01', value: 20 }]);
  });
  it('keeps weekly outcome empty when no new reading was made', () => {
    const result = weeklyGoalOutcome(goal(), [entry('2026-01-01', 15)], '2026-02-02', '2026-02-08');
    expect(result.hasUpdate).toBe(false);
    expect(result.delta).toBeNull();
  });
  it('compares week result with previous reading, including a reduction', () => {
    const inc = weeklyGoalOutcome(goal(), [entry('2026-01-25', 10), entry('2026-02-03', 35)], '2026-02-02', '2026-02-08');
    expect(inc).toMatchObject({ hasUpdate: true, delta: 25, directedDelta: 25 });
    const dec = weeklyGoalOutcome(goal('decrease'), [entry('2026-01-25', 98), entry('2026-02-03', 92)], '2026-02-02', '2026-02-08');
    expect(dec).toMatchObject({ delta: -6, directedDelta: 6 });
  });
  it('does not invent weekly change for initial observation without baseline date', () => {
    const withoutStart = { ...goal(), startDate: undefined };
    const result = weeklyGoalOutcome(withoutStart, [entry('2026-02-03', 25)], '2026-02-02', '2026-02-08');
    expect(result.hasUpdate).toBe(true);
    expect(result.delta).toBeNull();
  });
  it('disables projection for binary and activity goals', () => {
    expect(forecastGoal({ ...goal(), measurement: { kind: 'binary' } }, [entry('2026-02-01', 1)], '2026-02-02').status).toBe('unsupported');
    expect(forecastGoal({ ...goal(), measurement: { kind: 'activity' } }, [], '2026-02-02').status).toBe('unsupported');
  });
});
