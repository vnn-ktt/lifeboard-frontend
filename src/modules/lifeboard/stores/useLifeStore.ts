import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { dateKey, getMonthDays, getWeekStart, mondayIndex, shiftDays } from '../date';
import type { Horizon, LifeArea, LifeAreaId, LifeGoal, LifeRoutine, LifeState, WeeklyReview } from '../types';

const STORAGE_KEY = 'lifeboard:state:v1';

export const lifeAreas: LifeArea[] = [
  { id: 'dogs', name: 'Собаки', icon: 'bi-heart-pulse', accent: '#cf8b54', subtle: '#f8ebdc' },
  { id: 'career', name: 'Развитие', icon: 'bi-code-slash', accent: '#6979d1', subtle: '#e9ecfb' },
  { id: 'leadership', name: 'Лидерство', icon: 'bi-people', accent: '#438d78', subtle: '#e0f2ea' },
  { id: 'health', name: 'Здоровье', icon: 'bi-activity', accent: '#cf7779', subtle: '#fbe9ea' },
  { id: 'finance', name: 'Финансы', icon: 'bi-wallet2', accent: '#b2904d', subtle: '#faf2dc' },
  { id: 'relationships', name: 'Отношения', icon: 'bi-chat-heart', accent: '#bc739a', subtle: '#f8eaf3' },
  { id: 'learning', name: 'Языки', icon: 'bi-translate', accent: '#6082ad', subtle: '#e5effb' },
  { id: 'other', name: 'Другое', icon: 'bi-compass', accent: '#718096', subtle: '#edf0f5' },
];

const seedGoals: LifeGoal[] = [
  {
    id: 'dogs-goal', areaId: 'dogs', title: 'Воспитать двух спаниелей',
    description: 'Регулярные прогулки, спокойствие и короткая дрессировка без перегруза.',
    horizon: 'month', target: 60, createdAt: '2026-11-01T00:00:00',
  },
  {
    id: 'backend-goal', areaId: 'career', title: 'Стать сильнее в Node.js / Backend',
    description: 'Рабочая практика, разбор архитектуры и систематические занятия по 60–90 минут.',
    horizon: 'month', target: 20, createdAt: '2026-11-01T00:00:00',
  },
  {
    id: 'lead-goal', areaId: 'leadership', title: 'Развить лидерские навыки',
    description: 'Предлагать решения, обозначать риски и помогать команде.',
    horizon: 'month', target: 16, createdAt: '2026-11-01T00:00:00',
  },
];

const seedRoutines: LifeRoutine[] = [
  { id: 'dog-am', goalId: 'dogs-goal', title: 'Утренняя прогулка + дрессировка', description: '35–40 минут, контакт и одна команда.', time: '07:25', days: [1, 2, 3, 4, 5, 6, 7], durationMinutes: 40 },
  { id: 'dog-pm', goalId: 'dogs-goal', title: 'Вечерняя прогулка + дрессировка', description: '40–45 минут, подзыв и самоконтроль.', time: '18:30', days: [1, 2, 3, 4, 5, 6, 7], durationMinutes: 45 },
  { id: 'backend-work', goalId: 'backend-goal', title: 'Node.js / NestJS — практика', description: 'Одна backend-тема или реальная техническая задача.', time: '15:00', days: [1, 2, 3, 4, 5], durationMinutes: 60 },
  { id: 'leader-work', goalId: 'lead-goal', title: 'Лидерский микро-шаг', description: 'Риск, инициатива, помощь коллеге или обратная связь.', time: '16:00', days: [1, 2, 3, 4, 5], durationMinutes: 15 },
];

function initialState(): LifeState {
  return {
    version: 1,
    vision: 'Жить свободно: выбирать, где жить и работать, быть здоровым, иметь время для близких и своих увлечений.',
    goals: seedGoals,
    routines: seedRoutines,
    checks: {},
    reviews: [],
  };
}

function restore(): LifeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return initialState();
    const state = parsed as Partial<LifeState>;
    if (state.version !== 1 || !Array.isArray(state.goals) || !Array.isArray(state.routines) || !state.checks || !Array.isArray(state.reviews)) return initialState();
    return { version: 1, vision: typeof state.vision === 'string' ? state.vision : '', goals: state.goals, routines: state.routines, checks: state.checks, reviews: state.reviews };
  } catch {
    return initialState();
  }
}

export const useLifeStore = defineStore('lifeboard', () => {
  const state = ref<LifeState>(restore());
  watch(state, (newState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(newState)), { deep: true });
  const goals = computed(() => state.value.goals);
  const routines = computed(() => state.value.routines);
  const reviews = computed(() => state.value.reviews);
  const vision = computed(() => state.value.vision);

  function getArea(id: LifeAreaId): LifeArea {
    return lifeAreas.find((area) => area.id === id) ?? lifeAreas[lifeAreas.length - 1];
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
    const goalRoutineIds = new Set(state.value.routines.filter((routine) => routine.goalId === goal.id).map((routine) => routine.id));
    const periodDates = goal.horizon === 'month'
      ? getMonthDays(date)
      : goal.horizon === 'quarter'
        ? Array.from({ length: 3 }, (_, i) => new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3 + i, 1)).flatMap(getMonthDays)
        : Array.from({ length: goal.horizon === 'year' ? 12 : 60 }, (_, i) => new Date(date.getFullYear(), i, 1)).flatMap(getMonthDays);
    let done = 0;
    for (const day of periodDates) {
      for (const routineId of goalRoutineIds) {
        if (state.value.checks[`${dateKey(day)}|${routineId}`]) done++;
      }
    }
    return { done, target: goal.target, percent: Math.min(100, Math.round((done / Math.max(1, goal.target)) * 100)) };
  }

  function addGoal(data: { areaId: LifeAreaId; title: string; description: string; horizon: Horizon; target: number }) {
    state.value.goals.push({ ...data, title: data.title.trim(), id: crypto.randomUUID(), createdAt: new Date().toISOString() });
  }

  function deleteGoal(id: string) {
    const routineIds = state.value.routines.filter((routine) => routine.goalId === id).map((routine) => routine.id);
    state.value.goals = state.value.goals.filter((goal) => goal.id !== id);
    state.value.routines = state.value.routines.filter((routine) => routine.goalId !== id);
    for (const key of Object.keys(state.value.checks)) {
      if (routineIds.some((routineId) => key.endsWith(`|${routineId}`))) delete state.value.checks[key];
    }
  }

  function addRoutine(data: Omit<LifeRoutine, 'id'>) {
    if (!state.value.goals.some((goal) => goal.id === data.goalId)) return;
    state.value.routines.push({ ...data, id: crypto.randomUUID() });
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

  function exportState(): string { return JSON.stringify(state.value, null, 2); }

  function importState(json: string): boolean {
    try {
      const parsed: unknown = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object') return false;
      const next = parsed as Partial<LifeState>;
      if (next.version !== 1 || !Array.isArray(next.goals) || !Array.isArray(next.routines) || !Array.isArray(next.reviews) || !next.checks || typeof next.checks !== 'object' || typeof next.vision !== 'string') return false;
      if (!next.goals.every((g) => typeof g.id === 'string' && typeof g.title === 'string' && Number.isFinite(g.target)) || !next.routines.every((r) => typeof r.id === 'string' && Array.isArray(r.days) && typeof r.goalId === 'string')) return false;
      state.value = next as LifeState;
      return true;
    } catch { return false; }
  }

  const today = computed(() => new Date());
  const focusGoals = computed(() => state.value.goals.filter((goal) => goal.horizon === 'month'));
  return {
    goals, routines, reviews, vision, today, focusGoals,
    getArea, dayTasks, isDone, setDone, taskStats, weekDays, weekStats, goalStats,
    addGoal, deleteGoal, addRoutine, deleteRoutine, saveReview, getReview, setVision,
    exportState, importState,
  };
});
