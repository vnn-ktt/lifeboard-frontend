<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { LifeGoal } from '../../types';
import { useLifeStore } from '../../stores/useLifeStore';
import { useGoalMetricsI18n } from '../../goalMetricsI18n';
import { formatGoalValue } from '../../utils/goalMetrics';
import { dateKey } from '../../date';

const props = defineProps<{ goal: LifeGoal }>();
const store = useLifeStore();
const { mt, locale } = useGoalMetricsI18n();
const stats = computed(() => store.goalStats(props.goal));
const history = computed(() => store.goalHistory(props.goal.id).slice().reverse());
const value = ref(0);
const recordedAt = ref(dateKey(new Date()));
const note = ref('');
const error = ref('');
const success = ref('');
const format = (num: number, unit: string) => formatGoalValue(num, unit, locale.value);
const formatDate = (iso: string) => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));

watch(() => [props.goal.id, stats.value.outcome?.current] as const, () => {
  value.value = stats.value.outcome?.current ?? 0;
  error.value = '';
}, { immediate: true });

function saveReading() {
  error.value = '';
  success.value = '';
  const id = store.recordGoalMetric(props.goal.id, Number(value.value), recordedAt.value, note.value);
  if (!id) { error.value = mt('metricError'); return; }
  note.value = '';
  success.value = mt('metricSaved');
}

function setBinary(completed: boolean) {
  error.value = '';
  success.value = '';
  const id = store.recordGoalMetric(props.goal.id, completed ? 1 : 0, dateKey(new Date()));
  if (!id) error.value = mt('metricError');
  else success.value = mt('metricSaved');
}

function deleteReading(id: string) {
  if (window.confirm(mt('removeReadingConfirm'))) store.deleteGoalMetric(id);
}

const points = computed(() => {
  if (props.goal.measurement?.kind !== 'numeric') return [];
  const observations = [...store.goalHistory(props.goal.id)];
  const firstDate = props.goal.startDate ?? observations[0]?.date ?? dateKey(new Date());
  const base = { date: firstDate, value: props.goal.measurement.startValue };
  const readings = [base, ...observations.map(entry => ({ date: entry.date, value: entry.value }))];
  const timestamps = readings.map(item => Date.parse(`${item.date}T12:00:00`));
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const values = readings.map(item => item.value).concat(props.goal.measurement.targetValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  return readings.map((item, index) => {
    const x = 18 + (maxTime === minTime ? (readings.length === 1 ? 0 : index * 264 / (readings.length - 1)) : (timestamps[index] - minTime) / (maxTime - minTime) * 264);
    const y = 100 - (maxValue === minValue ? .5 : (item.value - minValue) / (maxValue - minValue)) * 80;
    return { x, y, value: item.value, date: item.date };
  });
});
const polyline = computed(() => points.value.map(point => `${point.x},${point.y}`).join(' '));
</script>

<template>
  <section class="lb-goal-metric-panel" :aria-label="mt('outcomeProgress')">
    <header class="lb-goal-metric-head">
      <div><span class="lb-overline">{{ mt('result') }}</span>
        <h4>{{ stats.outcome ? (stats.outcome.kind === 'binary' ? (stats.outcome.complete ? mt('achieved') : mt('notAchieved')) : format(stats.outcome.current, stats.outcome.unit)) : `${stats.activity.done} / ${stats.activity.target}` }}</h4>
        <small v-if="stats.outcome?.kind !== 'binary' && stats.outcome">{{ mt('targetValue') }}: {{ format(stats.outcome.target, stats.outcome.unit) }}</small>
      </div>
      <strong class="lb-goal-metric-percent">{{ stats.percent }}%</strong>
    </header>
    <div class="lb-progress-track lb-goal-metric-main-progress"><div :style="{ width: `${stats.percent}%` }" /></div>
    <div v-if="stats.outcome" class="lb-goal-activity-summary">
      <div><span>{{ mt('actionProgress') }}</span><strong>{{ stats.activity.done }} / {{ stats.activity.target }} · {{ stats.activity.percent }}%</strong></div>
      <div class="lb-progress-track"><div :style="{ width: `${stats.activity.percent}%` }" /></div>
    </div>
    <div v-if="goal.startDate || goal.dueDate" class="lb-goal-metric-dates"><i class="bi bi-calendar3" aria-hidden="true" />
      <span v-if="goal.startDate">{{ mt('from') }} {{ formatDate(goal.startDate) }}</span>
      <span v-if="goal.dueDate">{{ mt('until') }} {{ formatDate(goal.dueDate) }}</span>
    </div>
    <p v-else class="lb-goal-metric-legacy">{{ mt('legacyPeriod') }}</p>

    <template v-if="stats.outcome">
      <div v-if="stats.outcome.kind === 'binary'" class="lb-goal-metric-binary-action">
        <button type="button" class="lb-button lb-button-outline" @click="setBinary(!stats.outcome!.complete)">
          <i :class="['bi', stats.outcome.complete ? 'bi-arrow-counterclockwise' : 'bi-check2-circle']" />
          {{ stats.outcome.complete ? mt('markNotAchieved') : mt('markAchieved') }}
        </button>
      </div>
      <p v-if="error && stats.outcome.kind === 'binary'" role="alert" class="lb-error">{{ error }}</p>
      <p v-if="success && stats.outcome.kind === 'binary'" role="status" class="lb-goal-metric-success">{{ success }}</p>
      <details class="lb-goal-metric-details">
        <summary><i class="bi bi-graph-up" aria-hidden="true" /> {{ stats.outcome.kind === 'binary' ? mt('history') : mt('updateResult') }}
          <small>{{ history.length }} {{ mt('measurements') }}</small><i class="bi bi-chevron-down" aria-hidden="true" /></summary>
        <div class="lb-goal-metric-entry" v-if="stats.outcome.kind !== 'binary'">
          <form class="lb-goal-metric-form" @submit.prevent="saveReading">
          <label><span>{{ mt('metricValue') }} <b class="lb-required-mark" aria-hidden="true">*</b></span>
            <input v-model.number="value" class="lb-input" type="number" step="any" required />
          </label>
          <label><span>{{ mt('metricDate') }} <b class="lb-required-mark" aria-hidden="true">*</b></span>
            <input v-model="recordedAt" class="lb-input" type="date" :min="goal.startDate || undefined" :max="dateKey(new Date())" required />
          </label>
          <label class="lb-goal-metric-note"><span>{{ mt('metricNote') }}</span>
            <input v-model="note" class="lb-input" type="text" maxlength="300" :placeholder="mt('metricNotePlaceholder')" />
          </label>
          <button class="lb-button lb-button-primary" type="submit"><i class="bi bi-plus-circle" />{{ mt('record') }}</button>
          </form>
        </div>
      <p v-if="error && stats.outcome.kind !== 'binary'" role="alert" class="lb-error">{{ error }}</p>
      <p v-if="success && stats.outcome.kind !== 'binary'" role="status" class="lb-goal-metric-success">{{ success }}</p>
      <div class="lb-goal-metric-history">
        <div class="lb-goal-metric-history-head"><strong>{{ mt('history') }}</strong><small>{{ history.length }} {{ mt('measurements') }}</small></div>
        <svg v-if="points.length > 1" class="lb-goal-metric-chart" viewBox="0 0 300 120" preserveAspectRatio="none" role="img" :aria-label="mt('changes')">
          <line x1="18" y1="100" x2="282" y2="100" stroke="currentColor" opacity=".14" stroke-width="1" />
          <polyline :points="polyline" stroke="var(--life-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <circle v-for="(point, index) in points" :key="`${index}-${point.date}`" :cx="point.x" :cy="point.y" r="3.8" fill="var(--life-primary)" stroke="var(--life-surface)" stroke-width="2" />
        </svg>
        <p v-if="!history.length" class="lb-muted">{{ mt('noHistory') }}</p>
        <ol v-else class="lb-goal-metric-readings">
          <li v-for="entry in history.slice(0, 12)" :key="entry.id">
            <div><strong>{{ stats.outcome.kind === 'binary' ? (entry.value === 1 ? mt('achieved') : mt('notAchieved')) : format(entry.value, stats.outcome.unit) }}</strong>
              <span>{{ formatDate(entry.date) }}</span><small v-if="entry.note">{{ entry.note }}</small></div>
            <button type="button" class="lb-icon-button lb-danger-hover" :title="mt('removeReading')" :aria-label="mt('removeReading')" @click="deleteReading(entry.id)"><i class="bi bi-x-lg" /></button>
          </li>
        </ol>
      </div>
      </details>
    </template>
  </section>
</template>
