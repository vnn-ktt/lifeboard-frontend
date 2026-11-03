<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AppBreadcrumbs from '@/shared/components/Breadcrumbs/AppBreadcrumbs.vue';
import UserMenu from '@/shared/components/User/UserMenu.vue';
import LifeboardLogo from '@/shared/components/Brand/LifeboardLogo.vue';
import LifeThemeSwitcher from '@/shared/components/Theme/LifeThemeSwitcher.vue';
import FocusManager from './FocusManager.vue';
import AiConsultDialog from './AiConsultDialog.vue';
import QuoteSpot from './quotes/QuoteSpot.vue';
import { useLifeStore } from '../stores/useLifeStore';
import type { QuotePlacement } from '../types';
import { useLifeI18n } from '../i18n';
import { usePrivacyStore } from '@/shared/stores/usePrivacyStore';

const route = useRoute();
const store = useLifeStore();
const { t, locale } = useLifeI18n();
const privacy = usePrivacyStore();
const menu = computed(() => [
  { path: '/', label: t('overview'), icon: 'bi-grid-1x2' },
  { path: '/today', label: t('today'), icon: 'bi-check2-square' },
  { path: '/life-goals', label: t('goals'), icon: 'bi-bullseye' },
  { path: '/notes', label: t('notesTitlePage'), icon: 'bi-stickies' },
  { path: '/quotes', label: { ru: 'Цитаты', en: 'Quotes', de: 'Zitate' }[locale.value.slice(0,2) as 'ru'|'en'|'de'] ?? 'Quotes', icon: 'bi-quote' },
  { path: '/life-review', label: t('review'), icon: 'bi-journal-text' },
]);

const now = ref(new Date());
let timer: number | undefined;
onMounted(() => { timer = window.setInterval(() => { now.value = new Date(); }, 1000); });
onBeforeUnmount(() => { if (timer) window.clearInterval(timer); });

const todayLabel = computed(() => new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now.value));
const timeLabel = computed(() => new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(now.value));
const clockStyle = computed(() => {
  const minutes = now.value.getMinutes();
  const hours = now.value.getHours() % 12;
  return {
    '--lb-hour-rotation': `${hours * 30 + minutes * 0.5}deg`,
    '--lb-minute-rotation': `${minutes * 6}deg`,
  } as Record<string, string>
});
const topGoals = computed(() => store.focusGoals.slice(0, 3));
const currentQuotePlacement = computed<QuotePlacement>(() => {
  if (route.path.startsWith('/today')) return 'today';
  if (route.path.startsWith('/life-goals')) return 'goals';
  if (route.path.startsWith('/life-review')) return 'review';
  if (route.path.startsWith('/notes')) return 'notes';
  if (route.path.startsWith('/quotes')) return 'notes';
  if (route.path.startsWith('/profile')) return 'profile';
  return 'dashboard';
});

</script>

<template>
  <div class="lb-root" :class="{ 'lb-private': privacy.maskStats }">
    <aside class="lb-sidebar">
      <RouterLink to="/" class="lb-brand" aria-label="Lifeboard — на главную">
        <LifeboardLogo />
      </RouterLink>
      <div class="lb-sidebar-section">{{ t('space') }}</div>
      <nav class="lb-menu" aria-label="Основная навигация">
        <RouterLink v-for="item in menu" :key="item.path" :to="item.path" :class="['lb-nav-item', { 'is-active': route.path === item.path }]">
          <i :class="['bi', item.icon]" aria-hidden="true" />
          <span>{{ item.label }}</span>
          <i v-if="route.path === item.path" class="bi bi-arrow-up-right lb-nav-arrow" aria-hidden="true" />
        </RouterLink>
      </nav>
      <div class="lb-sidebar-focus">
        <div class="lb-sidebar-section lb-focus-heading"><span>{{ t('focus') }}</span><FocusManager compact /></div>
        <div v-for="goal in topGoals" :key="goal.id" class="lb-sidebar-goal">
          <span class="lb-sidebar-goal-name"><span class="lb-sidebar-dot" :style="{ background: store.getArea(goal.areaId).accent }" />{{ store.getAreaName(goal.areaId, locale) }}</span>
          <span>{{ privacy.maskStats ? '••' : store.goalStats(goal).percent + '%' }}</span>
          <div class="lb-track"><div :style="{ width: `${store.goalStats(goal).percent}%`, background: store.getArea(goal.areaId).accent }" /></div>
        </div>
        <p v-if="!topGoals.length" class="lb-focus-empty">{{ t('focusEmpty') }}</p>
      </div>
      <QuoteSpot :placement="currentQuotePlacement" compact />
      <div class="lb-sidebar-bottom">
        <RouterLink to="/money" class="lb-money-link"><i class="bi bi-wallet2" aria-hidden="true" /> {{ t('finance') }} · Budgee <i class="bi bi-arrow-up-right" aria-hidden="true" /></RouterLink>
        <span class="lb-version">LIFEBOARD · 0.11</span>
      </div>
    </aside>

    <div class="lb-body">
      <header class="lb-header lb-header--centered">
        <AppBreadcrumbs :root-label="t('overview')" root-to="/" />
        <div class="lb-header-center">
          <div class="lb-header-clock" :style="clockStyle" aria-hidden="true">
            <span class="lb-header-clock__dot"></span>
            <span class="lb-header-clock__hand lb-header-clock__hand--hour"></span>
            <span class="lb-header-clock__hand lb-header-clock__hand--minute"></span>
          </div>
          <div class="lb-header-date-wrap">
            <span class="lb-header-time">{{ timeLabel }}</span>
            <span class="lb-header-date">{{ todayLabel }}</span>
          </div>
        </div>
        <div class="lb-header-right">
          <AiConsultDialog />
          <LifeThemeSwitcher />
          <UserMenu />
        </div>
      </header>
      <main class="lb-main"><slot /></main>
    </div>

    <nav class="lb-mobile-nav" aria-label="Мобильная навигация">
      <RouterLink v-for="item in menu.slice(0, 5)" :key="item.path" :to="item.path" :class="{ 'is-active': route.path === item.path }"><i :class="['bi', item.icon]" aria-hidden="true" /><span>{{ item.label }}</span></RouterLink>
    </nav>
  </div>
</template>
