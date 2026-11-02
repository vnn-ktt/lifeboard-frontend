import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { LoginPayload, RegisterPayload } from '@/modules/auth/types';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { RouteName } from '@/shared/constants/route-name';

const PLACEHOLDER_DELAY_MS = 600;
const PLACEHOLDER_TOKEN = 'placeholder-jwt-token';

function waitForPlaceholderRequest() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, PLACEHOLDER_DELAY_MS);
  });
}

export function useAuth() {
  const isLoading = ref(false);
  const errorMessage = ref('');
  const router = useRouter();
  const authStore = useAuthStore();

  async function runPlaceholderSubmit() {
    errorMessage.value = '';
    isLoading.value = true;

    try {
      await waitForPlaceholderRequest();
    } catch {
      errorMessage.value = 'auth.errors.unexpected';
      throw new Error(errorMessage.value);
    } finally {
      isLoading.value = false;
    }
  }

  async function login(payload: LoginPayload) {
    await runPlaceholderSubmit();
    authStore.setToken(PLACEHOLDER_TOKEN, payload.email.trim().toLowerCase());
    await router.push({ name: RouteName.DASHBOARD });
  }

  async function register(payload: RegisterPayload) {
    await runPlaceholderSubmit();
    authStore.setToken(PLACEHOLDER_TOKEN, payload.email.trim().toLowerCase());
    await router.push({ name: RouteName.DASHBOARD });
  }

  return {
    errorMessage,
    isLoading,
    login,
    register,
  };
}
