import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from '@/shared/stores/useAuthStore';

export type Theme = 'forest' | 'dark' | 'orange';

const THEME_CLASSES = ['app-theme-forest', 'app-theme-dark', 'app-theme-orange'];
const storageKey = (userId: string) => `theme:${userId}`;
const normalizeTheme = (value: string | null): Theme => {
  if (value === 'dark' || value === 'orange' || value === 'forest') return value;
  if (value === 'light' || value === 'system') return 'forest';
  return 'forest';
};

export const useThemeStore = defineStore('theme', () => {
  const authStore = useAuthStore();
  const theme = ref<Theme>('forest');
  const isDark = computed(() => theme.value === 'dark');

  watch(
    () => authStore.userId,
    (userId) => {
      const saved = userId ? localStorage.getItem(storageKey(userId)) : null;
      theme.value = normalizeTheme(saved);
    },
    { immediate: true },
  );

  watch(
    theme,
    (value) => {
      document.documentElement.classList.remove(...THEME_CLASSES);
      document.documentElement.classList.add(`app-theme-${value}`);
      document.documentElement.style.colorScheme = value === 'dark' ? 'dark' : 'light';
    },
    { immediate: true },
  );

  function setTheme(value: Theme) {
    theme.value = value;
    if (authStore.userId) localStorage.setItem(storageKey(authStore.userId), value);
  }

  function toggleTheme() {
    const order: Theme[] = ['forest', 'dark', 'orange'];
    const next = order[(order.indexOf(theme.value) + 1) % order.length];
    setTheme(next);
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
});
