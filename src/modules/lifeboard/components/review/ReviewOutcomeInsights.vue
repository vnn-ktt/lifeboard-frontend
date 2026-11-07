<script setup lang="ts">
import { computed } from 'vue';
import type { LifeGoal } from '../../types';
import { useLifeStore } from '../../stores/useLifeStore';
import { useLifeI18n } from '../../i18n';
import { useGoalIntelligenceI18n } from '../../goalIntelligenceI18n';
import { dateKey, getWeekStart, shiftDays } from '../../date';
import { weeklyGoalOutcome } from '../../utils/goalIntelligence';
import { formatGoalValue } from '../../utils/goalMetrics';

const props = defineProps<{ week: Date }>();
const store = useLifeStore();
const { titleFor } = useLifeI18n();
const { words, locale } = useGoalIntelligenceI18n();
const start = computed(() => dateKey(getWeekStart(props.week)));
const end = computed(() => {
  const last = dateKey(shiftDays(getWeekStart(props.week), 6));
  const today = dateKey(new Date());
  return last < today ? last : today;
});
const focus = computed(() => {
  const focused = store.focusGoals;
  return focused.length ? focused.slice(0, 5) : store.goals.filter(g => g.status !== 'cancelled' && g.measurement?.kind === 'numeric').slice(0, 5);
});
function progressForWeek(goal: LifeGoal) {
  let done = 0;
  let total = 0;
  const days = store.weekDays(props.week).filter(day => dateKey(day) <= end.value);
  for (const date of days) {
    for (const routine of store.routines.filter(r => r.goalId === goal.id)) {
      if (!routine.days.includes(((date.getDay() + 6) % 7) + 1)) continue;
      total += 1;
      if (store.isDone(routine.id, date)) done += 1;
    }
  }
  return { done, total, percent: total ? Math.round(done / total * 100) : 0 };
}
const results = computed(() => focus.value.map(goal => {
  const outcome = weeklyGoalOutcome(goal, store.goalHistory(goal.id), start.value, end.value);
  const activity = progressForWeek(goal);
  const divergence = outcome.kind === 'numeric' && outcome.hasUpdate && outcome.directedDelta !== null &&
    outcome.directedDelta <= 0 && activity.total >= 2 && activity.percent >= 70;
  return { goal, outcome, activity, divergence };
}));
const completedMilestones = computed(() => store.milestones.filter(item => item.completedAt && dateKey(new Date(item.completedAt)) >= start.value && dateKey(new Date(item.completedAt)) <= end.value).length);
const completedTasks = computed(() => store.goalTasks.filter(item => item.completedAt && dateKey(new Date(item.completedAt)) >= start.value && dateKey(new Date(item.completedAt)) <= end.value).length);
function formatDelta(goal: LifeGoal, value: number) {
  const unit = goal.measurement?.kind === 'numeric' ? goal.measurement.unit : '';
  return `${value > 0 ? '+' : ''}${formatGoalValue(value, unit, locale.value)}`;
}
</script>

<template>
  <section class="lb-panel lb-review-outcomes" :aria-label="words.weekOutcomes">
    <header class="lb-panel-heading"><div><p class="lb-overline">{{ words.weekOutcomes }}</p><h3>{{ words.weekOutcomes }}</h3><p class="lb-muted">{{ words.weekOutcomesHint }}</p></div></header>
    <div class="lb-review-outcome-summary">
      <div><i class="bi bi-flag" aria-hidden="true" /><strong>{{ completedMilestones }}</strong><span>{{ words.milestoneDone }}</span></div>
      <div><i class="bi bi-check2-square" aria-hidden="true" /><strong>{{ completedTasks }}</strong><span>{{ words.tasksDone }}</span></div>
    </div>
    <div v-if="results.length" class="lb-review-outcome-list">
      <article v-for="item in results" :key="item.goal.id" class="lb-review-outcome-row">
        <div class="lb-review-outcome-main">
          <strong>{{ titleFor(item.goal) }}</strong>
          <span v-if="item.outcome.kind === 'activity'" class="lb-muted">{{ words.noMetric }}</span>
          <span v-else-if="!item.outcome.hasUpdate" class="lb-muted">{{ words.noUpdate }}</span>
          <span v-else-if="item.outcome.delta === null" class="lb-muted">{{ words.initialReading }}</span>
          <span v-else :class="{ 'is-positive': (item.outcome.directedDelta ?? 0) > 0, 'is-negative': (item.outcome.directedDelta ?? 0) < 0 }">
            {{ (item.outcome.directedDelta ?? 0) > 0 ? words.improving : (item.outcome.directedDelta ?? 0) < 0 ? words.regressing : words.unchanged }}
            · {{ formatDelta(item.goal, item.outcome.delta) }}
          </span>
        </div>
        <div class="lb-review-outcome-actions">
          <span>{{ words.activities }}: {{ item.activity.done }} / {{ item.activity.total }}</span>
          <div class="lb-progress-track"><div :style="{ width: `${item.activity.percent}%` }" /></div>
        </div>
        <p v-if="item.divergence" class="lb-review-outcome-note"><i class="bi bi-info-circle" aria-hidden="true" />{{ words.divergence }}</p>
      </article>
    </div>
    <p v-else class="lb-muted">{{ words.noFocus }}</p>
    <p class="lb-intelligence-disclaimer">{{ words.noMeasurement }}</p>
  </section>
</template>
