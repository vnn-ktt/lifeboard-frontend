import { computed, ref, watch } from 'vue';
import type { LayoutItem } from 'grid-layout-plus';

const STORAGE_KEY = 'budgee-dashboard-layout';

export interface DashboardLayoutItem extends LayoutItem {
  id: string;
  isVisible: boolean;
}

/** Default layout configuration for all widgets */
function getDefaultLayouts(): DashboardLayoutItem[] {
  return [
    { id: 'summary', i: 'summary', x: 0, y: 0, w: 2, h: 2, isVisible: true },
    { id: 'quick-actions', i: 'quick-actions', x: 2, y: 0, w: 1, h: 2, isVisible: true },
    { id: 'charts', i: 'charts', x: 3, y: 0, w: 1, h: 2, isVisible: true },
    { id: 'budgets', i: 'budgets', x: 0, y: 2, w: 1, h: 2, isVisible: true },
    { id: 'goals', i: 'goals', x: 1, y: 2, w: 1, h: 2, isVisible: true },
    { id: 'activity', i: 'activity', x: 2, y: 2, w: 1, h: 2, isVisible: true },
    { id: 'transactions', i: 'transactions', x: 3, y: 2, w: 1, h: 3, isVisible: true },
    { id: 'categories', i: 'categories', x: 0, y: 4, w: 2, h: 2, isVisible: true },
    { id: 'accounts', i: 'accounts', x: 2, y: 5, w: 2, h: 2, isVisible: true },
  ];
}

function loadLayouts(): DashboardLayoutItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as DashboardLayoutItem[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return getDefaultLayouts();
}

function saveLayouts(layouts: DashboardLayoutItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch {
    // ignore
  }
}

export function useDashboardLayout() {
  const layouts = ref<DashboardLayoutItem[]>(loadLayouts());
  const isEditMode = ref(false);

  /** Auto-save on changes */
  watch(
    layouts,
    (val) => saveLayouts([...val]),
    { deep: true },
  );

  /** Get layout for a specific widget */
  function getLayout(id: string): DashboardLayoutItem {
    const found = layouts.value.find((l) => l.id === id);
    if (found) return found;
    const fallback: DashboardLayoutItem = { id, i: id, x: 0, y: 0, w: 1, h: 1, isVisible: true };
    layouts.value.push(fallback);
    return fallback;
  }

  /** Handle layout changes from grid-layout-plus */
  function onLayoutUpdated(newLayout: LayoutItem[]) {
    for (const item of newLayout) {
      const existing = layouts.value.find((l) => l.id === item.i);
      if (existing) {
        existing.x = item.x;
        existing.y = item.y;
        existing.w = item.w;
        existing.h = item.h;
      }
    }
  }

  // ─── Widget visibility ──────────────────────────────────

  function toggleVisibility(id: string) {
    const l = getLayout(id);
    l.isVisible = !l.isVisible;
  }

  function hideWidget(id: string) {
    const l = getLayout(id);
    l.isVisible = false;
  }

  function showWidget(id: string) {
    const l = getLayout(id);
    l.isVisible = true;
  }

  // ─── Reset layout ───────────────────────────────────────

  function resetLayout() {
    layouts.value = getDefaultLayouts();
  }

  // ─── Available widgets list for the manager ─────────────

  const availableWidgets = computed(() =>
    layouts.value.map((l) => ({
      id: l.id,
      isVisible: l.isVisible,
      position: `(${l.x + 1}, ${l.y + 1})`,
      size: `${l.w}×${l.h}`,
    })),
  );

  /** GridLayout-compatible items (only visible ones) */
  const gridItems = computed<LayoutItem[]>(() =>
    layouts.value
      .filter((l) => l.isVisible)
      .map((l) => ({
        i: l.id,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
      })),
  );

  return {
    // State
    layouts,
    isEditMode,
    gridItems,

    // Getters
    getLayout,

    // Layout events
    onLayoutUpdated,

    // Visibility
    toggleVisibility,
    hideWidget,
    showWidget,

    // Management
    resetLayout,
    availableWidgets,
  };
}
