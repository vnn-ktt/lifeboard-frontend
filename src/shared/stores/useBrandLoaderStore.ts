import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useBrandLoaderStore = defineStore('brandLoader', () => {
  const active = ref(false);
  const message = ref('');
  const details = ref('');
  const pending = ref(0);

  async function run<T>(task: (() => Promise<T>) | Promise<T> | (() => T) | T, options?: {
    message?: string;
    details?: string;
    minDuration?: number;
  }): Promise<T> {
    pending.value += 1;
    active.value = true;
    message.value = options?.message ?? 'Lifeboard';
    details.value = options?.details ?? '';
    const minDuration = Math.max(0, options?.minDuration ?? 550);
    const startedAt = Date.now();
    try {
      const value = typeof task === 'function' ? await (task as (() => Promise<T> | T))() : await task;
      const elapsed = Date.now() - startedAt;
      if (elapsed < minDuration) await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
      return value as T;
    } finally {
      pending.value = Math.max(0, pending.value - 1);
      if (!pending.value) {
        active.value = false;
        message.value = '';
        details.value = '';
      }
    }
  }

  return { active, message, details, run };
});
