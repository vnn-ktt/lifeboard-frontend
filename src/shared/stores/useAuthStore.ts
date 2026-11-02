import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const userId = ref<string | null>(null);

  const isAuthenticated = computed(() => Boolean(token.value));

  function setToken(value: string | null, id: string | null = null) {
    token.value = value;
    userId.value = value ? id : null;
  }

  function logout() {
    token.value = null;
    userId.value = null;
  }

  return {
    token,
    userId,
    isAuthenticated,
    setToken,
    logout,
  };
});
