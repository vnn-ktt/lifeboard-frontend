import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { LoginPayload, RegisterPayload } from '@/modules/auth/types';
import { useAuthStore } from '@/shared/stores/useAuthStore';

export function useAuth() {
  const isLoading = ref(false);
  const errorMessage = ref('');
  const router = useRouter();
  const authStore = useAuthStore();

  async function login(payload: LoginPayload) {
    errorMessage.value = ''; isLoading.value = true;
    try {
      await authStore.login(payload);
      await router.push('/');
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Не удалось войти';
      throw error;
    } finally { isLoading.value = false; }
  }
  async function register(payload: RegisterPayload) {
    errorMessage.value = ''; isLoading.value = true;
    try {
      await authStore.register(payload);
      await router.push('/');
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Не удалось зарегистрироваться';
      throw error;
    } finally { isLoading.value = false; }
  }
  return { errorMessage, isLoading, login, register };
}
