import { reactive, ref, watch } from 'vue';
import type { GoalInput, Horizon, LifeAreaId, LifeGoal, GoalCheckinFrequency } from '../types';
import { useLifeStore } from '../stores/useLifeStore';
import { useLifeI18n } from '../i18n';
import { useGoalMetricsI18n } from '../goalMetricsI18n';
import { defaultGoalDueDate, goalKind, type GoalKind, validGoalMeasurement, validGoalPeriod } from '../utils/goalMetrics';
import { dateKey } from '../date';
import { defaultCheckinSchedule, validCheckinSchedule } from '../utils/goalCheckins';

export interface GoalDraft {
  title: string;
  description: string;
  areaId: LifeAreaId;
  horizon: Horizon;
  target: number;
  parentId: string;
  startDate: string;
  dueDate: string;
  measurementKind: GoalKind;
  startValue: number;
  resultTarget: number;
  unit: string;
  checkinFrequency: GoalCheckinFrequency;
  checkinWeekday: number;
  checkinFromDate: string;
}

export function useGoalDraft() {
  const store = useLifeStore();
  const { t } = useLifeI18n();
  const { mt } = useGoalMetricsI18n();
  const step = ref(0);
  const error = ref('');
  const today = dateKey(new Date());
  const draft = reactive<GoalDraft>({
    title:'', description:'', areaId:'other', horizon:'month', target:12, parentId:'',
    startDate: today, dueDate: defaultGoalDueDate(today, 'month'),
    measurementKind:'activity', startValue:0, resultTarget:100, unit:'%',
    checkinFrequency:'weekly', checkinWeekday:7, checkinFromDate:today,
  });

  watch(() => draft.horizon, (horizon, previous) => {
    if (draft.startDate && draft.dueDate === defaultGoalDueDate(draft.startDate, previous)) {
      draft.dueDate = defaultGoalDueDate(draft.startDate, horizon);
    }
  });

  watch(() => draft.measurementKind, (kind, previous) => {
    if (kind === 'decrease' && previous !== 'decrease' && draft.resultTarget >= draft.startValue) {
      draft.startValue = 100;
      draft.resultTarget = 80;
    } else if (kind === 'increase' && previous !== 'increase' && draft.resultTarget <= draft.startValue) {
      draft.startValue = 0;
      draft.resultTarget = 100;
    }
  });

  function reset(horizon: Horizon = 'month', parentId: string | null = null, seed?: LifeGoal | null) {
    const date = dateKey(new Date());
    const measurement = seed?.measurement;
    Object.assign(draft, seed ? {
      title: seed.title, description: seed.description, areaId: seed.areaId, horizon: seed.horizon,
      target: seed.target, parentId: seed.parentId ?? '', startDate: seed.startDate ?? '', dueDate: seed.dueDate ?? '',
      measurementKind: goalKind(measurement),
      startValue: measurement?.kind === 'numeric' ? measurement.startValue : 0,
      resultTarget: measurement?.kind === 'numeric' ? measurement.targetValue : 100,
      unit: measurement?.kind === 'numeric' ? measurement.unit : '%',
      checkinFrequency: seed.checkin?.frequency ?? 'weekly',
      checkinWeekday: seed.checkin?.weekday ?? 7,
      checkinFromDate: seed.checkin?.fromDate ?? date,
    } : {
      title:'', description:'', areaId:'other', horizon, target:12, parentId:parentId ?? '',
      startDate: date, dueDate: defaultGoalDueDate(date, horizon),
      measurementKind:'activity', startValue:0, resultTarget:100, unit:'%',
      checkinFrequency:'weekly', checkinWeekday:7, checkinFromDate:date,
    });
    step.value = 0;
    error.value = '';
  }

  function measurement(): GoalInput['measurement'] {
    if (draft.measurementKind === 'activity') return { kind: 'activity' };
    if (draft.measurementKind === 'binary') return { kind: 'binary' };
    return {
      kind: 'numeric', direction: draft.measurementKind,
      startValue: Number(draft.startValue), targetValue: Number(draft.resultTarget), unit: draft.unit.trim(),
    };
  }

  function checkinSettings(): GoalInput['checkin'] {
    if (draft.measurementKind === 'activity') return undefined;
    return { frequency: draft.checkinFrequency,
      weekday: draft.checkinFrequency === 'weekly' ? draft.checkinWeekday : undefined,
      fromDate: draft.checkinFromDate || defaultCheckinSchedule().fromDate,
    };
  }

  function validateStep(number: number): boolean {
    error.value = '';
    if (number === 0 && (draft.title.trim().length < 2 || draft.title.trim().length > 90)) {
      error.value = t('goalNameError');
    }
    if (number === 2) {
      if (!Number.isInteger(draft.target) || draft.target < 1 || draft.target > 10000) error.value = t('goalTargetError');
      else if (!validGoalMeasurement(measurement())) error.value = mt('invalidMetric');
      else if (!validGoalPeriod(draft.startDate || undefined, draft.dueDate || undefined)) error.value = mt('invalidDates');
      else if (checkinSettings() && !validCheckinSchedule(checkinSettings())) error.value = mt('invalidDates');
    }
    return !error.value;
  }

  function next() { if (validateStep(step.value)) step.value = Math.min(2, step.value + 1); }
  function previous() { error.value = ''; step.value = Math.max(0, step.value - 1); }

  function submit(goalId?: string | null): string | null {
    if (!validateStep(0) || !validateStep(2)) return null;
    const payload: GoalInput = {
      title: draft.title.trim(), description: draft.description.trim(), areaId: draft.areaId,
      horizon: draft.horizon, target: Number(draft.target),
      parentId: draft.parentId || null, startDate: draft.startDate || undefined,
      dueDate: draft.dueDate || undefined, measurement: measurement(), checkin: checkinSettings(),
    };
    if (goalId) return store.updateGoal(goalId, payload) ? goalId : null;
    return store.addGoal(payload);
  }
  return { draft, step, error, reset, next, previous, submit };
}
