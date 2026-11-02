import type { RouteRecordRaw } from 'vue-router';
import { RouteName } from '@/shared/constants/route-name';

export const categoriesRoute: RouteRecordRaw = {
  path: '/categories',
  name: RouteName.CATEGORIES,
  component: () => import('@/modules/categories/views/CategoryView.vue'),
  meta: {
    requiresAuth: true,
  },
};
