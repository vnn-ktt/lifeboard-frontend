import type { RouteRecordRaw } from 'vue-router';

export const lifeRoutes: RouteRecordRaw[] = [
  { path: '/', name: 'life-dashboard', component: () => import('./views/LifeDashboard.vue'), meta: { layout: 'life' } },
  { path: '/today', name: 'life-today', component: () => import('./views/LifeToday.vue'), meta: { layout: 'life' } },
  { path: '/life-goals', name: 'life-goals', component: () => import('./views/LifeGoals.vue'), meta: { layout: 'life' } },
  { path: '/life-review', name: 'life-review', component: () => import('./views/LifeReview.vue'), meta: { layout: 'life' } },
  { path: '/money', redirect: '/dashboard' },
];
