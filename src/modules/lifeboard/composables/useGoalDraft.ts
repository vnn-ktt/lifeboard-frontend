import { reactive, ref } from 'vue';
import type { Horizon, LifeAreaId, LifeGoal } from '../types';
import { useLifeStore } from '../stores/useLifeStore';
import { useLifeI18n } from '../i18n';

export interface GoalDraft {
  title: string;
  description: string;
  areaId: LifeAreaId;
  horizon: Horizon;
  target: number;
  parentId: string;
}

export function useGoalDraft() {
  const store = useLifeStore();
  const { t } = useLifeI18n();
  const step = ref(0);
  const error = ref('');
  const draft = reactive<GoalDraft>({ title:'', description:'', areaId:'other', horizon:'month', target:12, parentId:'' });
  function reset(horizon: Horizon = 'month', parentId: string | null = null, seed?: LifeGoal | null) {
    Object.assign(draft, seed ? {
      title: seed.title,
      description: seed.description,
      areaId: seed.areaId,
      horizon: seed.horizon,
      target: seed.target,
      parentId: seed.parentId ?? '',
    } : {
      title:'', description:'', areaId:'other', horizon, target:12, parentId:parentId ?? '',
    });
    step.value = 0;
    error.value = '';
  }
  function validateStep(number: number): boolean {
    error.value = '';
    if (number === 0 && (draft.title.trim().length < 2 || draft.title.trim().length > 90)) error.value = t('goalNameError');
    if (number === 2 && (!Number.isInteger(draft.target) || draft.target < 1 || draft.target > 10000)) error.value = t('goalTargetError');
    return !error.value;
  }
  function next() { if (validateStep(step.value)) step.value = Math.min(2, step.value + 1); }
  function previous() { error.value = ''; step.value = Math.max(0, step.value - 1); }
  function submit(goalId?: string | null): string | null {
    if (!validateStep(0) || !validateStep(2)) return null;
    const payload = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      parentId: draft.parentId || null,
    };
    if (goalId) return store.updateGoal(goalId, payload) ? goalId : null;
    const id = store.addGoal(payload);
    return id ?? null;
  }
  return { draft, step, error, reset, next, previous, submit };
}
