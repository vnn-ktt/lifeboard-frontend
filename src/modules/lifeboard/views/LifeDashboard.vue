<script setup lang="ts">
import { computed } from 'vue';
import { useLifeStore } from '../stores/useLifeStore';
import { dateKey, formatDay, getWeekStart, shiftDays } from '../date';
import LifeTask from '../components/LifeTask.vue';

const store = useLifeStore();
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
  if (todayStats.value.total === todayStats.value.done) return 'Сегодня ты уже сделал всё запланированное. Хорошая работа.';
  if (todayStats.value.done > 0) return 'Продолжай в своём темпе. Маленькие шаги складываются в результат.';
  return 'Не всё сразу. Начни с одного небольшого действия.';
});
</script>

<template>
  <div class="lb-screen">
    <div class="lb-page-top"><div><p class="lb-overline">ТВОЙ ЦЕНТР УПРАВЛЕНИЯ</p><h1>Жизнь, которой ты управляешь.</h1><p class="lb-muted">Один день за другим — без гонки за идеальностью.</p></div><RouterLink class="lb-button lb-button-outline" to="/life-goals"><i class="bi bi-sliders2" aria-hidden="true" /> Настроить цели</RouterLink></div>

    <section class="lb-hero">
      <div class="lb-hero-copy"><span class="lb-hero-pill"><i class="bi bi-circle-fill" aria-hidden="true" /> ТВОЙ ФОКУС · {{ formatDay(day, { month: 'long', year: 'numeric' }).toUpperCase() }}</span><h2>Меньше шума.<br /><em>Больше своей жизни.</em></h2><p>{{ dailyStatement }}</p><RouterLink to="/today" class="lb-hero-cta">Перейти к сегодняшнему дню <i class="bi bi-arrow-up-right" aria-hidden="true" /></RouterLink></div>
      <div class="lb-hero-progress"><div class="lb-progress-ring" :style="{ '--progress': `${todayStats.percent}%` }"><div><strong>{{ todayStats.percent }}<small>%</small></strong><span>сегодня</span></div></div><p>{{ todayStats.done }} из {{ todayStats.total }} дел выполнено</p></div>
      <span class="lb-hero-orbit lb-hero-orbit--one" /><span class="lb-hero-orbit lb-hero-orbit--two" />
    </section>

    <div class="lb-kpi-grid">
      <div class="lb-kpi"><span class="lb-kpi-icon lb-kpi-icon--green"><i class="bi bi-check2-circle" /></span><div><small>Задач сегодня</small><strong>{{ todayStats.done }} <span>/ {{ todayStats.total }}</span></strong></div></div>
      <div class="lb-kpi"><span class="lb-kpi-icon lb-kpi-icon--purple"><i class="bi bi-calendar-week" /></span><div><small>Прогресс недели</small><strong>{{ weekPercent }}<span>%</span></strong></div></div>
      <div class="lb-kpi"><span class="lb-kpi-icon lb-kpi-icon--orange"><i class="bi bi-bullseye" /></span><div><small>Целей в фокусе</small><strong>{{ store.focusGoals.length }}<span> активных</span></strong></div></div>
    </div>

    <div class="lb-dashboard-grid">
      <section class="lb-panel lb-today-panel"><div class="lb-panel-heading"><div><p class="lb-overline">МАЛЕНЬКИЕ ШАГИ</p><h3>План на сегодня <span class="lb-heading-date">{{ formatDay(day) }}</span></h3></div><RouterLink to="/today" class="lb-text-action">Все дни <i class="bi bi-arrow-right" /></RouterLink></div>
        <div v-if="todayTasks.length" class="lb-tasks"><LifeTask v-for="task in todayTasks" :key="task.id" :task="task" :date="day" /></div><div v-else class="lb-empty">Сегодня нет обязательных дел. Можно отдохнуть.</div>
        <div class="lb-panel-foot"><i class="bi bi-lightbulb" aria-hidden="true" /> Не успел сегодня? Это не обнуляет предыдущий прогресс.</div>
      </section>

      <section class="lb-panel lb-week-panel"><div class="lb-panel-heading"><div><p class="lb-overline">ВИДНО ПРОГРЕСС</p><h3>Эта неделя</h3></div><span class="lb-soft-badge">{{ week.done }} / {{ week.total }}</span></div>
        <div class="lb-week-bars"><div v-for="item in days" :key="dateKey(item)" class="lb-week-day" :class="{ 'is-today': dateKey(item) === dateKey(day) }"><div class="lb-week-bar"><div :style="{ height: `${store.taskStats(item).percent}%` }" /></div><span>{{ formatDay(item, { weekday: 'short' }).replace('.', '') }}</span><small>{{ item.getDate() }}</small></div></div>
        <div class="lb-week-note"><span class="lb-week-note-icon"><i class="bi bi-graph-up-arrow" /></span><p><strong>Твой темп важнее рекордов.</strong><br />Мы считаем реальные действия, а не красивые обещания.</p></div>
      </section>
    </div>

    <section class="lb-goals-section"><div class="lb-panel-heading"><div><p class="lb-overline">ЧТО СЕЙЧАС ВАЖНО</p><h3>Три направления месяца</h3></div><RouterLink to="/life-goals" class="lb-text-action">Управлять <i class="bi bi-arrow-right" /></RouterLink></div>
      <div class="lb-goals-grid"><article v-for="goal in activeGoals" :key="goal.id" class="lb-goal-card"><div class="lb-goal-card-top"><span class="lb-area-icon" :style="{ color: store.getArea(goal.areaId).accent, background: store.getArea(goal.areaId).subtle }"><i :class="['bi', store.getArea(goal.areaId).icon]" /></span><span class="lb-goal-percent">{{ store.goalStats(goal, day).percent }}%</span></div><span class="lb-goal-area">{{ store.getArea(goal.areaId).name }}</span><h4>{{ goal.title }}</h4><p>{{ goal.description }}</p><div class="lb-progress-track"><div :style="{ width: `${store.goalStats(goal, day).percent}%`, background: store.getArea(goal.areaId).accent }" /></div><div class="lb-goal-bottom"><span>{{ store.goalStats(goal, day).done }} / {{ goal.target }} действий</span><i class="bi bi-arrow-up-right" aria-hidden="true" /></div></article>
        <RouterLink v-if="!activeGoals.length" to="/life-goals" class="lb-goal-card lb-add-goal"><i class="bi bi-plus-circle" /><span>Добавь первую цель</span></RouterLink>
      </div>
    </section>

    <div class="lb-lower-grid"><section class="lb-panel lb-vision-card"><span class="lb-vision-icon"><i class="bi bi-compass" /></span><div><p class="lb-overline">РАДИ ЧЕГО ВСЁ ЭТО</p><h3>Твой ориентир на 5 лет</h3><p>{{ store.vision }}</p></div><RouterLink to="/life-goals" title="Редактировать видение"><i class="bi bi-arrow-up-right" /></RouterLink></section><section class="lb-panel lb-review-prompt"><span class="lb-review-graphic"><i class="bi bi-journal-check" /></span><div><p class="lb-overline">ЕЖЕНЕДЕЛЬНЫЙ РАЗБОР</p><h3>{{ recentReview ? 'Прошлый разбор сохранён' : 'Не забудь оглянуться назад' }}</h3><p>Что удалось? Что мешало? Что стоит упростить?</p></div><RouterLink to="/life-review" class="lb-button lb-button-dark">Открыть обзор <i class="bi bi-arrow-right" /></RouterLink></section></div>
  </div>
</template>
