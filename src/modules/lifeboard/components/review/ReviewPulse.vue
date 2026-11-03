<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { dateKey } from '../../date';
import { useLifeI18n } from '../../i18n';
import { useLifeStore } from '../../stores/useLifeStore';
import type { LifeGoal, WeeklyReview } from '../../types';

interface DayMetric { date: Date; stat: { done: number; total: number; percent: number } }
interface GoalMetric { goal: LifeGoal; done: number; total: number; percent: number }
const props = defineProps<{
  days: DayMetric[];
  goals: GoalMetric[];
  weekPercent: number;
  storedReview?: WeeklyReview;
}>();
const emit = defineEmits<{ day: [date: Date]; reflect: []; insights: [] }>();
const store = useLifeStore();
const router = useRouter();
const { t, locale, titleFor } = useLifeI18n();
const activeDays = computed(() => props.days.filter(day => day.stat.done > 0).length);
const peak = computed(() => props.days.filter(day => day.stat.done > 0).sort((a,b) => b.stat.done - a.stat.done)[0]);
const weekday = (day: Date) => new Intl.DateTimeFormat(locale.value, { weekday: 'short' }).format(day);
const focus = computed(() => props.goals.slice(0, 2));
const signal = computed(() => {
  if (!props.days.some(day => day.stat.total > 0)) return t('pulseNoPlan');
  if (activeDays.value === 0) return t('pulseStart');
  if (props.weekPercent >= 80) return t('pulseStrong');
  if (props.weekPercent >= 45) return t('pulseSteady');
  return t('pulseBalance');
});
const nextStep = computed(() => props.storedReview?.nextStep.trim() || t('pulseNextPrompt'));
function openGoals() { void router.push('/life-goals'); }
</script>

<template>
  <div class="lb-review-pulse-stack">
    <section class="lb-review-pulse-card" :aria-label="t('pulseTitle')">
      <div class="lb-review-pulse-heading">
        <div><p class="lb-overline">{{ t('pulseTitle') }}</p><strong>{{ signal }}</strong></div>
        <div class="lb-review-pulse-count"><b>{{ activeDays }}</b><span>/ 7</span><small>{{ t('pulseActiveDays') }}</small></div>
      </div>
      <div class="lb-review-pulse-chart" role="group" :aria-label="t('trend')">
        <button v-for="day in days" :key="dateKey(day.date)" type="button" :aria-label="`${weekday(day.date)}: ${day.stat.done}/${day.stat.total}`" :title="`${day.stat.done}/${day.stat.total}`" @click="emit('day',day.date)">
          <span class="lb-review-pulse-well"><span :style="{ height: `${Math.max(day.stat.percent, day.stat.done ? 8 : 5)}%` }" :class="{ 'has-progress': day.stat.done > 0 }" /></span>
          <small>{{ weekday(day.date) }}</small>
        </button>
      </div>
      <p v-if="peak" class="lb-review-pulse-peak"><i class="bi bi-graph-up-arrow" /> {{ t('pulsePeak') }}: <strong>{{ weekday(peak.date) }}</strong> · {{ peak.stat.done }} / {{ peak.stat.total }}</p>
    </section>

    <section class="lb-review-focus-snapshot" :aria-label="t('pulseFocus')">
      <div class="lb-review-focus-top"><span class="lb-overline">{{ t('pulseFocus') }}</span><button type="button" :aria-label="t('manageGoals')" @click="openGoals"><i class="bi bi-arrow-up-right" /></button></div>
      <div v-if="focus.length" class="lb-review-focus-items">
        <div v-for="entry in focus" :key="entry.goal.id" class="lb-review-focus-item">
          <div><span class="lb-review-focus-dot" :style="{ background: store.getArea(entry.goal.areaId).accent }" /><strong :title="titleFor(entry.goal)">{{ titleFor(entry.goal) }}</strong><b>{{ entry.percent }}%</b></div>
          <div class="lb-review-focus-track"><span :style="{ width: `${entry.percent}%`, background: store.getArea(entry.goal.areaId).accent }" /></div>
        </div>
      </div>
      <button v-else class="lb-review-focus-empty" type="button" @click="openGoals"><i class="bi bi-plus-circle" />{{ t('pulseNoFocus') }}</button>
    </section>

    <button type="button" class="lb-review-next-step" @click="emit('reflect')">
      <span class="lb-review-next-step-icon"><i class="bi bi-arrow-return-right" /></span>
      <span><small>{{ t('pulseNextTitle') }}</small><strong>{{ nextStep }}</strong></span>
      <i class="bi bi-chevron-right" aria-hidden="true" />
    </button>
  </div>
</template>
