import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useLifeStore } from './useLifeStore';
import { parseDate } from '../date';
import { initialState } from '../data/seed';

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  // Existing domain tests explicitly load fixture data. Production starts empty
  // until the authenticated backend snapshot has been fetched.
  useLifeStore().replaceRemoteSnapshot(initialState());
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


describe('Lifeboard v0.12 curated quotes', () => {
  it('exposes only system quotes with real source metadata, and only two placements', () => {
    const store = useLifeStore();
    expect(store.quotes.length).toBeGreaterThanOrEqual(10);
    expect(store.quotes.every(q => q.createdBy === 'seed')).toBe(true);
    expect(store.quotes.every(q => q.sourceUrl.startsWith('https://') && q.author.ru && q.author.en && q.author.de)).toBe(true);
    expect(store.assignQuote('dashboard', store.quotes[2].id)).toBe(true);
    expect(store.quoteFor('dashboard')?.id).toBe(store.quotes[2].id);
    expect(store.assignQuote('review', 'user-created-quote')).toBe(false);
    expect(store.assignQuote('review', null)).toBe(true);
    expect(store.quoteFor('review')).toBeUndefined();
  });

  it('imports v0.11 backups without restoring user-authored quotes or removed placements', () => {
    const store = useLifeStore();
    const backup = JSON.parse(store.exportState());
    backup.quotes = [{ id:'old-user-quote', author:'Someone', createdBy:'user', text:{ru:'Текст',en:'Text',de:'Text'} }];
    backup.quoteAssignments = {dashboard:'quote-2',review:'quote-5',notes:'old-user-quote',goals:'quote-3'};
    expect(store.importState(JSON.stringify(backup))).toBe(true);
    expect(store.quotes.length).toBeGreaterThanOrEqual(10);
    expect(store.quotes.some(q => q.id === 'old-user-quote')).toBe(false);
    expect(store.quoteAssignments).toEqual({dashboard:'quote-2',review:'quote-5'});
    expect(store.notes.length).toBeGreaterThan(0);
  });
});


describe('Lifeboard quote placements v0.14.2', () => {
  it('updates each placement immediately and persists both selected quote ids', () => {
    const store = useLifeStore();
    const ids = store.quotes.map(q => q.id);
    expect(ids.length).toBeGreaterThan(2);
    expect(store.assignQuote('dashboard', ids[1])).toBe(true);
    expect(store.quoteAssignments.dashboard).toBe(ids[1]);
    expect(store.quoteFor('dashboard')?.id).toBe(ids[1]);
    expect(store.assignQuote('review', ids[2])).toBe(true);
    expect(store.quoteFor('review')?.id).toBe(ids[2]);
    expect(store.quoteFor('dashboard')?.id).toBe(ids[1]);
    expect(store.importState(store.exportState())).toBe(true);
    expect(store.quoteFor('dashboard')?.id).toBe(ids[1]);
    expect(store.quoteFor('review')?.id).toBe(ids[2]);
  });

  it('can hide a placement without affecting the other screen and rejects unknown ids', () => {
    const store = useLifeStore();
    expect(store.assignQuote('dashboard', 'does-not-exist')).toBe(false);
    expect(store.assignQuote('dashboard', null)).toBe(true);
    expect(store.quoteFor('dashboard')).toBeUndefined();
    expect(store.quoteFor('review')).toBeDefined();
    expect(store.importState(store.exportState())).toBe(true);
    expect(store.quoteFor('dashboard')).toBeUndefined();
  });
});

describe('Lifeboard v0.15 measurable outcomes and backwards-compatible backups', () => {
  it('retains legacy activity goals and imports backups without measurements or dates', () => {
    const store = useLifeStore();
    const old = JSON.parse(store.exportState());
    old.goals.forEach((goal: { measurement?: unknown; startDate?: string; dueDate?: string }) => {
      delete goal.measurement;
      delete goal.startDate;
      delete goal.dueDate;
    });
    delete old.goalMetricEntries;
    expect(store.importState(JSON.stringify(old))).toBe(true);
    expect(store.goals[0].measurement?.kind).toBe('activity');
    expect(store.goalStats(store.goals[0]).outcome).toBeNull();
    expect(store.notes).toHaveLength(8);
  });

  it('persists real outcomes independently from routine completion and retains dated readings', () => {
    const store = useLifeStore();
    const id = store.addGoal({
      title:'Save $100,000', description:'', areaId:'finance', horizon:'year', target:24,
      measurement:{kind:'numeric', direction:'increase', startValue:20_000, targetValue:100_000, unit:'$'},
      startDate:'2025-01-01', dueDate:'2028-12-31',
    });
    expect(id).toBeTruthy();
    expect(store.goalStats(store.goals.find(g => g.id === id)!).percent).toBe(0);
    expect(store.recordGoalMetric(id!, 40_000, '2025-12-10', 'Savings')).toBeTruthy();
    expect(store.recordGoalMetric(id!, 50_000, '2026-01-15')).toBeTruthy();
    const goal = store.goals.find(g => g.id === id)!;
    expect(store.goalStats(goal).percent).toBe(38);
    expect(store.goalStats(goal).activity.done).toBe(0);
    expect(store.goalHistory(id!)).toHaveLength(2);
    expect(store.importState(store.exportState())).toBe(true);
    expect(store.goalHistory(id!)).toHaveLength(2);
    expect(store.notes).toHaveLength(8);
    store.deleteGoal(id!);
    expect(store.goalHistory(id!)).toHaveLength(0);
  });

  it('retains records on target adjustments but clears incompatible history on type change', () => {
    const store = useLifeStore();
    const id = store.addGoal({
      title:'Weight', description:'', areaId:'health', horizon:'year', target:15,
      measurement:{kind:'numeric', direction:'decrease', startValue:100, targetValue:85, unit:'kg'},
    })!;
    expect(store.recordGoalMetric(id, 95, '2026-01-01')).toBeTruthy();
    const goal = store.goals.find(g => g.id === id)!;
    expect(store.updateGoal(id, {
      title:goal.title, description:goal.description, areaId:goal.areaId, horizon:goal.horizon,
      target:goal.target, measurement:{kind:'numeric', direction:'decrease', startValue:100, targetValue:80, unit:'kg'},
    })).toBe(true);
    expect(store.goalHistory(id)).toHaveLength(1);
    expect(store.updateGoal(id, {
      title:goal.title, description:goal.description, areaId:goal.areaId, horizon:goal.horizon,
      target:goal.target, measurement:{kind:'binary'},
    })).toBe(true);
    expect(store.goalHistory(id)).toHaveLength(0);
  });
});


describe('Lifeboard v0.15.1 outcome check-ins', () => {
  it('stores unchanged and skipped check-ins separately from outcome readings', () => {
    const store = useLifeStore();
    const id = store.addGoal({
      title: 'Weekly result', description: '', areaId: 'finance', horizon: 'year', target: 12,
      measurement: { kind: 'numeric', direction: 'increase', startValue: 0, targetValue: 100, unit: '%' },
      checkin: { frequency: 'daily', fromDate: '2026-11-01' },
    })!;
    const before = store.goalMetricEntries.length;
    const due = store.dueGoalCheckins().find(entry => entry.goal.id === id);
    expect(due).toBeDefined();
    expect(store.completeGoalCheckin(id, due!.dueDate, 'unchanged')).toBe(true);
    expect(store.completeGoalCheckin(id, due!.dueDate, 'unchanged')).toBe(false);
    expect(store.goalMetricEntries).toHaveLength(before);
    expect(store.goalCheckins.find(entry => entry.goalId === id)?.status).toBe('unchanged');
    const next = store.dueGoalCheckins().find(entry => entry.goal.id === id);
    expect(next).toBeDefined();
    expect(store.completeGoalCheckin(id, next!.dueDate, 'skipped')).toBe(true);
    expect(store.goalMetricEntries).toHaveLength(before);
    expect(store.goalStats(store.goals.find(goal => goal.id === id)!).percent).toBe(0);
    expect(JSON.parse(store.exportState()).goalCheckins).toHaveLength(2);
  });

  it('preserves check-ins through export/import and deletes them with their goal', () => {
    const store = useLifeStore();
    const id = store.addGoal({
      title: 'Daily weigh-in', description: '', areaId: 'health', horizon: 'month', target: 30,
      measurement: { kind: 'numeric', direction: 'decrease', startValue: 100, targetValue: 85, unit: 'kg' },
      checkin: { frequency: 'daily', fromDate: '2026-11-01' },
    })!;
    const due = store.dueGoalCheckins().find(entry => entry.goal.id === id)!;
    expect(store.completeGoalCheckin(id, due.dueDate, 'updated', 95)).toBe(true);
    expect(store.goalMetricEntries.some(entry => entry.goalId === id && entry.value === 95)).toBe(true);
    const backup = store.exportState();
    store.resetState();
    expect(store.importState(backup)).toBe(true);
    expect(store.goalCheckins.some(entry => entry.goalId === id && entry.status === 'updated')).toBe(true);
    expect(store.goalStats(store.goals.find(goal => goal.id === id)!).outcome?.current).toBe(95);
    store.deleteGoal(id);
    expect(store.goalCheckins.some(entry => entry.goalId === id)).toBe(false);
  });
});

describe('Lifeboard v0.16 milestones, tasks, status and migration', () => {
  it('creates independent milestones and one-time tasks and persists them through backup', () => {
    const store = useLifeStore();
    const goalId = store.goals[0].id;
    const milestoneId = store.addMilestone(goalId, { title: 'Finish prototype', dueDate: '2026-12-01' })!;
    const taskId = store.addGoalTask(goalId, { title: 'Send application', milestoneId })!;
    expect(store.milestoneStats(goalId)).toMatchObject({ total: 1, completed: 0 });
    expect(store.oneTimeTaskStats(goalId)).toMatchObject({ total: 1, completed: 0 });
    expect(store.toggleMilestone(milestoneId)).toBe(true);
    expect(store.milestoneStats(goalId).percent).toBe(100);
    expect(store.goalStats(store.goals[0]).percent).not.toBe(100);
    expect(store.toggleGoalTask(taskId)).toBe(true);
    const backup = store.exportState();
    store.resetState();
    expect(store.importState(backup)).toBe(true);
    expect(store.goalMilestones(goalId)[0]?.completedAt).toBeTruthy();
    expect(store.goalOneTimeTasks(goalId)[0]?.completedAt).toBeTruthy();
  });
  it('keeps tasks when a milestone is removed and removes tasks with a deleted goal', () => {
    const store = useLifeStore();
    const goalId = store.goals[0].id;
    const milestoneId = store.addMilestone(goalId, { title: 'Finish prototype' })!;
    const taskId = store.addGoalTask(goalId, { title: 'Send application', milestoneId })!;
    expect(store.deleteMilestone(milestoneId)).toBe(true);
    expect(store.goalTasks.find(item => item.id === taskId)?.milestoneId).toBeNull();
    store.deleteGoal(goalId);
    expect(store.goalOneTimeTasks(goalId)).toHaveLength(0);
    expect(store.goalMilestones(goalId)).toHaveLength(0);
  });
  it('validates milestone/goal belonging and cannot import broken references', () => {
    const store = useLifeStore();
    const goalId = store.goals[0].id;
    const otherGoalId = store.goals[1].id;
    const milestoneId = store.addMilestone(goalId, { title: 'Finish prototype' })!;
    expect(store.addGoalTask(otherGoalId, { title: 'Wrong owner', milestoneId })).toBeNull();
    const corrupted = JSON.parse(store.exportState());
    corrupted.goalTasks = [{ id: 'bad', goalId: otherGoalId, milestoneId, title: 'Wrong owner', description: '', createdAt: new Date().toISOString() }];
    expect(store.importState(JSON.stringify(corrupted))).toBe(false);
  });
  it('supports all goal statuses without overwriting outcome measurements', () => {
    const store = useLifeStore();
    const goalId = store.goals[0].id;
    const current = store.goalStats(store.goals[0]).percent;
    expect(store.setGoalStatus(goalId, 'paused')).toBe(true);
    expect(store.goals[0].completedAt).toBeNull();
    expect(store.setGoalStatus(goalId, 'completed')).toBe(true);
    expect(store.goals[0].completedAt).toBeTruthy();
    expect(store.goalStats(store.goals[0]).percent).toBe(current);
    expect(store.setGoalStatus(goalId, 'active')).toBe(true);
    expect(store.goals[0].completedAt).toBeNull();
  });
  it('imports a v0.15 backup without new arrays', () => {
    const store = useLifeStore();
    const old = JSON.parse(store.exportState());
    delete old.milestones;
    delete old.goalTasks;
    old.goals.forEach((goal: any) => { delete goal.status; delete goal.completedAt; });
    expect(store.importState(JSON.stringify(old))).toBe(true);
    expect(store.milestones).toHaveLength(0);
    expect(store.goalTasks).toHaveLength(0);
    expect(store.goals.every(goal => goal.status === 'active')).toBe(true);
  });
});

describe('Lifeboard v0.17.1 status transition audit trail', () => {
  it('stores real status transitions, suppresses duplicates and survives backup', () => {
    const store = useLifeStore();
    const id = store.goals[0].id;
    expect(store.goalStatusEvents).toEqual([]);
    expect(store.setGoalStatus(id, 'paused')).toBe(true);
    expect(store.setGoalStatus(id, 'paused')).toBe(true);
    expect(store.goalStatusEvents.filter(e => e.goalId === id)).toHaveLength(1);
    expect(store.setGoalStatus(id, 'completed')).toBe(true);
    expect(store.goalStatusEvents.map(e => e.status)).toEqual(['paused', 'completed']);
    const backup = store.exportState();
    store.resetState();
    expect(store.importState(backup)).toBe(true);
    expect(store.goalStatusEvents.filter(e => e.goalId === id)).toHaveLength(2);
    store.deleteGoal(id);
    expect(store.goalStatusEvents.filter(e => e.goalId === id)).toEqual([]);
  });
  it('accepts old backups and rejects status events for a different goal', () => {
    const store = useLifeStore();
    const backup = JSON.parse(store.exportState());
    delete backup.goalStatusEvents;
    expect(store.importState(JSON.stringify(backup))).toBe(true);
    expect(store.goalStatusEvents).toEqual([]);
    backup.goalStatusEvents = [{ id: 'fake', goalId: 'missing', status: 'completed', changedAt: new Date().toISOString() }];
    expect(store.importState(JSON.stringify(backup))).toBe(false);
  });
});
