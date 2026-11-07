import { describe, expect, it } from 'vitest';
import { getGoalProgress } from './goalProgress';
import type { LifeGoal, LifeRoutine } from '../types';

const goal = (horizon: LifeGoal['horizon']): LifeGoal => ({
  id:'goal', title:'Practice', description:'', areaId:'learning',
  horizon, target:4, createdAt:'2026-11-01T00:00:00Z',
});
const routine: LifeRoutine = { id:'routine', goalId:'goal', title:'Practice', description:'',time:'17:00', days:[1], durationMinutes:25 };
const checks = {
  '2026-10-31|routine':true, '2026-11-01|routine':true,
  '2026-11-03|routine':true, '2026-12-01|routine':true,
  '2027-02-01|routine':true, '2030-01-01|routine':true,
  '2031-01-01|routine':true, '2026-11-03|other':true,
};
describe('goal period progress, without scanning every calendar day', () => {
  const at=new Date(2026, 10, 10);
  it('counts only the current month', () => expect(getGoalProgress(goal('month'), [routine], checks, at).done).toBe(2));
  // Q4 contains Oct 31, Nov 1, Nov 3 and Dec 1; legacy rolling windows include the full quarter.
  it('counts only the current quarter', () => expect(getGoalProgress(goal('quarter'), [routine], checks, at).done).toBe(4));
  it('counts only the current year', () => expect(getGoalProgress(goal('year'), [routine], checks, at).done).toBe(4));
  it('counts five years starting at the current year', () => {
    expect(getGoalProgress(goal('five-years'), [routine], checks, at).done).toBe(6);
  });
  it('computes progress as a percentage of target', () => expect(getGoalProgress(goal('month'), [routine], checks, at).percent).toBe(50));
  it('does not count unchecked values', () => expect(getGoalProgress(goal('month'), [routine], { '2026-11-03|routine':false }, at).done).toBe(0));
});
