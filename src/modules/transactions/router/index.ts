import type { RouteRecordRaw } from 'vue-router';
import { RouteName } from '@/shared/constants/route-name';

export const transactionsRoute: RouteRecordRaw = {
  path: '/transactions',
  name: RouteName.TRANSACTIONS,
  component: () => import('@/modules/transactions/views/TransactionsView.vue'),
  meta: {
    requiresAuth: true,
  },
};
