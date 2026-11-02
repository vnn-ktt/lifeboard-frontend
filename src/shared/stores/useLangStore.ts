import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import type { Lang } from '@/shared/types';

export const useLangStore = defineStore('lang', () => {
  const currentLang = useStorage<Lang>('lang', 'ru');

  function toggleLang(): Lang {
    currentLang.value = currentLang.value === 'ru' ? 'en' : 'ru';

    return currentLang.value;
  }

  return {
    currentLang,
    toggleLang,
  };
});
