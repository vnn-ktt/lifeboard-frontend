import type { RouteRecordRaw } from 'vue-router';
import { RouteName } from '@/shared/constants/route-name';
export const settingsRoute: RouteRecordRaw = {
  path: '/settings',
  name: RouteName.SETTINGS,
  component: () => import('@/modules/settings/views/SettingsView.vue'),
  meta: { requiresAuth: true },
};
