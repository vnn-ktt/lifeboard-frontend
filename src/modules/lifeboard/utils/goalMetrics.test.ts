import { describe, expect, it } from 'vitest';
import { defaultGoalDueDate, goalMetricHistory, goalOutcomeProgress, validGoalDate, validGoalMeasurement, validGoalPeriod } from './goalMetrics';
import { getGoalProgress } from './goalProgress';
import type { GoalMetricEntry, LifeGoal, LifeRoutine } from '../types';

const at = new Date(2026, 10, 5);
const base = (measurement: LifeGoal['measurement']): LifeGoal => ({
  id: 'goal', areaId: 'finance', title: 'Outcome', description: '',
  horizon: 'year', target: 4, createdAt: '2026-01-01T00:00:00Z',
  startDate: '2026-01-01', dueDate: '2026-12-31', measurement,
});
const reading = (id: string, date: string, value: number): GoalMetricEntry => ({
  id, goalId: 'goal', date, value, note: '', createdAt: `${date}T12:00:00.000Z`,
});
const routine: LifeRoutine = { id: 'r', goalId: 'goal', title: 'Save', description: '', time: '10:00', durationMinutes: 5, days: [1] };
const checks = { '2026-01-01|r': true, '2026-03-01|r': true, '2026-08-01|r': true };

describe('Goal Metrics v0.15: true outcome is independent from activity', () => {
  it('measures increasing financial targets against the starting value', () => {
    const goal = base({ kind: 'numeric', direction: 'increase', startValue: 20_000, targetValue: 100_000, unit: '$' });
    const progress = getGoalProgress(goal, [routine], checks, at, [reading('m1','2026-05-05',50_000)]);
    expect(progress.percent).toBe(38);
    expect(progress.activity).toMatchObject({ done: 3, target: 4, percent: 75 });
    expect(progress.outcome).toMatchObject({ current: 50_000, target: 100_000, complete: false });
  });

  it('supports decreasing goals and clamps progress to 0–100%', () => {
    const goal = base({ kind: 'numeric', direction: 'decrease', startValue: 100, targetValue: 85, unit: 'kg' });
    expect(goalOutcomeProgress(goal, [reading('1','2026-06-01',93)], at)?.percent).toBe(47);
    expect(goalOutcomeProgress(goal, [reading('2','2026-06-01',82)], at)?.percent).toBe(100);
    expect(goalOutcomeProgress(goal, [reading('3','2026-06-01',105)], at)?.percent).toBe(0);
  });

  it('supports binary completion and reversals while retaining history', () => {
    const goal = base({ kind:'binary' });
    const entries = [reading('a','2026-02-01',1), reading('b','2026-06-01',0), reading('c','2026-10-01',1)];
    expect(goalOutcomeProgress(goal, entries, new Date(2026, 3, 1))?.complete).toBe(true);
    expect(goalOutcomeProgress(goal, entries, new Date(2026, 7, 1))?.complete).toBe(false);
    expect(goalOutcomeProgress(goal, entries, at)?.complete).toBe(true);
    expect(goalMetricHistory(goal.id, entries)).toHaveLength(3);
    const sameMoment = [reading('z','2026-10-01',1), reading('a','2026-10-01',0)];
    expect(goalOutcomeProgress(goal, sameMoment, at)?.complete).toBe(false);
  });

  it('selects the latest dated reading, not the last array item or a future reading', () => {
    const goal = base({ kind: 'numeric', direction: 'increase', startValue: 0, targetValue: 100, unit: '%' });
    const entries = [reading('late','2026-10-01',90), reading('early','2026-01-01',10), reading('future','2027-02-01',95)];
    expect(goalOutcomeProgress(goal, entries, at)?.current).toBe(90);
  });

  it('enforces inclusive fixed date windows for activities', () => {
    const goal = base({ kind: 'activity' });
    const progress = getGoalProgress(goal, [routine], {
      '2025-12-31|r': true, '2026-01-01|r': true, '2026-12-31|r': true, '2027-01-01|r': true,
    }, new Date(2027, 0, 1));
    expect(progress.done).toBe(2);
  });

  it('handles real calendar dates and validates metric configurations', () => {
    expect(validGoalDate('2028-02-29')).toBe(true);
    expect(validGoalDate('2027-02-29')).toBe(false);
    expect(defaultGoalDueDate('2026-01-31','month')).toBe('2026-02-28');
    expect(validGoalPeriod('2026-10-01','2026-09-30')).toBe(false);
    expect(validGoalMeasurement({ kind:'numeric', direction:'increase', startValue:100, targetValue:80, unit:'$' })).toBe(false);
    expect(validGoalMeasurement({ kind:'numeric', direction:'decrease', startValue:100, targetValue:80, unit:'kg' })).toBe(true);
  });
});
