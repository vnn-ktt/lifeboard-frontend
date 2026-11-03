import { computed, ref, watch } from 'vue';
import { createId } from '@/shared/utils/createId';
import { defineStore } from 'pinia';
import { dateKey, getWeekStart, mondayIndex, shiftDays } from '../date';
import { getGoalProgress } from '../utils/goalProgress';
import type { Horizon, LifeArea, LifeAreaId, LifeGoal, LifeRoutine, LifeState, LifeNoteGroup, LifeNote, WeeklyReview, LifeQuote, QuotePlacement, ArchivedUserQuote } from '../types';
import { lifeAreas, initialState, seedNoteGroups, seedNotes, seedQuotes, defaultQuoteAssignments } from '../data/seed';

const STORAGE_KEY = 'lifeboard:state:v1';
const QUOTE_PLACEMENTS: readonly QuotePlacement[] = ['dashboard', 'review'];
const systemQuoteIds = new Set(seedQuotes.map((quote) => quote.id));
function normalizeQuoteAssignments(source: unknown): Partial<Record<QuotePlacement, string>> {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return { ...defaultQuoteAssignments };
  const raw = source as Record<string, unknown>;
  const selected: Partial<Record<QuotePlacement, string>> = {};
  for (const placement of QUOTE_PLACEMENTS) {
    if (typeof raw[placement] === 'string' && systemQuoteIds.has(raw[placement] as string)) {
      selected[placement] = raw[placement] as string;
    }
  }
  return selected;
}

function collectArchivedUserQuotes(input: unknown): ArchivedUserQuote[] {
  if (!input || typeof input !== 'object') return [];
  const state = input as Record<string, unknown>;
  const existing = Array.isArray(state.archivedUserQuotes) ? state.archivedUserQuotes : [];
  const fromOld = Array.isArray(state.quotes) ? state.quotes.filter((item: unknown) =>
    Boolean(item && typeof item === 'object' && (item as { createdBy?: unknown }).createdBy === 'user')) : [];
  const unique = new Map<string, ArchivedUserQuote>();
  for (const unknownQuote of [...existing, ...fromOld]) {
    if (!unknownQuote || typeof unknownQuote !== 'object') continue;
    const quote = unknownQuote as Record<string, unknown>;
    const text = quote.text;
    if (typeof quote.id !== 'string' || typeof quote.author !== 'string' ||
      !text || typeof text !== 'object' ||
      !['ru', 'en', 'de'].every((key) => typeof (text as Record<string, unknown>)[key] === 'string')) continue;
    const normalized = { id: quote.id, author: quote.author, text: text as ArchivedUserQuote['text'] };
    unique.set(quote.id, normalized);
  }
  return [...unique.values()];
}

function restore(): LifeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return initialState();
    const state = parsed as Partial<LifeState>;
    if (state.version !== 1 || !Array.isArray(state.goals) || !Array.isArray(state.routines) || !state.checks || !Array.isArray(state.reviews)) return initialState();
    return { version: 1, vision: typeof state.vision === 'string' ? state.vision : '', goals: state.goals, routines: state.routines, checks: state.checks, reviews: state.reviews, categories: Array.isArray(state.categories) ? state.categories : [],
      noteGroups: Array.isArray(state.noteGroups) ? state.noteGroups.filter((g: LifeNoteGroup) => !!g && typeof g.id === 'string' && typeof g.name === 'string') : [],
      notes: Array.isArray(state.notes) ? state.notes.filter((n: LifeNote) => !!n && typeof n.id === 'string' && typeof n.title === 'string' && typeof n.content === 'string') : [],
      quotes: seedQuotes.map(quote => ({ ...quote, text: { ...quote.text }, author: { ...quote.author }, sourceTitle: { ...quote.sourceTitle } })),
      quoteAssignments: normalizeQuoteAssignments(state.quoteAssignments),
      archivedUserQuotes: collectArchivedUserQuotes(state),
      focusGoalIds: Array.isArray(state.focusGoalIds)
        ? Array.from(new Set(state.focusGoalIds.filter((id): id is string => typeof id === 'string' && state.goals!.some(g => g.id === id)))).slice(0, 3)
        : state.goals.filter(g => g.horizon === 'month').slice(0, 3).map(g => g.id),
    };
  } catch {
    return initialState();
  }
}

export const useLifeStore = defineStore('lifeboard', () => {
  const state = ref<LifeState>(restore());
  // Handle browser quota errors without letting a reactive watcher crash the UI.
  watch(state, (newState) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newState)); }
    catch { /* Note mutations check capacity first; other changes remain in memory. */ }
  }, { deep: true });

  /** Preflight the full snapshot so image uploads cannot silently exceed localStorage. */
  function canPersist(nextState: LifeState): boolean {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState)); return true; }
    catch { return false; }
  }
  const goals = computed(() => state.value.goals);
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
    return getGoalProgress(goal, state.value.routines, state.value.checks, date);
  }


  function updateGoal(id: string, data: { areaId: LifeAreaId; title: string; description: string; horizon: Horizon; target: number; parentId?: string | null }) {
    const goal = goals.value.find(item => item.id === id);
    if (!goal) return false;
    const parentId = data.parentId && goals.value.some(g => g.id === data.parentId) ? data.parentId : null;
    if (!canSetParent(id, parentId)) return false;
    Object.assign(goal, {
      areaId: data.areaId,
      title: data.title.trim(),
      description: data.description.trim(),
      horizon: data.horizon,
      target: data.target,
      parentId,
    });
    return true;
  }

  function addGoal(data: { areaId: LifeAreaId; title: string; description: string; horizon: Horizon; target: number; parentId?: string | null }) {
    const parentId = data.parentId && goals.value.some(g => g.id === data.parentId) ? data.parentId : null;
    const id = createId();
    state.value.goals.push({ ...data, parentId, title: data.title.trim(), id, createdAt: new Date().toISOString() });
    return id;
  }

  function deleteGoal(id: string) {
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

  function resetState() { state.value = { version: 1, vision: '', goals: [], routines: [], checks: {}, reviews: [], categories: [], focusGoalIds: [], noteGroups: [], notes: [], quotes: seedQuotes.map((quote) => ({ ...quote, text: { ...quote.text } })), quoteAssignments: { ...defaultQuoteAssignments } }; }

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
      // Avoid importing unreasonably large backups into browser storage.
      if (json.length > 4500000) return false;
      const imported = {
        ...next,
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
    if (!QUOTE_PLACEMENTS.includes(placement)) return false;
    if (quoteId !== null && !systemQuoteIds.has(quoteId)) return false;
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
    goals, routines, reviews, vision, today, focusGoals, categories, noteGroups, notes, quotes, quoteAssignments, toggleFocus, isFocus,
    getArea, getAreaName, addCategory, deleteCategory, canSetParent, setGoalParent, goalAncestors, resetState, dayTasks, isDone, setDone, taskStats, weekDays, weekStats, goalStats,
    addGoal, updateGoal, deleteGoal, addRoutine, deleteRoutine, saveReview, getReview, setVision,
    exportState, importState, addDemoContent, addNoteGroup, updateNoteGroup, deleteNoteGroup, addNote, updateNote, deleteNote, quoteFor, assignQuote,
  };
});
