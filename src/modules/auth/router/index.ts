import type { RouteRecordRaw } from 'vue-router';
import { RouteName } from '@/shared/constants/route-name';

export const authRoutes: RouteRecordRaw[] = [
  { path: '/login', name: RouteName.LOGIN, component: () => import('@/modules/auth/views/LoginView.vue'), meta: { layout: 'auth', isPublic: true } },
  { path: '/register', name: RouteName.REGISTER, component: () => import('@/modules/auth/views/RegisterView.vue'), meta: { layout: 'auth', isPublic: true } },
];
