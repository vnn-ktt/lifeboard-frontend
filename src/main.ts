import { createRouter, createWebHistory } from 'vue-router';
import { createApp, watch } from 'vue';
import { createPinia } from 'pinia';

import PrimeVue from 'primevue/config';
import AnimateOnScroll from 'primevue/animateonscroll';
import ToastService from 'primevue/toastservice';
import App from '@/App.vue';

import { authRoutes } from '@/modules/auth/router';
import { RouteName } from '@/shared/constants/route-name';
import { lifeRoutes } from '@/modules/lifeboard/router';
import NotFound from '@/shared/components/NotFound.vue';

import { primeVueConfig } from '@/core/constants/prime-vue-config';
import ConfirmService from 'primevue/confirmationservice';
import { i18n } from '@/core/i18n';
import '@/index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useSettingsStore } from '@/shared/stores/useSettingsStore';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useThemeStore } from '@/shared/stores/useThemeStore';

const app = createApp(App);
const pinia = createPinia();
const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...lifeRoutes,
    { path: '/welcome', name: RouteName.HOME, redirect: '/' },
    ...authRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
    },
  ],
});

/** Route guard: redirect to login if route requires auth and user is not authenticated */
router.beforeEach((to) => {
  const authStore = useAuthStore(pinia);
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: RouteName.LOGIN, query: { redirect: to.fullPath } };
  }
  if (to.meta.layout === 'auth' && authStore.isAuthenticated) return { path: '/' };
});

app
  .use(pinia)
  .use(router)
  .use(PrimeVue, primeVueConfig)
  .use(ConfirmService)
  .use(ToastService)
  .directive('animateonscroll', AnimateOnScroll);

const settingsStore = useSettingsStore();
useThemeStore();

i18n.global.locale.value = settingsStore.currentLang;
watch(() => settingsStore.currentLang, (lang) => {
  document.documentElement.lang = lang;
  i18n.global.locale.value = lang;
}, { immediate: true });

app.use(i18n);

app.mount('#app');
