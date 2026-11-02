import type { RouteRecordRaw } from 'vue-router';
import { RouteName } from '@/shared/constants/route-name';

export const goalsRoute: RouteRecordRaw = {
  path: '/goals',
  name: RouteName.GOALS,
  component: () => import('@/modules/goals/views/GoalsView.vue'),
  meta: { requiresAuth: true },
};
