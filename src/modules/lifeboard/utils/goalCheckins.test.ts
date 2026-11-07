import { describe, expect, it } from 'vitest';
import { parseDate } from '../date';
import type { GoalCheckin, LifeGoal } from '../types';
import { checkinDueDates, defaultCheckinSchedule, nextGoalCheckinDate, pendingGoalCheckins, validCheckinRecord, validCheckinSchedule } from './goalCheckins';

const goal: LifeGoal = {
  id: 'savings', areaId: 'finance', title: 'Save 100k', description: '',
  horizon: 'year', target: 24, createdAt: '2026-11-05T11:00:00Z',
  measurement: { kind: 'numeric', direction: 'increase', startValue: 0, targetValue: 100_000, unit: '$' },
  checkin: { frequency: 'weekly', weekday: 7, fromDate: '2026-11-05' },
};

function resolved(dueDate: string, status: GoalCheckin['status']): GoalCheckin {
  return { id: `check-${dueDate}`, goalId: goal.id, dueDate, completedAt: '2026-11-16T12:00:00Z', status };
}

describe('Goal check-ins', () => {
  it('schedules the first Sunday only after activation', () => {
    expect(checkinDueDates(goal, '2026-11-07')).toEqual([]);
    expect(checkinDueDates(goal, '2026-11-08')).toEqual(['2026-11-08']);
    expect(nextGoalCheckinDate(goal, '2026-11-05')).toBe('2026-11-08');
    expect(defaultCheckinSchedule('2026-11-05')).toEqual(goal.checkin);
  });

  it('keeps the oldest overdue check-in visible even after a later Sunday', () => {
    const due = pendingGoalCheckins([goal], [], [], parseDate('2026-11-16'));
    expect(due).toMatchObject([{ dueDate: '2026-11-08', overdue: true, pendingCount: 2 }]);
    expect(pendingGoalCheckins([goal], [resolved('2026-11-08', 'unchanged')], [], parseDate('2026-11-16')))
      .toMatchObject([{ dueDate: '2026-11-15', pendingCount: 1 }]);
  });

  it('supports daily reminders and manual/off modes', () => {
    expect(checkinDueDates({ ...goal, checkin: { frequency: 'daily', fromDate: '2026-11-05' } }, '2026-11-07'))
      .toEqual(['2026-11-05', '2026-11-06', '2026-11-07']);
    expect(checkinDueDates({ ...goal, checkin: { frequency: 'manual', fromDate: '2026-11-05' } }, '2026-11-07')).toEqual([]);
    expect(checkinDueDates({ ...goal, checkin: { frequency: 'off', fromDate: '2026-11-05' } }, '2026-11-07')).toEqual([]);
  });

  it('does not schedule check-ins past the due date or after completion', () => {
    const ended = { ...goal, dueDate: '2026-11-10' };
    expect(checkinDueDates(ended, '2026-11-29')).toEqual(['2026-11-08']);
    const metric = { id:'m1',goalId:goal.id, value:100_000, date:'2026-11-15', note:'done', createdAt:'2026-11-15T12:00:00Z' };
    expect(pendingGoalCheckins([goal], [], [metric], parseDate('2026-11-16'))).toEqual([]);
  });

  it('rejects malformed schedules and records', () => {
    expect(validCheckinSchedule({ frequency: 'weekly', fromDate:'2026-11-05', weekday: 0 })).toBe(false);
    expect(validCheckinSchedule({ frequency: 'weekly', fromDate:'2026-11-05' })).toBe(false);
    expect(validCheckinRecord(resolved('2026-11-08', 'skipped'))).toBe(true);
    expect(validCheckinRecord({ ...resolved('2026-11-08', 'skipped'), dueDate: '2026-11-31' })).toBe(false);
  });
});
