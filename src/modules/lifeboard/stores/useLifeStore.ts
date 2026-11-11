import { computed, ref } from 'vue';
import { createId } from '@/shared/utils/createId';
import { defineStore } from 'pinia';
import { dateKey, getWeekStart, mondayIndex, shiftDays } from '../date';
import { getGoalProgress } from '../utils/goalProgress';
import { goalMetricHistory, validGoalMeasurement, validGoalPeriod, validMetricEntry, goalKind } from '../utils/goalMetrics';
import { defaultCheckinSchedule, pendingGoalCheckins, validCheckinRecord, validCheckinSchedule } from '../utils/goalCheckins';
import { goalStatus, isCalendarDate, validGoalTask, validMilestone, milestoneProgress, taskProgress, tasksForDay, GOAL_STATUSES } from '../utils/goalWorkflow';
import type { LifeArea, LifeAreaId, LifeGoal, LifeRoutine, LifeState, LifeNoteGroup, LifeNote, WeeklyReview, LifeQuote, QuotePlacement, GoalInput, GoalMetricEntry, GoalMeasurement, GoalCheckin, GoalCheckinSchedule, GoalCheckinStatus, GoalMilestone, GoalTask, GoalStatus, GoalStatusEvent } from '../types';
import { lifeAreas, initialState, seedNoteGroups, seedNotes, seedQuotes, defaultQuoteAssignments } from '../data/seed';
import { normalizeQuoteAssignments, collectArchivedUserQuotes, isQuotePlacement, isSystemQuoteId } from '../utils/quotes';

type CompatibleGoalInput = Omit<GoalInput, 'measurement'> & { measurement?: GoalMeasurement };
// Legacy lifeboard:state:v1 stays in localStorage solely for explicit user-approved migration.
/** Keep the v1 storage key and legacy goals fully intact; v0.15 fields are additive. */
function normalizeGoals(goals: LifeGoal[]): LifeGoal[] {
  return goals.map(goal => ({
    ...goal,
    status: goalStatus(goal),
    completedAt: goalStatus(goal) === 'completed' ? goal.completedAt ?? goal.createdAt : null,
    measurement: validGoalMeasurement(goal.measurement) ? (goal.measurement ?? { kind: 'activity' as const }) : { kind: 'activity' as const },
    startDate: validGoalPeriod(goal.startDate, goal.dueDate) ? goal.startDate : undefined,
    dueDate: validGoalPeriod(goal.startDate, goal.dueDate) ? goal.dueDate : undefined,
    checkin: goal.measurement?.kind === 'numeric' || goal.measurement?.kind === 'binary'
      ? (validCheckinSchedule(goal.checkin) ? goal.checkin : defaultCheckinSchedule())
      : undefined,
  }));
}

function normalizeEntries(raw: GoalMetricEntry[] | undefined, goals: readonly LifeGoal[]): GoalMetricEntry[] {
  if (!Array.isArray(raw)) return [];
  const ids = new Set(goals.map(goal => goal.id));
  return raw.filter(entry => validMetricEntry(entry) && ids.has(entry.goalId));
}

function normalizeCheckins(value: unknown, goals: readonly LifeGoal[]): GoalCheckin[] {
  if (!Array.isArray(value)) return [];
  const validGoals = new Set(goals.map(goal => goal.id));
  return value.filter((item: unknown): item is GoalCheckin => validCheckinRecord(item) && validGoals.has(item.goalId));
}

function normalizeMilestones(raw: unknown, goals: readonly LifeGoal[]): GoalMilestone[] {
  if (!Array.isArray(raw)) return [];
  const ids = new Set(goals.map(goal => goal.id));
  const seen = new Set<string>();
  return raw.filter((item: unknown): item is GoalMilestone => {
    if (!validMilestone(item) || !ids.has(item.goalId) || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function normalizeTasks(raw: unknown, goals: readonly LifeGoal[], milestones: readonly GoalMilestone[]): GoalTask[] {
  if (!Array.isArray(raw)) return [];
  const ids = new Set(goals.map(goal => goal.id));
  const links = new Map(milestones.map(item => [item.id, item.goalId]));
  const seen = new Set<string>();
  return raw.filter((item: unknown): item is GoalTask => {
    if (!validGoalTask(item) || !ids.has(item.goalId) || seen.has(item.id) ||
      (item.milestoneId !== null && links.get(item.milestoneId) !== item.goalId)) return false;
    seen.add(item.id);
    return true;
  });
}

function normalizeStatusEvents(value: unknown, goals: readonly LifeGoal[]): GoalStatusEvent[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set(goals.map(goal => goal.id));
  const seen = new Set<string>();
  return value.filter((entry: unknown): entry is GoalStatusEvent => {
    if (!entry || typeof entry !== 'object') return false;
    const event = entry as Partial<GoalStatusEvent>;
    if (typeof event.id !== 'string' || !event.id || seen.has(event.id) ||
      !ids.has(event.goalId ?? '') || !GOAL_STATUSES.includes(event.status as GoalStatus) ||
      typeof event.changedAt !== 'string' || Number.isNaN(Date.parse(event.changedAt))) return false;
    seen.add(event.id);
    return true;
  });
}

function emptyRemoteState(): LifeState {
  return {
    version: 1, vision: '', goals: [], routines: [], checks: {}, reviews: [],
    categories: [], focusGoalIds: [], noteGroups: [], notes: [], goalMetricEntries: [],
    goalCheckins: [], milestones: [], goalTasks: [], goalStatusEvents: [],
    quotes: seedQuotes.map(q => ({ ...q, text: { ...q.text }, author: { ...q.author }, sourceTitle: { ...q.sourceTitle } })),
    quoteAssignments: { ...defaultQuoteAssignments },
  };
}

export const useLifeStore = defineStore('lifeboard', () => {
  const state = ref<LifeState>(emptyRemoteState());

  /** Guard against an oversized optimistic snapshot; only backend persists data. */
  function canPersist(nextState: LifeState): boolean {
    try { return JSON.stringify(nextState).length < 32_000_000; }
    catch { return false; }
  }
  const goals = computed(() => state.value.goals);
  const goalMetricEntries = computed(() => state.value.goalMetricEntries ?? []);
  const goalCheckins = computed(() => state.value.goalCheckins ?? []);
  const milestones = computed(() => state.value.milestones ?? []);
  const goalTasks = computed(() => state.value.goalTasks ?? []);
  const goalStatusEvents = computed(() => state.value.goalStatusEvents ?? []);
  const routines = computed(() => state.value.routines);
  const reviews = computed(() => state.value.reviews);
  const vision = computed(() => state.value.vision);
  const categories = computed(() => [...lifeAreas, ...(state.value.categories ?? [])]);
  const noteGroups = computed(() => state.value.noteGroups ?? []);
  const notes = computed(() => state.value.notes ?? []);
  const quotes = computed(() => state.value.quotes ?? []);
  const quoteAssignments = computed(() => state.value.quoteAssignments ?? { ...defaultQuoteAssignments });

  function getArea(id: LifeAreaId): LifeArea {
    return categories.value.find((area) => area.id === id) ?? lifeAreas[lifeAreas.length - 1];
  }

  function getAreaName(id: LifeAreaId, locale: string = 'ru-RU'): string {
    const localized: Record<string, Record<string, string>> = {
      en: { dogs: 'Dogs', career: 'Development', leadership: 'Leadership', health: 'Health', finance: 'Finances', relationships: 'Relationships', learning: 'Languages', other: 'Other' },
      de: { dogs: 'Hunde', career: 'Entwicklung', leadership: 'Führung', health: 'Gesundheit', finance: 'Finanzen', relationships: 'Beziehungen', learning: 'Sprachen', other: 'Sonstiges' },
    };
    const key = locale.slice(0, 2);
    return localized[key]?.[id] ?? getArea(id).name;
  }

  function addCategory(name: string, accent = '#5b9478') {
    const title = name.trim();
    if (title.length < 2 || title.length > 35) return false;
    if (categories.value.some((a) => a.name.toLocaleLowerCase() === title.toLocaleLowerCase())) return false;
    const hex = /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#5b9478';
    state.value.categories ??= [];
    state.value.categories.push({ id: createId(), name: title, icon: 'bi-grid', accent: hex, subtle: '#edf5ee' });
    return true;
  }

  function deleteCategory(id: string): boolean {
    if (lifeAreas.some(a => a.id === id) || goals.value.some(g => g.areaId === id)) return false;
    state.value.categories = (state.value.categories ?? []).filter(a => a.id !== id);
    return true;
  }

  function canSetParent(goalId: string, parentId: string | null): boolean {
    if (!parentId) return true;
    if (goalId === parentId) return false;
    const visited = new Set<string>([goalId]);
    let current: string | null | undefined = parentId;
    while (current) {
      if (visited.has(current)) return false;
      visited.add(current);
      current = goals.value.find(g => g.id === current)?.parentId;
    }
    return goals.value.some(g => g.id === parentId);
  }

  function setGoalParent(goalId: string, parentId: string | null): boolean {
    const goal = goals.value.find(g => g.id === goalId);
    if (!goal || !canSetParent(goalId, parentId)) return false;
    goal.parentId = parentId;
    return true;
  }

  function goalAncestors(goalId: string): LifeGoal[] {
    const chain: LifeGoal[] = [];
    let current = goals.value.find(g => g.id === goalId);
    const seen = new Set<string>();
    while (current?.parentId && !seen.has(current.parentId)) {
      seen.add(current.parentId);
      const parent = goals.value.find(g => g.id === current!.parentId);
      if (!parent) break;
      chain.unshift(parent);
      current = parent;
    }
    return chain;
  }

  function matches(routine: LifeRoutine, date: Date): boolean {
    return routine.days.includes(mondayIndex(date));
  }

  function dayTasks(date: Date): LifeRoutine[] {
    return state.value.routines.filter((routine) => matches(routine, date)).sort((a, b) => a.time.localeCompare(b.time));
  }

  function isDone(routineId: string, date: Date): boolean {
    return state.value.checks[`${dateKey(date)}|${routineId}`] === true;
  }

  function setDone(routineId: string, date: Date, value: boolean) {
    if (!state.value.routines.some((routine) => routine.id === routineId)) return;
    const key = `${dateKey(date)}|${routineId}`;
    if (value) state.value.checks[key] = true;
    else delete state.value.checks[key];
  }

  function taskStats(date: Date) {
    const daily = dayTasks(date);
    const done = daily.filter((task) => isDone(task.id, date)).length;
    return { done, total: daily.length, percent: daily.length ? Math.round((done / daily.length) * 100) : 0 };
  }

  function weekDays(date: Date): Date[] {
    const monday = getWeekStart(date);
    return Array.from({ length: 7 }, (_, index) => shiftDays(monday, index));
  }

  function weekStats(date: Date) {
    return weekDays(date).reduce((all, day) => {
      const stats = taskStats(day);
      all.done += stats.done;
      all.total += stats.total;
      return all;
    }, { done: 0, total: 0 });
  }

  function goalStats(goal: LifeGoal, date: Date = new Date()) {
    return getGoalProgress(goal, state.value.routines, state.value.checks, date, goalMetricEntries.value);
  }


  function validGoalInput(data: CompatibleGoalInput): boolean {
    return !!data && data.title.trim().length >= 2 && data.title.trim().length <= 90 &&
      Number.isInteger(data.target) && data.target >= 1 && data.target <= 10000 &&
      validGoalMeasurement(data.measurement) && validGoalPeriod(data.startDate, data.dueDate) &&
      (data.checkin === undefined || validCheckinSchedule(data.checkin));
  }

  function updateGoal(id: string, data: CompatibleGoalInput): boolean {
    const goal = goals.value.find(item => item.id === id);
    if (!goal || !validGoalInput(data)) return false;
    const parentId = data.parentId && goals.value.some(g => g.id === data.parentId) ? data.parentId : null;
    if (!canSetParent(id, parentId)) return false;
    const nextMeasurement = data.measurement ?? goal.measurement ?? { kind: 'activity' as const };
    const measurementChanged = goalKind(goal.measurement) !== goalKind(nextMeasurement);
    // A change of measurement type invalidates its old observation and check-in history.
    if (measurementChanged) {
      state.value.goalMetricEntries = goalMetricEntries.value.filter(entry => entry.goalId !== id);
      state.value.goalCheckins = goalCheckins.value.filter(item => item.goalId !== id);
    }
    const previousCheckin = goal.checkin;
    const requestedCheckin = data.checkin;
    const scheduleChanged = !!previousCheckin && !!requestedCheckin &&
      (previousCheckin.frequency !== requestedCheckin.frequency || previousCheckin.weekday !== requestedCheckin.weekday);
    const nextCheckin: GoalCheckinSchedule | undefined = nextMeasurement.kind === 'activity' ? undefined
      : requestedCheckin ? {
          ...requestedCheckin,
          fromDate: measurementChanged || scheduleChanged ? dateKey(new Date()) : requestedCheckin.fromDate,
        }
        : previousCheckin && !measurementChanged ? previousCheckin : defaultCheckinSchedule();
    Object.assign(goal, {
      areaId: data.areaId,
      title: data.title.trim(),
      description: data.description.trim(),
      horizon: data.horizon,
      target: data.target,
      startDate: data.startDate || undefined,
      dueDate: data.dueDate || undefined,
      measurement: nextMeasurement.kind === 'numeric'
        ? { ...nextMeasurement, unit: nextMeasurement.unit.trim() }
        : { ...nextMeasurement },
      checkin: nextCheckin,
      parentId,
    });
    return true;
  }

  function addGoal(data: CompatibleGoalInput): string | null {
    if (!validGoalInput(data)) return null;
    const parentId = data.parentId && goals.value.some(g => g.id === data.parentId) ? data.parentId : null;
    const id = createId();
    const measurement = data.measurement ?? { kind: 'activity' as const };
    const checkin = measurement.kind === 'activity' ? undefined : data.checkin ?? defaultCheckinSchedule();
    state.value.goals.push({ ...data, parentId, measurement: { ...measurement }, checkin, title: data.title.trim(), status: 'active', completedAt: null, id, createdAt: new Date().toISOString() });
    return id;
  }

  /** Append-only history. Backdating a measurement does not overwrite a later value. */
  function recordGoalMetric(goalId: string, value: number, date: string, note = ''): string | null {
    const goal = goals.value.find(item => item.id === goalId);
    if (!goal || !goal.measurement || goal.measurement.kind === 'activity') return null;
    if (!Number.isFinite(value) || Math.abs(value) > 1_000_000_000_000 ||
        (goal.measurement.kind === 'binary' && value !== 0 && value !== 1) ||
        note.length > 300 || !validMetricEntry({ id: 'check', goalId, value, date, note, createdAt: new Date().toISOString() })) return null;
    if (goal.startDate && date < goal.startDate) return null;
    // Future readings should not silently change today's progress.
    if (date > dateKey(new Date())) return null;
    const id = createId();
    const entry: GoalMetricEntry = { id, goalId, date, value, note: note.trim(), createdAt: new Date().toISOString() };
    const next = [...goalMetricEntries.value, entry];
    if (!canPersist({ ...state.value, goalMetricEntries: next })) return null;
    state.value.goalMetricEntries = next;
    return id;
  }

  function deleteGoalMetric(entryId: string): boolean {
    if (!goalMetricEntries.value.some(entry => entry.id === entryId)) return false;
    state.value.goalMetricEntries = goalMetricEntries.value.filter(entry => entry.id !== entryId);
    state.value.goalCheckins = goalCheckins.value.map(entry =>
      entry.metricEntryId === entryId ? { ...entry, metricEntryId: undefined } : entry);
    return true;
  }

  function goalHistory(goalId: string): GoalMetricEntry[] {
    return goalMetricHistory(goalId, goalMetricEntries.value);
  }

  function dueGoalCheckins(at: Date = new Date()) {
    return pendingGoalCheckins(goals.value.filter(goal => goalStatus(goal) === 'active'), goalCheckins.value, goalMetricEntries.value, at);
  }

  /** Saves a check-in independently of the outcome. A new metric reading is optional. */
  function completeGoalCheckin(
    goalId: string,
    dueDate: string,
    status: GoalCheckinStatus,
    value?: number,
    note = '',
  ): boolean {
    const now = new Date();
    const pending = dueGoalCheckins(now).find(item => item.goal.id === goalId && item.dueDate === dueDate);
    if (!pending || note.length > 300) return false;
    const measurement = pending.goal.measurement;
    if (!measurement || measurement.kind === 'activity') return false;
    if (status !== 'updated' && status !== 'unchanged' && status !== 'skipped') return false;
    if (status === 'updated' && (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 1_000_000_000_000 ||
      (measurement.kind === 'binary' && value !== 1))) return false;

    const completedAt = now.toISOString();
    const checkin: GoalCheckin = { id: createId(), goalId, dueDate, status, completedAt };
    const updatedMetrics = [...goalMetricEntries.value];
    if (status === 'updated' && typeof value === 'number') {
      const entry: GoalMetricEntry = { id: createId(), goalId, date: dateKey(now), value, note: note.trim(), createdAt: completedAt };
      if (!validMetricEntry(entry) || (pending.goal.startDate && entry.date < pending.goal.startDate)) return false;
      updatedMetrics.push(entry);
      checkin.metricEntryId = entry.id;
    }
    const next: LifeState = {
      ...state.value,
      goalMetricEntries: updatedMetrics,
      goalCheckins: [...goalCheckins.value, checkin],
    };
    if (!canPersist(next)) return false;
    state.value.goalMetricEntries = updatedMetrics;
    state.value.goalCheckins = next.goalCheckins;
    return true;
  }

  function setGoalStatus(goalId: string, status: GoalStatus): boolean {
    const goal = goals.value.find(item => item.id === goalId);
    if (!goal || !GOAL_STATUSES.includes(status)) return false;
    if (goalStatus(goal) === status) return true;
    const now = new Date().toISOString();
    const event: GoalStatusEvent = { id: createId(), goalId, status, changedAt: now };
    if (!canPersist({ ...state.value, goalStatusEvents: [...goalStatusEvents.value, event] })) return false;
    goal.status = status;
    goal.completedAt = status === 'completed' ? now : null;
    state.value.goalStatusEvents = [...goalStatusEvents.value, event];
    return true;
  }

  function goalMilestones(goalId: string): GoalMilestone[] {
    return milestones.value.filter(item => item.goalId === goalId).sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
  }
  function goalOneTimeTasks(goalId: string): GoalTask[] {
    return goalTasks.value.filter(item => item.goalId === goalId).sort((a, b) =>
      (a.completedAt ? 1 : 0) - (b.completedAt ? 1 : 0) || (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31'));
  }
  function milestoneStats(goalId: string) { return milestoneProgress(goalId, milestones.value); }
  function oneTimeTaskStats(goalId: string) { return taskProgress(goalId, goalTasks.value); }

  function addMilestone(goalId: string, input: { title: string; description?: string; dueDate?: string }): string | null {
    if (!goals.value.some(goal => goal.id === goalId)) return null;
    const order = goalMilestones(goalId).length;
    const item: GoalMilestone = { id: createId(), goalId, title: input.title.trim(), description: input.description?.trim() ?? '',
      dueDate: input.dueDate || undefined, order, createdAt: new Date().toISOString(), completedAt: null };
    if (!validMilestone(item) || !canPersist({ ...state.value, milestones: [...milestones.value, item] })) return null;
    state.value.milestones = [...milestones.value, item];
    return item.id;
  }
  function updateMilestone(id: string, input: { title: string; description?: string; dueDate?: string }): boolean {
    const old = milestones.value.find(item => item.id === id);
    if (!old) return false;
    const next = { ...old, title: input.title.trim(), description: input.description?.trim() ?? '', dueDate: input.dueDate || undefined };
    if (!validMilestone(next)) return false;
    state.value.milestones = milestones.value.map(item => item.id === id ? next : item);
    return true;
  }
  function toggleMilestone(id: string): boolean {
    const item = milestones.value.find(item => item.id === id);
    if (!item) return false;
    item.completedAt = item.completedAt ? null : new Date().toISOString();
    return true;
  }
  function deleteMilestone(id: string): boolean {
    if (!milestones.value.some(item => item.id === id)) return false;
    state.value.milestones = milestones.value.filter(item => item.id !== id);
    // Preserve every one-time task, but remove the now-invalid milestone association.
    state.value.goalTasks = goalTasks.value.map(item => item.milestoneId === id ? { ...item, milestoneId: null } : item);
    return true;
  }

  function addGoalTask(goalId: string, input: { title: string; description?: string; dueDate?: string; milestoneId?: string | null }): string | null {
    if (!goals.value.some(goal => goal.id === goalId) ||
      (input.milestoneId && !milestones.value.some(item => item.id === input.milestoneId && item.goalId === goalId))) return null;
    const item: GoalTask = { id: createId(), goalId, milestoneId: input.milestoneId || null,
      title: input.title.trim(), description: input.description?.trim() ?? '', dueDate: input.dueDate || undefined,
      completedAt: null, createdAt: new Date().toISOString() };
    if (!validGoalTask(item) || !canPersist({ ...state.value, goalTasks: [...goalTasks.value, item] })) return null;
    state.value.goalTasks = [...goalTasks.value, item];
    return item.id;
  }
  function updateGoalTask(id: string, input: { title: string; description?: string; dueDate?: string; milestoneId?: string | null }): boolean {
    const old = goalTasks.value.find(item => item.id === id);
    if (!old || (input.milestoneId && !milestones.value.some(item => item.id === input.milestoneId && item.goalId === old.goalId))) return false;
    const next = { ...old, title: input.title.trim(), description: input.description?.trim() ?? '', dueDate: input.dueDate || undefined,
      milestoneId: input.milestoneId || null };
    if (!validGoalTask(next)) return false;
    state.value.goalTasks = goalTasks.value.map(item => item.id === id ? next : item);
    return true;
  }
  function toggleGoalTask(id: string): boolean {
    const item = goalTasks.value.find(task => task.id === id);
    if (!item) return false;
    item.completedAt = item.completedAt ? null : new Date().toISOString();
    return true;
  }
  function deleteGoalTask(id: string): boolean {
    if (!goalTasks.value.some(item => item.id === id)) return false;
    state.value.goalTasks = goalTasks.value.filter(item => item.id !== id);
    return true;
  }
  function goalTasksOnDay(date: Date): GoalTask[] {
    return tasksForDay(goalTasks.value.filter(task => {
      const goal = goals.value.find(item => item.id === task.goalId);
      return goal && (goalStatus(goal) === 'active' || !!task.completedAt);
    }), dateKey(date), dateKey(new Date()));
  }

  function deleteGoal(id: string) {
    state.value.goalStatusEvents = goalStatusEvents.value.filter(item => item.goalId !== id);
    state.value.milestones = milestones.value.filter(item => item.goalId !== id);
    state.value.goalTasks = goalTasks.value.filter(item => item.goalId !== id);
    state.value.goalCheckins = goalCheckins.value.filter(item => item.goalId !== id);
    state.value.goalMetricEntries = goalMetricEntries.value.filter(entry => entry.goalId !== id);
    const routineIds = state.value.routines.filter((routine) => routine.goalId === id).map((routine) => routine.id);
    state.value.goals = state.value.goals.filter((goal) => goal.id !== id);
    // Preserve notes and groups even when their goal is deleted.
    (state.value.noteGroups ?? []).forEach(group => { if (group.goalId === id) group.goalId = null; });
    (state.value.notes ?? []).forEach(note => { if (note.goalId === id) note.goalId = null; });
    state.value.focusGoalIds = (state.value.focusGoalIds ?? []).filter(focusId => focusId !== id);
    state.value.goals.forEach((goal) => { if (goal.parentId === id) goal.parentId = null; });
    state.value.routines = state.value.routines.filter((routine) => routine.goalId !== id);
    for (const key of Object.keys(state.value.checks)) {
      if (routineIds.some((routineId) => key.endsWith(`|${routineId}`))) delete state.value.checks[key];
    }
  }

  function addRoutine(data: Omit<LifeRoutine, 'id'>) {
    if (!state.value.goals.some((goal) => goal.id === data.goalId)) return;
    state.value.routines.push({ ...data, id: createId() });
  }

  function deleteRoutine(id: string) {
    state.value.routines = state.value.routines.filter((routine) => routine.id !== id);
    for (const key of Object.keys(state.value.checks)) {
      if (key.endsWith(`|${id}`)) delete state.value.checks[key];
    }
  }

  function saveReview(weekDate: Date, input: Pick<WeeklyReview, 'wins' | 'obstacles' | 'nextStep' | 'mood'>) {
    const weekStart = dateKey(getWeekStart(weekDate));
    const next: WeeklyReview = { ...input, weekStart, updatedAt: new Date().toISOString() };
    const index = state.value.reviews.findIndex((review) => review.weekStart === weekStart);
    if (index >= 0) state.value.reviews[index] = next;
    else state.value.reviews.push(next);
  }

  function getReview(date: Date): WeeklyReview | undefined {
    return state.value.reviews.find((review) => review.weekStart === dateKey(getWeekStart(date)));
  }

  function setVision(value: string) { state.value.vision = value.trim(); }

  /** Server-owned snapshot; never read or write private user data from browser localStorage. */
  function replaceRemoteSnapshot(snapshot: LifeState): void {
    if (snapshot.version !== 1 || !Array.isArray(snapshot.goals) ||
        !Array.isArray(snapshot.routines) || !Array.isArray(snapshot.reviews)) {
      throw new Error('Unsupported backend state snapshot');
    }
    const milestones = normalizeMilestones(snapshot.milestones, snapshot.goals);
    state.value = {
      ...emptyRemoteState(), ...snapshot,
      goals: normalizeGoals(snapshot.goals),
      milestones,
      goalTasks: normalizeTasks(snapshot.goalTasks, snapshot.goals, milestones),
      goalMetricEntries: normalizeEntries(snapshot.goalMetricEntries, snapshot.goals),
      goalCheckins: normalizeCheckins(snapshot.goalCheckins, snapshot.goals),
      goalStatusEvents: normalizeStatusEvents(snapshot.goalStatusEvents, snapshot.goals),
      quoteAssignments: normalizeQuoteAssignments(snapshot.quoteAssignments),
    };
  }

  function resetState() { state.value = { version: 1, vision: '', goals: [], routines: [], checks: {}, reviews: [], categories: [], focusGoalIds: [], noteGroups: [], notes: [], goalMetricEntries: [], goalCheckins: [], milestones: [], goalTasks: [], goalStatusEvents: [], quotes: seedQuotes.map((quote) => ({ ...quote, text: { ...quote.text } })), quoteAssignments: { ...defaultQuoteAssignments } }; }

  function exportState(): string { return JSON.stringify(state.value, null, 2); }

  function importState(json: string): boolean {
    try {
      const parsed: unknown = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object') return false;
      const next = parsed as Partial<LifeState>;
      if (next.version !== 1 || !Array.isArray(next.goals) || !Array.isArray(next.routines) || !Array.isArray(next.reviews) || !next.checks || typeof next.checks !== 'object' || typeof next.vision !== 'string') return false;
      if (!next.goals.every((g) => typeof g.id === 'string' && typeof g.title === 'string' && Number.isFinite(g.target)) || !next.routines.every((r) => typeof r.id === 'string' && Array.isArray(r.days) && typeof r.goalId === 'string')) return false;
      const ids = new Set(next.goals.map(g => g.id));
      if (!next.goals.every(g => typeof g.areaId === 'string' && (!g.parentId || ids.has(g.parentId)))) return false;
      if (next.categories && (!Array.isArray(next.categories) || !next.categories.every(c => typeof c.id === 'string' && typeof c.name === 'string'))) return false;
      if (next.noteGroups && (!Array.isArray(next.noteGroups) || !next.noteGroups.every(g =>
        g && typeof g.id === 'string' && typeof g.name === 'string' && typeof g.color === 'string' &&
        (g.goalId == null || typeof g.goalId === 'string')))) return false;
      if (next.notes && (!Array.isArray(next.notes) || !next.notes.every(n =>
        n && typeof n.id === 'string' && typeof n.title === 'string' && typeof n.content === 'string' &&
        (n.groupId == null || typeof n.groupId === 'string') && (n.goalId == null || typeof n.goalId === 'string') &&
        (n.imageDataUrl == null || (typeof n.imageDataUrl === 'string' && n.imageDataUrl.length <= 450000 && /^data:image\/(?:jpeg|png|webp);base64,/.test(n.imageDataUrl)))))) return false;
      if (next.goals.some(g => !validGoalMeasurement(g.measurement) || !validGoalPeriod(g.startDate, g.dueDate))) return false;
      if (next.goalMetricEntries && (!Array.isArray(next.goalMetricEntries) ||
        !next.goalMetricEntries.every(entry => validMetricEntry(entry) && ids.has(entry.goalId)))) return false;
      if (next.goals.some(goal => goal.checkin !== undefined && !validCheckinSchedule(goal.checkin))) return false;
      if (next.goalCheckins && (!Array.isArray(next.goalCheckins) ||
        !next.goalCheckins.every(item => validCheckinRecord(item) && ids.has(item.goalId)) ||
        new Set(next.goalCheckins.map(item => `${item.goalId}|${item.dueDate}`)).size !== next.goalCheckins.length)) return false;
      const importedMilestones = normalizeMilestones(next.milestones, next.goals);
      const importedTasks = normalizeTasks(next.goalTasks, next.goals, importedMilestones);
      if (next.goals.some(goal => goal.status !== undefined && !GOAL_STATUSES.includes(goal.status))) return false;
      if (next.milestones !== undefined && (!Array.isArray(next.milestones) || importedMilestones.length !== next.milestones.length)) return false;
      if (next.goalTasks !== undefined && (!Array.isArray(next.goalTasks) || importedTasks.length !== next.goalTasks.length)) return false;
      if (next.goalStatusEvents !== undefined && (!Array.isArray(next.goalStatusEvents) ||
        normalizeStatusEvents(next.goalStatusEvents, next.goals).length !== next.goalStatusEvents.length)) return false;
      // Avoid importing unreasonably large backups into browser storage.
      if (json.length > 4500000) return false;
      const imported = {
        ...next,
        goals: normalizeGoals(next.goals),
        milestones: importedMilestones,
        goalTasks: importedTasks,
        goalStatusEvents: normalizeStatusEvents(next.goalStatusEvents, next.goals),
        goalMetricEntries: normalizeEntries(next.goalMetricEntries, next.goals),
        goalCheckins: normalizeCheckins(next.goalCheckins, next.goals),
        noteGroups: Array.isArray(next.noteGroups) ? next.noteGroups : [],
        notes: Array.isArray(next.notes) ? next.notes : [],
        quotes: seedQuotes.map(quote => ({ ...quote, text: { ...quote.text }, author: { ...quote.author }, sourceTitle: { ...quote.sourceTitle } })),
        quoteAssignments: normalizeQuoteAssignments(next.quoteAssignments),
        archivedUserQuotes: collectArchivedUserQuotes(next),
        categories: Array.isArray(next.categories) ? next.categories : [],
        focusGoalIds: Array.isArray(next.focusGoalIds)
          ? Array.from(new Set(next.focusGoalIds.filter((id): id is string => typeof id === 'string' && ids.has(id)))).slice(0, 3)
          : next.goals.filter(g => g.horizon === 'month').slice(0, 3).map(g => g.id),
      } as LifeState;
      if (!canPersist(imported)) return false;
      state.value = imported;
      return true;
    } catch { return false; }
  }

  function addNoteGroup(input: { name: string; goalId: string | null; color: string }): string | null {
    const name = input.name.trim();
    if (name.length < 2 || name.length > 55 || noteGroups.value.some(g => g.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return null;
    if (input.goalId && !goals.value.some(g => g.id === input.goalId)) return null;
    const group: LifeNoteGroup = {
      id: createId(), name, goalId: input.goalId,
      color: /^#[0-9a-f]{6}$/i.test(input.color) ? input.color : '#a9bca3',
      createdAt: new Date().toISOString(),
    };
    state.value.noteGroups ??= [];
    state.value.noteGroups.push(group);
    return group.id;
  }

  function updateNoteGroup(id: string, input: { name: string; goalId: string | null; color: string }): boolean {
    const group = noteGroups.value.find(g => g.id === id);
    const name = input.name.trim();
    if (!group || name.length < 2 || name.length > 55 || noteGroups.value.some(g => g.id !== id && g.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return false;
    if (input.goalId && !goals.value.some(g => g.id === input.goalId)) return false;
    Object.assign(group, { name, goalId: input.goalId, color: /^#[0-9a-f]{6}$/i.test(input.color) ? input.color : group.color });
    return true;
  }

  function deleteNoteGroup(id: string): boolean {
    if (!noteGroups.value.some(g => g.id === id)) return false;
    state.value.noteGroups = noteGroups.value.filter(g => g.id !== id);
    // Cards remain on the board as ungrouped notes.
    notes.value.forEach(note => { if (note.groupId === id) note.groupId = null; });
    return true;
  }

  type NotePayload = Pick<LifeNote, 'title' | 'content' | 'groupId' | 'goalId' | 'imageDataUrl' | 'pinned'>;
  function validNoteInput(input: NotePayload): boolean {
    return input.title.trim().length >= 1 && input.title.trim().length <= 100 && input.content.length <= 12000 &&
      (!input.groupId || noteGroups.value.some(g => g.id === input.groupId)) &&
      (!input.goalId || goals.value.some(g => g.id === input.goalId)) &&
      (!input.imageDataUrl || (input.imageDataUrl.length <= 450000 && /^data:image\/(?:jpeg|png|webp);base64,/.test(input.imageDataUrl)));
  }

  function addNote(input: NotePayload): string | null {
    if (!validNoteInput(input)) return null;
    const now = new Date().toISOString();
    const note: LifeNote = { ...input, title: input.title.trim(), id: createId(), createdAt: now, updatedAt: now };
    const nextNotes = [...notes.value, note];
    if (!canPersist({ ...state.value, notes: nextNotes })) return null;
    state.value.notes = nextNotes;
    return note.id;
  }

  function updateNote(id: string, input: NotePayload): boolean {
    const note = notes.value.find(n => n.id === id);
    if (!note || !validNoteInput(input)) return false;
    const updated = { ...note, ...input, title: input.title.trim(), updatedAt: new Date().toISOString() };
    const nextNotes = notes.value.map(n => n.id === id ? updated : n);
    if (!canPersist({ ...state.value, notes: nextNotes })) return false;
    state.value.notes = nextNotes;
    return true;
  }

  /** Opt-in example content for existing accounts; never overwrites user records. */
  function addDemoContent(): { goals: number; notes: number } | null {
    const examples = initialState();
    const existingGoalIds = new Set(goals.value.map(goal => goal.id));
    const missingGoals = examples.goals.filter(goal => !existingGoalIds.has(goal.id));
    const mergedGoals = [...goals.value, ...missingGoals];
    const existingGroupIds = new Set(noteGroups.value.map(group => group.id));
    const groups = [...noteGroups.value, ...seedNoteGroups.filter(group => !existingGroupIds.has(group.id))];
    const existingNoteIds = new Set(notes.value.map(note => note.id));
    const missingNotes = seedNotes.filter(note => !existingNoteIds.has(note.id));
    const imported = { ...state.value, goals:mergedGoals, noteGroups:groups, notes:[...notes.value, ...missingNotes] };
    if (!canPersist(imported)) return null;
    state.value = imported;
    return { goals:missingGoals.length, notes:missingNotes.length };
  }

  function deleteNote(id: string): boolean {
    if (!notes.value.some(n => n.id === id)) return false;
    state.value.notes = notes.value.filter(n => n.id !== id);
    return true;
  }

  function quoteFor(placement: QuotePlacement): LifeQuote | undefined {
    const quoteId = quoteAssignments.value[placement];
    if (!quoteId) return undefined;
    return quotes.value.find((quote) => quote.id === quoteId);
  }

  /** Users can place curated quotes, but cannot create or edit the catalog. */
  function assignQuote(placement: QuotePlacement, quoteId: string | null): boolean {
    if (!isQuotePlacement(placement)) return false;
    if (quoteId !== null && !isSystemQuoteId(quoteId)) return false;
    const assignments = { ...quoteAssignments.value };
    if (quoteId === null) delete assignments[placement];
    else assignments[placement] = quoteId;
    state.value.quoteAssignments = assignments;
    return true;
  }

  const today = computed(() => new Date());
  const focusGoals = computed(() => {
    const ids = state.value.focusGoalIds ?? [];
    return ids.map(id => state.value.goals.find(goal => goal.id === id)).filter((g): g is LifeGoal => !!g);
  });

  function toggleFocus(goalId: string): boolean {
    if (!goals.value.some(goal => goal.id === goalId)) return false;
    const ids = state.value.focusGoalIds ?? [];
    if (ids.includes(goalId)) {
      state.value.focusGoalIds = ids.filter(id => id !== goalId);
      return true;
    }
    if (ids.length >= 3) return false;
    state.value.focusGoalIds = [...ids, goalId];
    return true;
  }

  function isFocus(goalId: string): boolean { return (state.value.focusGoalIds ?? []).includes(goalId); }
  return {
    replaceRemoteSnapshot, goals, goalMetricEntries, goalCheckins, milestones, goalTasks, goalStatusEvents, routines, reviews, vision, today, focusGoals, categories, noteGroups, notes, quotes, quoteAssignments, toggleFocus, isFocus,
    getArea, getAreaName, addCategory, deleteCategory, canSetParent, setGoalParent, goalAncestors, setGoalStatus, goalMilestones, goalOneTimeTasks, milestoneStats, oneTimeTaskStats, addMilestone, updateMilestone, toggleMilestone, deleteMilestone, addGoalTask, updateGoalTask, toggleGoalTask, deleteGoalTask, goalTasksOnDay, resetState, dayTasks, isDone, setDone, taskStats, weekDays, weekStats, goalStats,
    addGoal, updateGoal, deleteGoal, recordGoalMetric, deleteGoalMetric, goalHistory, dueGoalCheckins, completeGoalCheckin, addRoutine, deleteRoutine, saveReview, getReview, setVision,
    exportState, importState, addDemoContent, addNoteGroup, updateNoteGroup, deleteNoteGroup, addNote, updateNote, deleteNote, quoteFor, assignQuote,
  };
});
