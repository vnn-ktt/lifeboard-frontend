<script setup lang="ts">
import { computed } from 'vue';
import { useLifeI18n } from '../../i18n';
import { useLifeStore } from '../../stores/useLifeStore';
import type { LifeGoal } from '../../types';

interface DayMetric { date: Date; stat: { total: number; done: number; percent: number } }
interface GoalMetric { goal: LifeGoal; done: number; total: number; percent: number }
const props = defineProps<{ days: DayMetric[]; goals: GoalMetric[] }>();
const emit = defineEmits<{ day: [date: Date] }>();
const store = useLifeStore();
const { t, locale } = useLifeI18n();
const weekday = (day: Date) => new Intl.DateTimeFormat(locale.value, { weekday: 'short' }).format(day);
const doneTotal = computed(() => props.days.reduce((sum, item) => sum + item.stat.done, 0));
const areaAngle = computed(() => {
  const total = props.goals.reduce((sum, item) => sum + item.done, 0);
  if (!total) return 'conic-gradient(var(--life-border) 0 100%)';
  let offset = 0;
  const segments = props.goals.filter(item => item.done > 0).map((item) => {
    const start = offset;
    offset += item.done / total * 100;
    return `${store.getArea(item.goal.areaId).accent} ${start.toFixed(2)}% ${offset.toFixed(2)}%`;
  });
  return `conic-gradient(${segments.join(',')})`;
});
</script>

<template>
  <div class="lb-analytics-grid lb-review-insights">
    <section class="lb-panel">
      <div class="lb-panel-heading"><div><p class="lb-overline">{{ t('trend') }}</p><h3>{{ t('week') }}</h3></div></div>
      <div class="lb-trend-bars">
        <button v-for="day in days" :key="day.date.toISOString()" type="button" class="lb-trend-column"
          :title="`${day.stat.done}/${day.stat.total}`" @click="emit('day', day.date)">
          <span>{{ day.stat.percent }}%</span>
          <div class="lb-trend-well"><div :style="{ height: `${Math.max(day.stat.percent, day.stat.done ? 8 : 0)}%` }" /></div>
          <small>{{ weekday(day.date) }}</small>
        </button>
      </div>
    </section>
    <section class="lb-panel">
      <div class="lb-panel-heading"><div><p class="lb-overline">{{ t('composition') }}</p><h3>{{ t('balance') }}</h3></div></div>
      <div class="lb-donut-layout">
        <div class="lb-donut-chart" :style="{ background: areaAngle }"><div><strong>{{ doneTotal }}</strong><small>{{ t('done') }}</small></div></div>
        <div class="lb-donut-legend">
          <div v-for="entry in goals" :key="entry.goal.id">
            <i :style="{ background: store.getArea(entry.goal.areaId).accent }" />
            <span>{{ store.getAreaName(entry.goal.areaId, locale) }}</span>
            <strong>{{ entry.done }}</strong>
          </div>
          <p v-if="!goals.length" class="lb-muted">{{ t('empty') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
