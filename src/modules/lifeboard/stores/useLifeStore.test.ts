import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useLifeStore } from './useLifeStore';
import { parseDate } from '../date';

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe('Lifeboard goals and check-ins', () => {
  it('seeds 3 focus goals, does not fake completed check-ins', () => {
    const store = useLifeStore();
    expect(store.focusGoals).toHaveLength(3);
    const monday = parseDate('2026-11-02');
    expect(store.taskStats(monday)).toMatchObject({ total: 4, done: 0 });
    const saturday = parseDate('2026-11-07');
    expect(store.taskStats(saturday)).toMatchObject({ total: 2, done: 0 });
  });

  it('tracks completion per day, undo and goal progress', () => {
    const store = useLifeStore();
    const day = parseDate('2026-11-03');
    store.setDone('dog-am', day, true);
    expect(store.isDone('dog-am', day)).toBe(true);
    expect(store.isDone('dog-am', parseDate('2026-11-04'))).toBe(false);
    expect(store.goalStats(store.goals[0], day).done).toBe(1);
    store.setDone('dog-am', day, false);
    expect(store.goalStats(store.goals[0], day).done).toBe(0);
  });

  it('creates and removes a goal with its routines', () => {
    const store = useLifeStore();
    store.addGoal({ areaId: 'health', title: 'Сон', description: '', horizon: 'month', target: 20 });
    const goal = store.goals.at(-1)!;
    store.addRoutine({ goalId: goal.id, title: 'Ложиться вовремя', description: '', days: [1,2,3,4,5], time: '23:00', durationMinutes: 1 });
    expect(store.routines.filter((r) => r.goalId === goal.id)).toHaveLength(1);
    store.deleteGoal(goal.id);
    expect(store.routines.filter((r) => r.goalId === goal.id)).toHaveLength(0);
  });

  it('saves and replaces one review per week', () => {
    const store = useLifeStore();
    const day = parseDate('2026-11-04');
    store.saveReview(day, { wins: 'Начал', obstacles: '', nextStep: '', mood: 8 });
    store.saveReview(day, { wins: 'Продолжил', obstacles: '', nextStep: '', mood: 9 });
    expect(store.reviews).toHaveLength(1);
    expect(store.getReview(day)?.wins).toBe('Продолжил');
  });
});
