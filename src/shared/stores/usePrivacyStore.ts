import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

/** Presentation privacy only. Does not implement encryption, tracking protection or secure auth. */
export const usePrivacyStore = defineStore('privacy', () => {
  const showAvatar = useStorage('lifeboard:privacy:show-avatar', true);
  const maskStats = useStorage('lifeboard:privacy:mask-stats', false);
  return { showAvatar, maskStats };
});
