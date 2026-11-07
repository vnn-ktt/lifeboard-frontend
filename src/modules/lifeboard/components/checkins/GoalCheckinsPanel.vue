<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useLifeStore } from '../../stores/useLifeStore';
import { useLifeI18n } from '../../i18n';
import { useGoalCheckinI18n } from '../../goalCheckinI18n';
import { dateKey, getWeekStart, parseDate, shiftDays } from '../../date';
import { nextGoalCheckinDate } from '../../utils/goalCheckins';
import { formatGoalValue } from '../../utils/goalMetrics';
import type { GoalCheckinStatus, PendingGoalCheckin, LifeGoal } from '../../types';

const store = useLifeStore();
const { titleFor } = useLifeI18n();
const { ct, locale } = useGoalCheckinI18n();
const now = ref(new Date());
const opened = ref<string | null>(null);
const value = ref<number>(0);
const note = ref('');
const error = ref('');
const success = ref('');
let timer: number | undefined;

onMounted(() => { timer = window.setInterval(() => { now.value = new Date(); }, 60_000); });
onBeforeUnmount(() => { if (timer !== undefined) window.clearInterval(timer); });

const pending = computed(() => store.dueGoalCheckins(now.value));
const measuredGoals = computed(() => store.goals.filter(goal =>
  goal.measurement && goal.measurement.kind !== 'activity' &&
  (goal.checkin?.frequency === 'daily' || goal.checkin?.frequency === 'weekly') &&
  !store.goalStats(goal, now.value).outcome?.complete,
));
const upcoming = computed(() => measuredGoals.value
  .map(goal => {
    const today = dateKey(now.value);
    const date = nextGoalCheckinDate(goal, today);
    const resolvedToday = date === today && store.goalCheckins.some(item => item.goalId === goal.id && item.dueDate === today);
    return { goal, date: resolvedToday ? nextGoalCheckinDate(goal, dateKey(shiftDays(now.value, 1))) : date };
  })
  .filter((item): item is { goal: LifeGoal; date: string } => !!item.date)
  .sort((a, b) => a.date.localeCompare(b.date))[0]);
const thisWeek = computed(() => store.goalCheckins.filter(entry =>
  dateKey(new Date(entry.completedAt)) >= dateKey(getWeekStart(now.value)),
).length);
const totalDue = computed(() => pending.value.reduce((sum, item) => sum + item.pendingCount, 0));
const formatDate = (date: string) => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short', weekday: 'short' }).format(parseDate(date));
const formatValue = (item: PendingGoalCheckin) => {
  const result = store.goalStats(item.goal, now.value).outcome;
  return result?.kind === 'binary' ? (result.complete ? ct('achieved') : '—')
    : result ? formatGoalValue(result.current, result.unit, locale.value) : '—';
};
function open(item: PendingGoalCheckin) {
  const result = store.goalStats(item.goal, now.value).outcome;
  value.value = result?.current ?? 0;
  note.value = '';
  error.value = '';
  success.value = '';
  opened.value = `${item.goal.id}|${item.dueDate}`;
}
function close() { opened.value = null; error.value = ''; note.value = ''; }
function finish(item: PendingGoalCheckin, status: GoalCheckinStatus, result?: number) {
  error.value = '';
  success.value = '';
  if (!store.completeGoalCheckin(item.goal.id, item.dueDate, status, result, note.value)) {
    error.value = ct('error');
    return;
  }
  success.value = ct('completed');
  close();
}
</script>

<template>
  <section v-if="measuredGoals.length || pending.length" class="lb-panel lb-checkins-panel" :aria-label="ct('title')">
    <header class="lb-checkins-head">
      <div class="lb-checkins-intro">
        <span class="lb-checkins-icon" aria-hidden="true"><i class="bi bi-clipboard2-check" /></span>
        <div><p class="lb-overline">{{ ct('scheduleTitle') }}</p><h2>{{ ct('title') }}</h2><p>{{ ct('intro') }}</p></div>
      </div>
      <span class="lb-soft-badge">{{ totalDue }} {{ ct('pending') }}</span>
    </header>

    <div v-if="pending.length" class="lb-checkins-list">
      <article v-for="item in pending" :key="`${item.goal.id}-${item.dueDate}`" class="lb-checkin-item" :class="{ 'is-overdue': item.overdue }">
        <div class="lb-checkin-info">
          <div class="lb-checkin-title-row"><strong>{{ titleFor(item.goal) }}</strong>
            <span :class="['lb-checkin-due', { 'is-overdue': item.overdue }]">{{ item.overdue ? ct('overdue') : ct('due') }} · {{ formatDate(item.dueDate) }}</span>
          </div>
          <div class="lb-checkin-meta"><span>{{ ct('current') }}: <b>{{ formatValue(item) }}</b></span><span>{{ store.goalStats(item.goal, now).percent }}%</span>
            <span v-if="item.pendingCount > 1">+{{ item.pendingCount - 1 }} · {{ ct('more') }}</span>
          </div>
        </div>
        <div v-if="opened !== `${item.goal.id}|${item.dueDate}`" class="lb-checkin-actions">
          <button v-if="item.goal.measurement?.kind === 'numeric'" class="lb-button lb-button-primary" type="button" @click="open(item)"><i class="bi bi-pencil-square" />{{ ct('update') }}</button>
          <button v-else type="button" class="lb-button lb-button-primary" @click="finish(item, 'updated', 1)"><i class="bi bi-check2-circle" />{{ ct('achieved') }}</button>
          <button type="button" class="lb-button lb-button-outline" @click="finish(item, 'unchanged')">{{ ct('unchanged') }}</button>
          <button type="button" class="lb-button lb-checkin-skip" @click="finish(item, 'skipped')">{{ ct('skip') }}</button>
        </div>
        <form v-else class="lb-checkin-entry" @submit.prevent="finish(item, 'updated', value)">
          <label class="lb-checkin-field">{{ ct('value') }} <span class="lb-required-mark" aria-hidden="true">*</span>
            <input v-model.number="value" type="number" step="any" class="lb-input" required />
          </label>
          <label class="lb-checkin-field lb-checkin-note">{{ ct('note') }}
            <input v-model="note" class="lb-input" maxlength="300" type="text" />
          </label>
          <div class="lb-checkin-actions"><button class="lb-button lb-button-primary" type="submit">{{ ct('save') }}</button>
            <button class="lb-button lb-button-outline" type="button" @click="close">{{ ct('cancel') }}</button>
          </div>
        </form>
      </article>
      <p class="lb-checkins-footnote"><i class="bi bi-info-circle" aria-hidden="true" />{{ ct('pendingHint') }}</p>
    </div>
    <div v-else class="lb-checkins-clear"><i class="bi bi-check2-circle" aria-hidden="true" /><strong>{{ ct('allDone') }}</strong>
      <span v-if="upcoming">{{ ct('next') }}: {{ formatDate(upcoming.date) }}</span>
      <span v-if="thisWeek">{{ ct('completed') }}: {{ thisWeek }}</span>
    </div>
    <p v-if="error" class="lb-error" role="alert">{{ error }}</p>
    <p v-if="success" class="lb-save-message" role="status">{{ success }}</p>
  </section>
</template>
