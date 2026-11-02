import type { RouteRecordRaw } from 'vue-router';
import { RouteName } from '@/shared/constants/route-name';

export const dashboardRoute: RouteRecordRaw = {
  path: '/dashboard',
  name: RouteName.DASHBOARD,
  component: () => import('@/modules/dashboard/views/DashboardView.vue'),
  meta: {
    requiresAuth: true,
  },
};
