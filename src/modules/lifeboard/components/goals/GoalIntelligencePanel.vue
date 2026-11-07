<script setup lang="ts">
import { computed } from 'vue';
import type { LifeGoal } from '../../types';
import { useLifeStore } from '../../stores/useLifeStore';
import { useGoalIntelligenceI18n } from '../../goalIntelligenceI18n';
import { dateKey } from '../../date';
import { forecastGoal } from '../../utils/goalIntelligence';
import { formatGoalValue } from '../../utils/goalMetrics';

const props = defineProps<{ goal: LifeGoal }>();
const store = useLifeStore();
const { words, locale } = useGoalIntelligenceI18n();
const forecast = computed(() => forecastGoal(props.goal, store.goalHistory(props.goal.id), dateKey(new Date())));
const unit = computed(() => props.goal.measurement?.kind === 'numeric' ? props.goal.measurement.unit : '');
const format = (value: number) => formatGoalValue(value, unit.value, locale.value);
const dateFormat = (date: string) => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
const statusText = computed(() => {
  const status = forecast.value.status;
  const keys = { 'on-track': 'onTrack', 'at-risk': 'atRisk', overdue: 'overdue', achieved: 'achieved',
    'moving-away': 'movingAway', stale: 'stale', insufficient: 'insufficient', 'no-deadline': 'noDeadline', unsupported: 'insufficient' } as const;
  return words.value[keys[status]];
});
const graph = computed(() => {
  if (props.goal.measurement?.kind !== 'numeric') return null;
  const readings = forecast.value.readings;
  if (!readings.length) return null;
  const { targetValue, startValue } = props.goal.measurement;
  const lower = Math.min(startValue, targetValue, ...readings.map(item => item.value));
  const upper = Math.max(startValue, targetValue, ...readings.map(item => item.value));
  const range = Math.max(0.0001, upper - lower);
  const day = (value: string) => Date.parse(`${value}T12:00:00Z`) / 86_400_000;
  const minDate = day(readings[0].date);
  const lastDate = day(readings[readings.length - 1].date);
  const projectionDate = forecast.value.estimatedDate ? day(forecast.value.estimatedDate) : null;
  const canPlotProjection = projectionDate !== null && projectionDate > lastDate && projectionDate - lastDate <= 365;
  const maxDate = canPlotProjection && projectionDate !== null ? projectionDate : lastDate;
  const width = Math.max(1, maxDate - minDate);
  const x = (d: string) => 20 + ((day(d) - minDate) / width) * 260;
  const y = (v: number) => 105 - ((v - lower) / range) * 82;
  const actual = readings.map(item => ({ x: x(item.date), y: y(item.value), ...item }));
  const targetY = y(targetValue);
  const projected = canPlotProjection && forecast.value.estimatedDate ?
    { fromX: actual[actual.length - 1].x, fromY: actual[actual.length - 1].y, toX: x(forecast.value.estimatedDate), targetY } : null;
  return { actual, polyline: actual.map(p => `${p.x},${p.y}`).join(' '), targetY, projected };
});
</script>

<template>
  <section v-if="goal.measurement?.kind === 'numeric'" class="lb-intelligence lb-panel" :aria-label="words.intelligence">
    <header class="lb-intelligence-head">
      <div><p class="lb-overline">{{ words.intelligence }}</p><h4>{{ words.outcomeTrend }}</h4></div>
      <span class="lb-intelligence-status" :class="`is-${forecast.status}`">{{ statusText }}</span>
    </header>
    <div v-if="graph" class="lb-intelligence-graph">
      <svg viewBox="0 0 300 126" preserveAspectRatio="none" role="img" :aria-label="words.outcomeTrend">
        <line x1="20" :y1="graph.targetY" x2="280" :y2="graph.targetY" stroke="currentColor" stroke-dasharray="4 5" opacity=".45" />
        <line v-if="graph.projected" :x1="graph.projected.fromX" :y1="graph.projected.fromY" :x2="graph.projected.toX" :y2="graph.projected.targetY" stroke="var(--life-primary)" stroke-width="2" stroke-dasharray="5 5" opacity=".55" />
        <polyline v-if="graph.actual.length > 1" :points="graph.polyline" fill="none" stroke="var(--life-primary)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
        <circle v-for="point in graph.actual" :key="point.date" :cx="point.x" :cy="point.y" r="4" fill="var(--life-primary)" stroke="var(--life-surface)" stroke-width="1.5"><title>{{ `${point.date}: ${format(point.value)}` }}</title></circle>
      </svg>
      <div class="lb-intelligence-legend"><span><i class="is-actual" />{{ words.observed }} · {{ graph.actual.length }}</span><span><i class="is-target" />{{ words.target }}: {{ format(goal.measurement.targetValue) }}</span><span v-if="graph.projected"><i class="is-projected" />{{ words.predicted }}</span></div>
    </div>
    <p v-else class="lb-muted">{{ words.noData }}</p>
    <div class="lb-intelligence-forecast">
      <div><span>{{ words.forecast }}</span><strong>{{ statusText }}</strong></div>
      <div v-if="forecast.estimatedDate"><span>{{ words.estimated }}</span><strong>{{ dateFormat(forecast.estimatedDate) }}</strong></div>
      <div v-if="forecast.pacePerDay !== null && forecast.pacePerDay > 0"><span>{{ words.pace }}</span><strong>{{ format(forecast.pacePerDay) }} {{ words.paceUnit }}</strong></div>
    </div>
    <p class="lb-intelligence-disclaimer">{{ forecast.hasTrend && forecast.status !== 'stale' ? words.forecastDisclaimer : words.noData }}</p>
  </section>
</template>
