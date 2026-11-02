import type { RouteRecordRaw } from 'vue-router';

const layoutMeta = { layout: 'life', requiresAuth: true };
export const lifeRoutes: RouteRecordRaw[] = [
  { path: '/', name: 'life-dashboard', component: () => import('./views/LifeDashboard.vue'), meta: { ...layoutMeta, breadcrumb: 'Обзор' } },
  { path: '/today', name: 'life-today', component: () => import('./views/LifeToday.vue'), meta: { ...layoutMeta, breadcrumb: 'Сегодня' } },
  { path: '/life-goals', name: 'life-goals', component: () => import('./views/LifeGoals.vue'), meta: { ...layoutMeta, breadcrumb: 'Мои цели' } },
  { path: '/life-review', name: 'life-review', component: () => import('./views/LifeReview.vue'), meta: { ...layoutMeta, breadcrumb: 'Рефлексия' } },
  { path: '/profile', name: 'life-profile', component: () => import('@/modules/profile/views/ProfileView.vue'), meta: { ...layoutMeta, breadcrumb: 'Личный кабинет' } },
  { path: '/money', redirect: '/dashboard' },
];
