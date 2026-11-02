<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useLifeStore } from '../stores/useLifeStore';

const route = useRoute();
const store = useLifeStore();
const menu = [
  { path: '/', label: 'Обзор', icon: 'bi-grid-1x2' },
  { path: '/today', label: 'Сегодня', icon: 'bi-check2-square' },
  { path: '/life-goals', label: 'Мои цели', icon: 'bi-bullseye' },
  { path: '/life-review', label: 'Рефлексия', icon: 'bi-journal-text' },
];
const todayLabel = computed(() => new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()));
const pageLabel = computed(() => menu.find((item) => item.path === route.path)?.label ?? 'Lifeboard');
const topGoals = computed(() => store.focusGoals.slice(0, 3));
</script>

<template>
  <div class="lb-root">
    <aside class="lb-sidebar">
      <RouterLink to="/" class="lb-brand" aria-label="Lifeboard — на главную">
        <span class="lb-brand-mark"><i class="bi bi-layers-half" aria-hidden="true" /></span>
        <span><strong>Lifeboard</strong><small>YOUR PERSONAL OS</small></span>
      </RouterLink>
      <div class="lb-sidebar-section">ПРОСТРАНСТВО</div>
      <nav class="lb-menu" aria-label="Основная навигация">
        <RouterLink v-for="item in menu" :key="item.path" :to="item.path" :class="['lb-nav-item', { 'is-active': route.path === item.path }]">
          <i :class="['bi', item.icon]" aria-hidden="true" />
          <span>{{ item.label }}</span>
          <i v-if="route.path === item.path" class="bi bi-arrow-up-right lb-nav-arrow" aria-hidden="true" />
        </RouterLink>
      </nav>
      <div class="lb-sidebar-focus">
        <div class="lb-sidebar-section">ФОКУС МЕСЯЦА <span>до 3 целей</span></div>
        <div v-for="goal in topGoals" :key="goal.id" class="lb-sidebar-goal">
          <span class="lb-sidebar-goal-name"><span class="lb-sidebar-dot" :style="{ background: store.getArea(goal.areaId).accent }" />{{ store.getArea(goal.areaId).name }}</span>
          <span>{{ store.goalStats(goal).percent }}%</span>
          <div class="lb-track"><div :style="{ width: `${store.goalStats(goal).percent}%`, background: store.getArea(goal.areaId).accent }" /></div>
        </div>
      </div>
      <div class="lb-sidebar-bottom">
        <div class="lb-sidebar-quote"><i class="bi bi-stars" aria-hidden="true" /><p>Не нужно успеть всё.<br />Нужно двигаться в своём направлении.</p></div>
        <RouterLink to="/money" class="lb-money-link"><i class="bi bi-wallet2" aria-hidden="true" /> Финансы из Budgee <i class="bi bi-arrow-up-right" aria-hidden="true" /></RouterLink>
        <span class="lb-version">LIFEBOARD · MVP 0.1</span>
      </div>
    </aside>

    <div class="lb-body">
      <header class="lb-header">
        <div class="lb-breadcrumb"><span>Моё пространство</span><i class="bi bi-chevron-right" aria-hidden="true" /><strong>{{ pageLabel }}</strong></div>
        <div class="lb-header-right"><span class="lb-header-date">{{ todayLabel }}</span><span class="lb-avatar" title="Локальное пространство">Я</span></div>
      </header>
      <main class="lb-main"><slot /></main>
    </div>

    <nav class="lb-mobile-nav" aria-label="Мобильная навигация">
      <RouterLink v-for="item in menu" :key="item.path" :to="item.path" :class="{ 'is-active': route.path === item.path }"><i :class="['bi', item.icon]" aria-hidden="true" /><span>{{ item.label }}</span></RouterLink>
    </nav>
  </div>
</template>
