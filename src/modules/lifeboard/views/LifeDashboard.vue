<script setup lang="ts">
import { computed } from 'vue';
import LifeboardMascot from '@/shared/components/Brand/LifeboardMascot.vue';
import QuoteSpot from '../components/quotes/QuoteSpot.vue';
import { useLifeStore } from '../stores/useLifeStore';
import { dateKey, getWeekStart, shiftDays } from '../date';
import LifeTask from '../components/LifeTask.vue';
import { useLifeI18n } from '../i18n';

const store = useLifeStore();
const {t,locale,titleFor,descriptionFor}=useLifeI18n();
const fmt=(d:Date,o:Intl.DateTimeFormatOptions={day:'numeric',month:'long'})=>new Intl.DateTimeFormat(locale.value,o).format(d);
const now = new Date();
const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const days = computed(() => store.weekDays(day));
const todayTasks = computed(() => store.dayTasks(day));
const todayStats = computed(() => store.taskStats(day));
const week = computed(() => store.weekStats(day));
const weekPercent = computed(() => week.value.total ? Math.round(week.value.done / week.value.total * 100) : 0);
const activeGoals = computed(() => store.focusGoals.slice(0, 3));
const recentReview = computed(() => store.getReview(shiftDays(getWeekStart(day), -7)));
const dailyStatement = computed(() => {
  if (todayStats.value.total === todayStats.value.done) return t('done');
  if (todayStats.value.done > 0) return t('rhythm');
  return t('oneStep');
});
</script>

<template>
  <div class="lb-screen">
    <div class="lb-page-top"><div><p class="lb-overline">{{ t('yourCenter') }}</p><h1>{{ t('homeTitle') }}</h1><p class="lb-muted">{{ t('homeSub') }}</p></div><RouterLink class="lb-button lb-button-outline" to="/life-goals"><i class="bi bi-sliders2" aria-hidden="true" /> {{ t('manageGoals') }}</RouterLink></div>

    <section class="lb-hero lb-fade-up" aria-label="Lifeboard focus">
      <div class="lb-hero-copy"><span class="lb-hero-pill"><i class="bi bi-circle-fill" aria-hidden="true" /> {{ t('topFocus') }} · {{ fmt(day, { month: 'long', year: 'numeric' }).toUpperCase() }}</span><h2>{{ t('assemble') }}<br /><em>{{ t('assemble2') }}</em></h2><p>{{ dailyStatement }}</p><RouterLink to="/today" class="lb-hero-cta">{{ t('goToday') }} <i class="bi bi-arrow-up-right" aria-hidden="true" /></RouterLink></div>
      <div class="lb-hero-visual">
        <LifeboardMascot size="lg" />
      </div>
      <div class="lb-hero-progress"><div class="lb-progress-ring" :style="{ '--progress': `${todayStats.percent}%` }"><div><strong>{{ todayStats.percent }}<small>%</small></strong><span>{{ t('todayLabel') }}</span></div></div><p>{{ todayStats.done }} {{ t('countOf') }} {{ todayStats.total }} {{ t('todayDone') }}</p></div>
      <span class="lb-hero-orbit lb-hero-orbit--one" /><span class="lb-hero-orbit lb-hero-orbit--two" />
    </section>

    <QuoteSpot placement="dashboard" />

    <div class="lb-kpi-grid">
      <div class="lb-kpi lb-fade-up" style="--delay:.02s"><span class="lb-kpi-icon lb-kpi-icon--green"><i class="bi bi-check2-circle" /></span><div><small>{{ t('tasksToday') }}</small><strong>{{ todayStats.done }} <span>/ {{ todayStats.total }}</span></strong></div></div>
      <div class="lb-kpi lb-fade-up" style="--delay:.06s"><span class="lb-kpi-icon lb-kpi-icon--purple"><i class="bi bi-calendar-week" /></span><div><small>{{ t('weekProgress') }}</small><strong>{{ weekPercent }}<span>%</span></strong></div></div>
      <div class="lb-kpi lb-fade-up" style="--delay:.1s"><span class="lb-kpi-icon lb-kpi-icon--orange"><i class="bi bi-bullseye" /></span><div><small>{{ t('goalFocus') }}</small><strong>{{ store.focusGoals.length }}<span> {{ t('done') }}</span></strong></div></div>
    </div>

    <div class="lb-dashboard-grid">
      <section class="lb-panel lb-today-panel"><div class="lb-panel-heading"><div><p class="lb-overline">{{ t('smallSteps') }}</p><h3>{{ t('todayPlan') }} <span class="lb-heading-date">{{ fmt(day) }}</span></h3></div><RouterLink to="/today" class="lb-text-action">{{ t('allDays') }} <i class="bi bi-arrow-right" /></RouterLink></div>
        <div v-if="todayTasks.length" class="lb-tasks"><LifeTask v-for="task in todayTasks" :key="task.id" :task="task" :date="day" /></div><div v-else class="lb-empty">{{ t('noTasks') }}</div>
        <div class="lb-panel-foot"><i class="bi bi-lightbulb" aria-hidden="true" /> {{ t('progressHint') }}</div>
      </section>

      <section class="lb-panel lb-week-panel"><div class="lb-panel-heading"><div><p class="lb-overline">{{ t('visibleProgress') }}</p><h3>{{ t('week') }}</h3></div><span class="lb-soft-badge">{{ week.done }} / {{ week.total }}</span></div>
        <div class="lb-week-bars"><div v-for="item in days" :key="dateKey(item)" class="lb-week-day" :class="{ 'is-today': dateKey(item) === dateKey(day) }"><div class="lb-week-bar"><div :style="{ height: `${store.taskStats(item).percent}%` }" /></div><span>{{ fmt(item, { weekday: 'short' }).replace('.', '') }}</span><small>{{ item.getDate() }}</small></div></div>
        <div class="lb-week-note"><span class="lb-week-note-icon"><i class="bi bi-graph-up-arrow" /></span><p><strong>{{ t('rhythm') }}</strong><br />{{ t('realActions') }}</p></div>
      </section>
    </div>

    <section class="lb-goals-section"><div class="lb-panel-heading"><div><p class="lb-overline">{{ t('priorities') }}</p><h3>{{ t('monthDirections') }}</h3></div><RouterLink to="/life-goals" class="lb-text-action">{{ t('manage') }} <i class="bi bi-arrow-right" /></RouterLink></div>
      <div class="lb-goals-grid"><article v-for="goal in activeGoals" :key="goal.id" class="lb-goal-card"><div class="lb-goal-card-top"><span class="lb-area-icon" :style="{ color: store.getArea(goal.areaId).accent, background: store.getArea(goal.areaId).subtle }"><i :class="['bi', store.getArea(goal.areaId).icon]" /></span><span class="lb-goal-percent">{{ store.goalStats(goal, day).percent }}%</span></div><span class="lb-goal-area">{{ store.getAreaName(goal.areaId,locale) }}</span><h4>{{ titleFor(goal) }}</h4><p>{{ descriptionFor(goal) }}</p><div class="lb-progress-track"><div :style="{ width: `${store.goalStats(goal, day).percent}%`, background: store.getArea(goal.areaId).accent }" /></div><div class="lb-goal-bottom"><span>{{ store.goalStats(goal, day).done }} / {{ goal.target }} {{ t('allActions') }}</span><i class="bi bi-arrow-up-right" aria-hidden="true" /></div></article>
        <RouterLink v-if="!activeGoals.length" to="/life-goals" class="lb-goal-card lb-add-goal"><i class="bi bi-plus-circle" /><span>{{ t('addFirst') }}</span></RouterLink>
      </div>
    </section>

    <div class="lb-lower-grid"><section class="lb-panel lb-vision-card"><span class="lb-vision-icon"><i class="bi bi-compass" /></span><div><p class="lb-overline">{{ t('visionLabel') }}</p><h3>{{ t('fiveYearVision') }}</h3><p>{{ store.vision }}</p></div><RouterLink to="/life-goals" title="Редактировать видение"><i class="bi bi-arrow-up-right" /></RouterLink></section><section class="lb-panel lb-review-prompt"><span class="lb-review-graphic"><i class="bi bi-journal-check" /></span><div><p class="lb-overline">{{ t('weeklyReview') }}</p><h3>{{ recentReview ? t('reviewSaved') : t('reviewReminder') }}</h3><p>{{ t('whatNext') }}</p></div><RouterLink to="/life-review" class="lb-button lb-button-dark">{{ t('reviewOpen') }} <i class="bi bi-arrow-right" /></RouterLink></section></div>
  </div>
</template>
