import type { RouteLocationRaw } from 'vue-router';
import { RouteName } from '@/shared/constants/route-name';

export interface LayoutNavigationItem {
  key: string;
  labelKey?: string;
  label?: string;
  icon: string;
  to: RouteLocationRaw;
  disabled?: boolean;
  requiresAuth?: boolean;
}

/** Main app navigation shown in the footer on every screen size. */
export const navigationItems: LayoutNavigationItem[] = [
  {
    key: RouteName.DASHBOARD,
    labelKey: 'layout.navigation.dashboard',
    icon: 'bi bi-graph-up',
    to: { name: RouteName.DASHBOARD },
    requiresAuth: true,
  },
  {
    key: RouteName.TRANSACTIONS,
    labelKey: 'layout.navigation.transactions',
    icon: 'bi bi-wallet2',
    to: { name: RouteName.TRANSACTIONS },
    requiresAuth: true,
  },
  {
    key: RouteName.CATEGORIES,
    labelKey: 'layout.navigation.categories',
    icon: 'bi bi-tags',
    to: { name: RouteName.CATEGORIES },
    requiresAuth: true,
  },
  {
    key: RouteName.GOALS,
    labelKey: 'layout.navigation.goals',
    icon: 'bi bi-flag',
    to: { name: RouteName.GOALS },
    requiresAuth: true,
  },
  {
    key: RouteName.SETTINGS,
    labelKey: 'common.settings',
    icon: 'bi bi-gear',
    to: { name: RouteName.SETTINGS },
    requiresAuth: true,
  },
];

export const mobileNavigationItems = navigationItems;
export const desktopNavigationItems = navigationItems;
