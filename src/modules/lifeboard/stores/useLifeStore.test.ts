import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useLifeStore } from './useLifeStore';
import { parseDate } from '../date';

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe('Lifeboard goals and check-ins', () => {
  it('seeds 3 focus goals and examples, does not fake completed check-ins', () => {
    const store = useLifeStore();
    expect(store.focusGoals).toHaveLength(3);
    expect(store.goals).toHaveLength(10);
    expect(store.notes).toHaveLength(8);
    expect(store.noteGroups).toHaveLength(3);
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

describe('Lifeboard goal decomposition and custom categories', () => {
  it('supports custom categories and protects categories that are used', () => {
    const store = useLifeStore();
    expect(store.addCategory('Мотоциклы', '#c9683f')).toBe(true);
    expect(store.addCategory('Мотоциклы')).toBe(false);
    const area = store.categories.find(c => c.name === 'Мотоциклы')!;
    store.addGoal({ title: 'Права A', description: '', areaId: area.id, horizon: 'year', target: 12 });
    expect(store.deleteCategory(area.id)).toBe(false);
    store.deleteGoal(store.goals.at(-1)!.id);
    expect(store.deleteCategory(area.id)).toBe(true);
  });

  it('saves parent goals, prevents cycles and detaches children when parent is removed', () => {
    const store = useLifeStore();
    store.addGoal({ title: 'Свобода', description: '', areaId: 'other', horizon: 'five-years', target: 1 });
    const parent = store.goals.at(-1)!;
    store.addGoal({ title: 'Удалённая работа', description: '', areaId: 'career', horizon: 'year', target: 8, parentId: parent.id });
    const child = store.goals.at(-1)!;
    expect(store.goalAncestors(child.id).map(g => g.id)).toEqual([parent.id]);
    expect(store.setGoalParent(parent.id, child.id)).toBe(false);
    store.deleteGoal(parent.id);
    expect(store.goals.find(g => g.id === child.id)?.parentId).toBeNull();
  });

  it('imports earlier v1 backup without categories and supports explicit reset', () => {
    const store = useLifeStore();
    const old = JSON.parse(store.exportState());
    delete old.categories;
    expect(store.importState(JSON.stringify(old))).toBe(true);
    expect(store.categories.length).toBeGreaterThan(0);
    store.resetState();
    expect(store.goals).toEqual([]);
    expect(store.routines).toEqual([]);
  });
});

describe('Lifeboard monthly focus (v0.5)', () => {
  it('supports explicit focus selection up to 3 goals, regardless of horizon', () => {
    const store = useLifeStore();
    expect(store.focusGoals).toHaveLength(3);
    const firstId = store.focusGoals[0].id;
    expect(store.toggleFocus(firstId)).toBe(true);
    expect(store.focusGoals).toHaveLength(2);
    store.addGoal({ title:'Annual strategy', description:'', areaId:'career', horizon:'year', target:8 });
    const annual = store.goals.at(-1)!;
    expect(store.toggleFocus(annual.id)).toBe(true);
    expect(store.isFocus(annual.id)).toBe(true);
    store.addGoal({ title:'Four',description:'',areaId:'other',horizon:'month',target:1 });
    expect(store.toggleFocus(store.goals.at(-1)!.id)).toBe(false);
    expect(store.focusGoals).toHaveLength(3);
    store.deleteGoal(annual.id);
    expect(store.focusGoals).toHaveLength(2);
  });

  it('imports backups without focus ids and can persist an intentionally empty focus', () => {
    const store = useLifeStore();
    const old = JSON.parse(store.exportState());
    delete old.focusGoalIds;
    expect(store.importState(JSON.stringify(old))).toBe(true);
    expect(store.focusGoals).toHaveLength(3);
    const ids = store.focusGoals.map(g => g.id);
    ids.forEach(id => expect(store.toggleFocus(id)).toBe(true));
    expect(store.focusGoals).toHaveLength(0);
    const fresh = store.exportState();
    expect(store.importState(fresh)).toBe(true);
    expect(store.focusGoals).toHaveLength(0);
  });
});

describe('Lifeboard notes board (v0.6)', () => {
  it('creates groups and cards linked to goals, updates and pins notes', () => {
    const store = useLifeStore();
    const groupId = store.addNoteGroup({ name: 'Обучение', goalId: 'backend-goal', color: '#88B7CE' });
    expect(groupId).toBeTruthy();
    expect(store.addNoteGroup({ name: 'Обучение', goalId: null, color: '#88B7CE' })).toBeNull();
    const id = store.addNote({
      title: 'Nest patterns', content: 'DI, guards, pipes', groupId: groupId!, goalId: 'backend-goal', imageDataUrl: null, pinned: false,
    });
    expect(id).toBeTruthy();
    expect(store.notes).toHaveLength(9);
    expect(store.updateNote(id!, {
      title: 'Nest patterns v2', content: 'DI, guards, pipes', groupId: groupId!, goalId: 'backend-goal', imageDataUrl: null, pinned: true,
    })).toBe(true);
    expect(store.notes.find(n=>n.id===id)?.pinned).toBe(true);
    expect(store.notes.find(n=>n.id===id)?.title).toBe('Nest patterns v2');
    expect(store.deleteNote(id!)).toBe(true);
    expect(store.notes).toHaveLength(8);
  });

  it('keeps notes when group or goal is deleted and includes notes in backup', () => {
    const store = useLifeStore();
    const groupId = store.addNoteGroup({ name: 'Заметки по проекту', goalId: 'backend-goal', color: '#9CBFA3' })!;
    const noteId = store.addNote({
      title: 'Архитектура', content: 'Разделить модули', groupId, goalId: 'backend-goal', imageDataUrl: null, pinned: true,
    })!;
    expect(store.deleteNoteGroup(groupId)).toBe(true);
    expect(store.notes.find(n => n.id === noteId)?.groupId).toBeNull();
    store.deleteGoal('backend-goal');
    expect(store.notes.find(n => n.id === noteId)?.goalId).toBeNull();
    const exported = store.exportState();
    store.resetState();
    expect(store.notes).toHaveLength(0);
    expect(store.importState(exported)).toBe(true);
    expect(store.notes).toHaveLength(9);
  });

  it('imports old v0.5 backups without notes and rejects invalid note payloads', () => {
    const store = useLifeStore();
    const old = JSON.parse(store.exportState());
    delete old.notes;
    delete old.noteGroups;
    expect(store.importState(JSON.stringify(old))).toBe(true);
    expect(store.notes).toHaveLength(0);
    expect(store.noteGroups).toHaveLength(0);
    expect(store.addNote({
      title: '', content: '', groupId: null, goalId: null, imageDataUrl: null, pinned: false,
    })).toBeNull();
    const corrupt = JSON.parse(store.exportState());
    corrupt.notes = [{ id: 'x', title: 'Bad', content: 'Bad', imageDataUrl: 'javascript:alert(1)' }];
    expect(store.importState(JSON.stringify(corrupt))).toBe(false);
  });
});


describe('Lifeboard v0.7 startup and non-destructive examples', () => {
  it('merges examples into an old profile without overriding personal records', () => {
    const store = useLifeStore();
    const old = JSON.parse(store.exportState());
    old.goals = old.goals.slice(0,3);
    old.notes = [];
    old.noteGroups = [];
    expect(store.importState(JSON.stringify(old))).toBe(true);
    store.addNote({title:'My own note',content:'Private thought',groupId:null,goalId:null,imageDataUrl:null,pinned:true});
    const result = store.addDemoContent();
    expect(result).toMatchObject({goals:7,notes:8});
    expect(store.notes.some(note => note.title === 'My own note')).toBe(true);
    expect(store.addDemoContent()).toMatchObject({goals:0,notes:0});
  });

  it('exports and imports all note groups, note text, and images', () => {
    const store = useLifeStore();
    const imageDataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    const id = store.addNote({title:'Photo',content:'Remember this',groupId:'demo-group-life',goalId:'demo-vision',imageDataUrl,pinned:true});
    const backup = store.exportState();
    expect(JSON.parse(backup).notes.some((note:{id:string}) => note.id === id)).toBe(true);
    store.resetState();
    expect(store.importState(backup)).toBe(true);
    expect(store.notes.find(note=>note.id===id)?.imageDataUrl).toBe(imageDataUrl);
    expect(store.noteGroups.find(g=>g.id==='demo-group-life')).toBeTruthy();
  });
});
