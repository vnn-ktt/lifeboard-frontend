<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLifeI18n } from '../i18n';
import { useLifeStore } from '../stores/useLifeStore';
import { dateKey, getWeekStart, shiftDays } from '../date';
import LifeTask from '../components/LifeTask.vue';
import GoalCheckinsPanel from '../components/checkins/GoalCheckinsPanel.vue';
import { useGoalWorkflowI18n } from '../goalWorkflowI18n';

const store = useLifeStore();
const { words: wf } = useGoalWorkflowI18n();
const oneTimeTasks = computed(() => store.goalTasksOnDay(selected.value));
const route=useRoute();
const {t,locale}=useLifeI18n();
const fmt=(d:Date,o:Intl.DateTimeFormatOptions={day:'numeric',month:'long'})=>new Intl.DateTimeFormat(locale.value,o).format(d);
function fromQuery(input:unknown):Date { const str=typeof input==='string'?input:''; if(!/^\d{4}-\d{2}-\d{2}$/.test(str))return new Date(); const date=new Date(`${str}T12:00:00`);return Number.isNaN(date.getTime())?new Date():date; }
const selected = ref(fromQuery(route.query.date));
watch(()=>route.query.date,(date)=>{if(date)selected.value=fromQuery(date);});
const today = new Date();
const dates = computed(() => store.weekDays(selected.value));
const tasks = computed(() => store.dayTasks(selected.value));
const stats = computed(() => store.taskStats(selected.value));
const weekFrom = computed(() => fmt(getWeekStart(selected.value), { day: 'numeric', month: 'short' }));
const weekTo = computed(() => fmt(shiftDays(getWeekStart(selected.value), 6), { day: 'numeric', month: 'short' }));
function go(offset: number) { selected.value = shiftDays(selected.value, offset); }
function selectDate(day: Date) { selected.value = new Date(day); }
</script>

<template>
  <div class="lb-screen">
    <div class="lb-page-top"><div><p class="lb-overline">ДЕЛАЙ ТО, ЧТО ВАЖНО</p><h1>{{ t('todayTitle') }}</h1><p class="lb-muted">{{ t('todaySub') }}</p></div><button class="lb-button lb-button-outline" @click="selected = new Date()"><i class="bi bi-calendar-check" /> {{ t('backToday') }}</button></div>
    <section class="lb-panel lb-planner">
      <div class="lb-planner-top"><div><p class="lb-overline">{{ t('weeklyPlan') }}</p><h2>{{ weekFrom }} — {{ weekTo }}</h2></div><div class="lb-stepper"><button aria-label="Предыдущая неделя" @click="go(-7)"><i class="bi bi-chevron-left" /></button><button aria-label="Следующая неделя" @click="go(7)"><i class="bi bi-chevron-right" /></button></div></div>
      <div class="lb-day-selector"><button v-for="d in dates" :key="dateKey(d)" :class="['lb-day-tile', { 'is-active': dateKey(d) === dateKey(selected), 'is-current': dateKey(d) === dateKey(today) }]" @click="selectDate(d)"><span>{{ fmt(d, { weekday: 'short' }).replace('.', '') }}</span><strong>{{ d.getDate() }}</strong><span class="lb-day-dot" :class="{ done: store.taskStats(d).total && store.taskStats(d).done === store.taskStats(d).total }" /></button></div>
    </section>
    <GoalCheckinsPanel />
    <section v-if="oneTimeTasks.length" class="lb-panel lb-one-time-panel">
      <div class="lb-panel-heading"><div><p class="lb-overline">{{ wf.newTask }}</p><h3>{{ wf.openTasks }}</h3></div><span class="lb-soft-badge">{{ oneTimeTasks.filter(item => !!item.completedAt).length }} / {{ oneTimeTasks.length }}</span></div>
      <div v-for="task in oneTimeTasks" :key="task.id" class="lb-one-time-row" :class="{ 'is-done': !!task.completedAt }">
        <input type="checkbox" :checked="!!task.completedAt" :aria-label="task.title" @change="store.toggleGoalTask(task.id)" />
        <span><strong>{{ task.title }}</strong><small>{{ store.goals.find(goal => goal.id === task.goalId)?.title }} · {{ task.dueDate || wf.taskNoDate }} <em v-if="!task.completedAt && task.dueDate && task.dueDate < dateKey(new Date())" class="lb-one-time-overdue">{{ wf.taskOverdue }}</em></small></span>
        <RouterLink :to="{ path: '/life-goals', hash: `#goal-${task.goalId}` }" :aria-label="wf.goalTitle"><i class="bi bi-arrow-up-right" /></RouterLink>
      </div>
    </section>
    <div class="lb-today-grid">
      <section class="lb-panel lb-daily-checklist"><div class="lb-panel-heading"><div><p class="lb-overline">{{ t('planned') }}</p><h3>{{ fmt(selected, { day: 'numeric', month: 'long', weekday: 'long' }) }}</h3></div><span class="lb-soft-badge">{{ stats.done }} / {{ stats.total }}</span></div><div class="lb-progress-track lb-daily-track"><div :style="{ width: `${stats.percent}%` }" /></div><div class="lb-tasks" v-if="tasks.length"><LifeTask v-for="task in tasks" :key="task.id" :date="selected" :task="task" /></div><div v-else class="lb-empty">{{ t('noTasks') }}</div><div class="lb-panel-foot"><i class="bi bi-heart" /> {{ t('sustainable') }}</div></section>
      <aside class="lb-daily-aside"><section class="lb-panel lb-aside-card"><span class="lb-aside-icon"><i class="bi bi-clock-history" /></span><p class="lb-overline">{{ t('dayLoad') }}</p><h3>{{ tasks.reduce((sum, item) => sum + item.durationMinutes, 0) }} <small>минут</small></h3><p>{{ t('actionSummary') }}</p><div class="lb-divider" /><p class="lb-overline">{{ t('dailyMinimum') }}</p><p>{{ t('dogsAndWork') }}</p></section><section class="lb-aside-tip"><i class="bi bi-lightbulb" /><p><strong>Правило одного шага.</strong><br />Когда нет сил, сделай упрощённую версию задачи и возвращайся к режиму завтра.</p></section></aside>
    </div>
  </div>
</template>
