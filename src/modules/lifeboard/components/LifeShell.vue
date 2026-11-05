<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppBreadcrumbs from '@/shared/components/Breadcrumbs/AppBreadcrumbs.vue';
import UserMenu from '@/shared/components/User/UserMenu.vue';
import LifeboardLogo from '@/shared/components/Brand/LifeboardLogo.vue';
import HeaderCalendar from '@/shared/components/Calendar/HeaderCalendar.vue';
import FocusManager from './FocusManager.vue';
import JakkLauncher from './JakkLauncher.vue';
import { useLifeStore } from '../stores/useLifeStore';
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
  { path: '/life-review', label: t('review'), icon: 'bi-journal-text' },
  { path: '/quotes', label: t('quoteArchive'), icon: 'bi-quote' },
]);

// Five essential destinations on phones; quotes remain available from the quote cards.
const mobileMenu = computed(() => menu.value.filter((item) => item.path !== '/quotes'));
const topGoals = computed(() => store.focusGoals.slice(0, 3));

</script>

<template>
  <div class="lb-root" :class="{ 'lb-private': privacy.maskStats }">
    <aside class="lb-sidebar">
      <RouterLink to="/" class="lb-brand" aria-label="Lifeboard — на главную">
        <LifeboardLogo />
      </RouterLink>
      <div class="lb-sidebar-section lb-sidebar-section--workspace">{{ t('space') }}</div>
      <nav class="lb-menu" aria-label="Основная навигация">
        <template v-for="item in menu" :key="item.path">
          <div v-if="item.path === '/life-review'" class="lb-menu-divider" role="separator" />
          <RouterLink :to="item.path" :class="['lb-nav-item', { 'is-active': route.path === item.path }]">
          <i :class="['bi', item.icon]" aria-hidden="true" />
          <span>{{ item.label }}</span>
            <i v-if="route.path === item.path" class="bi bi-arrow-up-right lb-nav-arrow" aria-hidden="true" />
          </RouterLink>
        </template>
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
      <div class="lb-sidebar-bottom">
        <RouterLink to="/money" class="lb-money-link"><i class="bi bi-wallet2" aria-hidden="true" /> {{ t('finance') }} · Budgee <i class="bi bi-arrow-up-right" aria-hidden="true" /></RouterLink>
        <span class="lb-version">LIFEBOARD · 0.14.2</span>
      </div>
    </aside>

    <div class="lb-body">
      <header class="lb-header lb-header--centered lb-header--profile-right">
        <AppBreadcrumbs :root-label="t('overview')" root-to="/" />
        <HeaderCalendar />
        <div class="lb-header-right">
          <UserMenu />
        </div>
      </header>
      <main class="lb-main"><slot /></main>
      <JakkLauncher />
    </div>

    <nav class="lb-mobile-nav" aria-label="Мобильная навигация">
      <RouterLink v-for="item in mobileMenu" :key="item.path" :to="item.path" :class="{ 'is-active': route.path === item.path }"><i :class="['bi', item.icon]" aria-hidden="true" /><span>{{ item.label }}</span></RouterLink>
    </nav>
  </div>
</template>
