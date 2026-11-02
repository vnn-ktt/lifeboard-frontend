import type { LayoutNavigationItem } from '@/shared/components/Layout/config';
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router';

export function calcActiveClass(
  route: RouteLocationNormalizedLoadedGeneric,
  item: LayoutNavigationItem,
): string {
  return route.name === item.key ? 'font-semibold' : 'font-normal';
}
