<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import { useRouter } from 'vue-router';
import { useLifeI18n } from '../i18n';
import { dateKey, getWeekStart, shiftDays } from '../date';
import { useLifeStore } from '../stores/useLifeStore';
import ReviewEditor from '../components/review/ReviewEditor.vue';
import ReviewInsights from '../components/review/ReviewInsights.vue';
import ReviewPulse from '../components/review/ReviewPulse.vue';

const store = useLifeStore();
const router = useRouter();
const { t, locale } = useLifeI18n();
const fmt = (date: Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) =>
  new Intl.DateTimeFormat(locale.value, options).format(date);
const weekday = (date: Date) => new Intl.DateTimeFormat(locale.value, { weekday: 'short' }).format(date);
const selectedDay = ref<Date | null>(null);
const selected = ref(new Date());
const editDialogOpen = ref(false);
const insightsDialogOpen = ref(false);
const weekDays = computed(() => store.weekDays(selected.value));
const week = computed(() => store.weekStats(selected.value));
const weekPercent = computed(() => week.value.total ? Math.round(100 * week.value.done / week.value.total) : 0);
const storedReview = computed(() => store.getReview(selected.value));
const form = reactive({ wins: '', obstacles: '', nextStep: '', mood: 7 });
const saved = ref(false);
const dailyValues = computed(() => weekDays.value.map(date => ({ date, stat: store.taskStats(date) })));
const goalStats = computed(() => store.focusGoals.map(goal => {
  const weekly = store.routines.filter(task => task.goalId === goal.id);
  let done = 0;
  let total = 0;
  for (const date of weekDays.value) {
    for (const task of weekly) {
      if (!task.days.includes(((date.getDay() + 6) % 7) + 1)) continue;
      total += 1;
      if (store.isDone(task.id, date)) done += 1;
    }
  }
  return { goal, done, total, percent: total ? Math.round(done / total * 100) : 0 };
}));
watch(() => dateKey(getWeekStart(selected.value)), () => {
  const review = store.getReview(selected.value);
  form.wins = review?.wins ?? '';
  form.obstacles = review?.obstacles ?? '';
  form.nextStep = review?.nextStep ?? '';
  form.mood = review?.mood ?? 7;
  saved.value = false;
}, { immediate: true });
const weekLabel = computed(() => `${fmt(getWeekStart(selected.value), { day: 'numeric', month: 'short' })} — ${fmt(shiftDays(getWeekStart(selected.value), 6), { day: 'numeric', month: 'short' })}`);
const selectedMetric = computed(() => selectedDay.value ? store.taskStats(selectedDay.value) : null);
function go(offset: number) {
  selected.value = shiftDays(selected.value, offset);
  selectedDay.value = null;
  editDialogOpen.value = false;
  insightsDialogOpen.value = false;
}
function save() {
  store.saveReview(selected.value, { ...form });
  saved.value = true;
  editDialogOpen.value = false;
}
function openDay(date: Date) { selectedDay.value = date; }
function viewDay(date: Date) {
  insightsDialogOpen.value = false;
  void router.push({ path: '/today', query: { date: dateKey(date) } });
}
</script>

<template>
  <div class="lb-screen lb-review-screen">
    <header class="lb-page-top lb-review-page-top">
      <div>
        <p class="lb-overline">{{ t('weeklyReview') }}</p>
        <h1>{{ t('reviewTitle') }}</h1>
        <p class="lb-muted">{{ t('reviewSub') }}</p>
      </div>
      <div class="lb-stepper" :aria-label="t('week')">
        <button type="button" :aria-label="t('previousWeek')" @click="go(-7)"><i class="bi bi-chevron-left" /></button>
        <span>{{ weekLabel }}</span>
        <button type="button" :aria-label="t('nextWeek')" @click="go(7)"><i class="bi bi-chevron-right" /></button>
      </div>
    </header>

    <!-- One compact, readable overview within the available phone viewport. Editor and charts open on demand. -->
    <section class="lb-review-mobile" :aria-label="t('reviewTitle')">
      <div class="lb-review-mobile-card">
        <div class="lb-review-mobile-top">
          <div>
            <span class="lb-overline">{{ t('weekResult') }}</span>
            <div class="lb-review-mobile-score"><strong>{{ weekPercent }}</strong><span>%</span></div>
            <p>{{ week.done }} / {{ week.total }} {{ t('todayDone') }}</p>
          </div>
          <span class="lb-review-mobile-status" :class="{ 'is-saved': storedReview }">
            <i :class="['bi', storedReview ? 'bi-check-circle' : 'bi-circle']" />
            {{ storedReview ? t('saved') : t('reviewNotSaved') }}
          </span>
        </div>
        <div class="lb-review-mobile-track" role="meter" :aria-label="t('weekResult')" :aria-valuenow="weekPercent" aria-valuemin="0" aria-valuemax="100">
          <div :style="{ width: `${weekPercent}%` }" />
        </div>
        <div class="lb-review-mobile-days" role="group" :aria-label="t('weekDays')">
          <button v-for="d in weekDays" :key="dateKey(d)" type="button"
            :class="['lb-review-mobile-day', { 'is-selected': selectedDay && dateKey(selectedDay) === dateKey(d), 'is-today': dateKey(d) === dateKey(new Date()) }]"
            :aria-label="`${fmt(d, { weekday:'long', day:'numeric', month:'long' })}, ${store.taskStats(d).done}/${store.taskStats(d).total}`"
            :aria-pressed="Boolean(selectedDay && dateKey(selectedDay) === dateKey(d))"
            @click="openDay(d)">
            <small>{{ weekday(d) }}</small>
            <strong>{{ d.getDate() }}</strong>
            <span class="lb-review-mobile-day-track"><span :style="{ width: `${store.taskStats(d).percent}%` }" /></span>
          </button>
        </div>
        <div class="lb-review-mobile-day-detail" aria-live="polite">
          <template v-if="selectedDay && selectedMetric">
            <span>{{ fmt(selectedDay, { weekday:'long', day:'numeric', month:'short' }) }} · {{ selectedMetric.done }}/{{ selectedMetric.total }}</span>
            <button type="button" @click="viewDay(selectedDay)">{{ t('todayTitle') }} <i class="bi bi-arrow-right" /></button>
          </template>
          <span v-else>{{ t('reviewMobileHint') }}</span>
        </div>
        <div class="lb-review-mobile-actions">
          <button type="button" class="lb-button lb-button-primary" @click="editDialogOpen = true">
            <i class="bi bi-pencil-square" />{{ t('reflect') }}
          </button>
          <button type="button" class="lb-button lb-button-outline" @click="insightsDialogOpen = true">
            <i class="bi bi-bar-chart-line" />{{ t('reviewAnalytics') }}
          </button>
        </div>
      </div>
    </section>

    <ReviewPulse class="lb-review-pulse-mobile" :days="dailyValues" :goals="goalStats" :week-percent="weekPercent" :stored-review="storedReview" @day="openDay" @reflect="editDialogOpen = true" @insights="insightsDialogOpen = true" />

    <div class="lb-review-desktop">
      <section class="lb-review-summary">
        <div class="lb-review-score">
          <p class="lb-overline">{{ t('weekResult') }}</p>
          <strong>{{ weekPercent }}<span>%</span></strong>
          <p>{{ week.done }} / {{ week.total }} {{ t('todayDone') }}</p>
          <div class="lb-progress-track"><div :style="{ width: `${weekPercent}%` }" /></div>
        </div>
        <div class="lb-review-mini">
          <p class="lb-overline">{{ t('weekDays') }}</p>
          <div class="lb-review-week-dots">
            <button v-for="d in weekDays" :key="dateKey(d)" type="button" class="lb-review-day-button"
              :class="{ 'is-selected': selectedDay && dateKey(selectedDay) === dateKey(d) }" @click="openDay(d)">
              <span :class="{ completed: store.taskStats(d).total && store.taskStats(d).done === store.taskStats(d).total, partial: store.taskStats(d).done > 0 }">{{ d.getDate() }}</span>
              <small>{{ weekday(d) }}</small>
            </button>
          </div>
          <p v-if="selectedDay" class="lb-day-detail">
            <strong>{{ store.taskStats(selectedDay).done }} / {{ store.taskStats(selectedDay).total }}</strong>
            <button type="button" class="lb-text-action" @click="viewDay(selectedDay)">{{ t('todayTitle') }} <i class="bi bi-arrow-right" /></button>
          </p>
          <p v-else class="lb-muted">{{ t('details') }}</p>
        </div>
      </section>
      <ReviewInsights :days="dailyValues" :goals="goalStats" @day="viewDay" />
      <div class="lb-review-grid">
        <section class="lb-panel lb-review-form">
          <div class="lb-panel-heading"><div><p class="lb-overline">{{ t('reflect') }}</p><h3>{{ t('reflect') }}</h3></div><span v-if="storedReview" class="lb-soft-badge">{{ t('saved') }}</span></div>
          <ReviewEditor :draft="form" :saved="saved" @save="save" />
        </section>
        <aside class="lb-review-side">
          <section class="lb-panel">
            <p class="lb-overline">{{ t('composition') }}</p><h3>{{ t('balance') }}</h3>
            <div v-for="entry in goalStats" :key="entry.goal.id" class="lb-review-area">
              <div class="lb-review-area-head"><span><i :class="['bi', store.getArea(entry.goal.areaId).icon]" :style="{ color: store.getArea(entry.goal.areaId).accent }" />{{ store.getAreaName(entry.goal.areaId, locale) }}</span><strong>{{ entry.done }}/{{ entry.total }}</strong></div>
              <div class="lb-progress-track"><div :style="{ width: `${entry.percent}%`, background: store.getArea(entry.goal.areaId).accent }" /></div>
            </div>
            <p class="lb-fineprint">{{ t('weekNotScore') }}</p>
          </section>
        </aside>
      </div>
    </div>

    <Dialog v-model:visible="editDialogOpen" modal :block-scroll="false" :dismissable-mask="true"
      :header="t('reflect')" :style="{ width: 'min(540px, calc(100vw - 16px))' }" class="lb-review-dialog">
      <ReviewEditor :draft="form" :saved="saved" @save="save" />
    </Dialog>
    <Dialog v-model:visible="insightsDialogOpen" modal :block-scroll="false" :dismissable-mask="true"
      :header="t('reviewAnalytics')" :style="{ width: 'min(640px, calc(100vw - 16px))' }" class="lb-review-dialog lb-review-insights-dialog">
      <ReviewInsights :days="dailyValues" :goals="goalStats" @day="viewDay" />
    </Dialog>
  </div>
</template>
