import { usePreferredDark } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from '@/shared/stores/useAuthStore';

export type Theme = 'light' | 'dark' | 'system';

const DARK_CLASS = 'app-dark';
const storageKey = (userId: string) => `theme:${userId}`;

export const useThemeStore = defineStore('theme', () => {
  const authStore = useAuthStore();
  const preferredDark = usePreferredDark();
  const theme = ref<Theme>('light');
  const isDark = computed(
    () => theme.value === 'dark' || (theme.value === 'system' && preferredDark.value),
  );

  watch(
    () => authStore.userId,
    (userId) => {
      const saved = userId ? localStorage.getItem(storageKey(userId)) : null;
      theme.value = saved === 'dark' || saved === 'system' ? saved : 'light';
    },
    { immediate: true },
  );

  watch(
    isDark,
    (value) => {
      document.documentElement.classList.toggle(DARK_CLASS, value);
      document.documentElement.style.colorScheme = value ? 'dark' : 'light';
    },
    { immediate: true },
  );

  function setTheme(value: Theme) {
    theme.value = value;
    if (authStore.userId) localStorage.setItem(storageKey(authStore.userId), value);
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark');
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
});
