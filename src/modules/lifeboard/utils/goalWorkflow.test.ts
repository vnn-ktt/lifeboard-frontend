import { describe, expect, it } from 'vitest';
import { goalOutline, goalStatus, isCalendarDate, milestoneProgress, taskProgress, tasksForDay, validGoalTask, validMilestone } from './goalWorkflow';
import type { GoalMilestone, GoalTask, LifeGoal } from '../types';

const date = '2026-11-07T12:00:00.000Z';
const goal = (id: string, parentId: string | null = null): LifeGoal => ({
  id, areaId: 'other', title: id, description: '', horizon: 'month', target: 10, parentId, createdAt: date,
});
const milestone = (id: string, completedAt: string | null = null): GoalMilestone => ({
  id, goalId: 'parent', title: 'Finish a project', description: '', order: 0, createdAt: date, completedAt,
});
const task = (id: string, dueDate?: string, completedAt: string | null = null): GoalTask => ({
  id, goalId: 'parent', title: 'Send application', description: '', milestoneId: null, dueDate, completedAt, createdAt: date,
});

describe('Goal Workflow v0.16.0', () => {
  it('accepts valid milestones/tasks and rejects invalid calendar dates', () => {
    expect(isCalendarDate('2026-02-29')).toBe(false);
    expect(isCalendarDate('2028-02-29')).toBe(true);
    expect(validMilestone(milestone('one'))).toBe(true);
    expect(validGoalTask(task('two'))).toBe(true);
    expect(validGoalTask({ ...task('two'), title: '' })).toBe(false);
  });
  it('does not infer completed status from goal progress', () => {
    expect(goalStatus(goal('parent'))).toBe('active');
    expect(goalStatus({ ...goal('parent'), status: 'completed' })).toBe('completed');
  });
  it('keeps milestone and task progress independent', () => {
    expect(milestoneProgress('parent', [milestone('m1', date), milestone('m2')])).toEqual({ completed: 1, total: 2, percent: 50 });
    expect(taskProgress('parent', [task('t1'), task('t2', undefined, date)])).toEqual({ completed: 1, total: 2, percent: 50 });
  });
  it('displays overdue and unscheduled work only on today', () => {
    const items = [task('overdue', '2026-11-04'), task('today', '2026-11-07'), task('unscheduled'), task('done', '2026-11-04', date)];
    expect(tasksForDay(items, '2026-11-07', '2026-11-07').map(item => item.id)).toEqual(['overdue', 'today', 'unscheduled']);
    expect(tasksForDay(items, '2026-11-04', '2026-11-07').map(item => item.id)).toEqual(['overdue', 'done']);
  });
  it('expands real parent-child hierarchy regardless of horizon', () => {
    const goals = [goal('child', 'parent'), goal('parent'), goal('grand', 'child')];
    const rows = goalOutline(goals, new Set(['parent', 'child', 'grand']));
    expect(rows.map(item => [item.goal.id, item.depth])).toEqual([['parent', 0], ['child', 1], ['grand', 2]]);
    expect(goalOutline(goals, new Set()).map(item => item.goal.id)).toEqual(['parent']);
  });
});
