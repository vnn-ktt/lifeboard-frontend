<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLifeStore } from '../stores/useLifeStore';
import { dateKey, formatDay, getWeekStart, shiftDays } from '../date';
import LifeTask from '../components/LifeTask.vue';

const store = useLifeStore();
const selected = ref(new Date());
const today = new Date();
const dates = computed(() => store.weekDays(selected.value));
const tasks = computed(() => store.dayTasks(selected.value));
const stats = computed(() => store.taskStats(selected.value));
const weekFrom = computed(() => formatDay(getWeekStart(selected.value), { day: 'numeric', month: 'short' }));
const weekTo = computed(() => formatDay(shiftDays(getWeekStart(selected.value), 6), { day: 'numeric', month: 'short' }));
function go(offset: number) { selected.value = shiftDays(selected.value, offset); }
function selectDate(day: Date) { selected.value = new Date(day); }
</script>

<template>
  <div class="lb-screen">
    <div class="lb-page-top"><div><p class="lb-overline">ДЕЛАЙ ТО, ЧТО ВАЖНО</p><h1>Твой день</h1><p class="lb-muted">Несколько простых действий. Никакой гонки за галочками.</p></div><button class="lb-button lb-button-outline" @click="selected = new Date()"><i class="bi bi-calendar-check" /> Вернуться к сегодня</button></div>
    <section class="lb-panel lb-planner">
      <div class="lb-planner-top"><div><p class="lb-overline">НЕДЕЛЬНЫЙ ПЛАН</p><h2>{{ weekFrom }} — {{ weekTo }}</h2></div><div class="lb-stepper"><button aria-label="Предыдущая неделя" @click="go(-7)"><i class="bi bi-chevron-left" /></button><button aria-label="Следующая неделя" @click="go(7)"><i class="bi bi-chevron-right" /></button></div></div>
      <div class="lb-day-selector"><button v-for="d in dates" :key="dateKey(d)" :class="['lb-day-tile', { 'is-active': dateKey(d) === dateKey(selected), 'is-current': dateKey(d) === dateKey(today) }]" @click="selectDate(d)"><span>{{ formatDay(d, { weekday: 'short' }).replace('.', '') }}</span><strong>{{ d.getDate() }}</strong><span class="lb-day-dot" :class="{ done: store.taskStats(d).total && store.taskStats(d).done === store.taskStats(d).total }" /></button></div>
    </section>
    <div class="lb-today-grid">
      <section class="lb-panel lb-daily-checklist"><div class="lb-panel-heading"><div><p class="lb-overline">НА СЕГОДНЯ</p><h3>{{ formatDay(selected, { day: 'numeric', month: 'long', weekday: 'long' }) }}</h3></div><span class="lb-soft-badge">{{ stats.done }} / {{ stats.total }}</span></div><div class="lb-progress-track lb-daily-track"><div :style="{ width: `${stats.percent}%` }" /></div><div class="lb-tasks" v-if="tasks.length"><LifeTask v-for="task in tasks" :key="task.id" :date="selected" :task="task" /></div><div v-else class="lb-empty">На этот день нет запланированных повторяющихся действий.</div><div class="lb-panel-foot"><i class="bi bi-heart" /> Цель — устойчивый ритм, а не 100% каждый день.</div></section>
      <aside class="lb-daily-aside"><section class="lb-panel lb-aside-card"><span class="lb-aside-icon"><i class="bi bi-clock-history" /></span><p class="lb-overline">НАГРУЗКА НА ДЕНЬ</p><h3>{{ tasks.reduce((sum, item) => sum + item.durationMinutes, 0) }} <small>минут</small></h3><p>Это время уже заложено в твоё обычное расписание, а не дополнительная смена вечером.</p><div class="lb-divider" /><p class="lb-overline">ОБЯЗАТЕЛЬНЫЙ МИНИМУМ</p><p>Две прогулки с собаками. В будни — развитие backend и одно лидерское действие.</p></section><section class="lb-aside-tip"><i class="bi bi-lightbulb" /><p><strong>Правило одного шага.</strong><br />Когда нет сил, сделай упрощённую версию задачи и возвращайся к режиму завтра.</p></section></aside>
    </div>
  </div>
</template>
