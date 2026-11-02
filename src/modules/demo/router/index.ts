import type { RouteRecordRaw } from 'vue-router';
import { RouteName } from '@/shared/constants/route-name';
import { useAuthStore } from '@/shared/stores/useAuthStore';

export const demoRoute: RouteRecordRaw = {
  path: '/demo',
  name: RouteName.DEMO,
  meta: { requiresAuth: false },
  component: () => import('@/modules/demo/views/DemoView.vue'),
  beforeEnter: (_to, _from, next) => {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated) {
      next({ name: RouteName.DASHBOARD });
    } else {
      next();
    }
  },
};
