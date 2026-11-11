import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError, toProfile } from '@/shared/api/client';
import type { PublicUser } from '@/shared/api/types';
import type { ProfileUpdate } from '@/shared/types/profile';

type AuthResponse = { user: PublicUser };
type LoginInput = { email: string; password: string };
type RegisterInput = LoginInput & { name: string; nickname?: string };

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<PublicUser | null>(null);
  const isReady = ref(false);
  const isAuthenticated = computed(() => Boolean(profile.value));
  const userId = computed(() => profile.value?.id ?? null);
  let bootstrapPromise: Promise<void> | undefined;

  async function bootstrap(): Promise<void> {
    if (isReady.value) return;
    if (!bootstrapPromise) bootstrapPromise = (async () => {
      try {
        profile.value = toProfile(await api.get<PublicUser>('/users/me'));
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
        profile.value = null;
      } finally { isReady.value = true; }
    })().finally(() => { bootstrapPromise = undefined; });
    return bootstrapPromise;
  }

  async function login(input: LoginInput): Promise<void> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email: input.email.trim().toLowerCase(), password: input.password,
    });
    profile.value = toProfile(response.user);
    isReady.value = true;
  }

  async function register(input: RegisterInput): Promise<void> {
    const response = await api.post<AuthResponse>('/auth/register', {
      name: input.name.trim(),
      nickname: input.nickname?.trim().replace(/^@/, '') || undefined,
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });
    profile.value = toProfile(response.user);
    isReady.value = true;
  }

  async function updateProfile(input: ProfileUpdate): Promise<void> {
    const user = await api.patch<PublicUser>('/users/me', {
      name: input.name.trim(),
      nickname: input.nickname?.trim() || null,
      about: input.about.trim(),
    });
    profile.value = toProfile(user);
  }

  async function setAvatar(value?: string | File): Promise<void> {
    let fileId: string | null = null;
    if (value) {
      let file: File;
      if (typeof value === 'string') {
        const response = await fetch(value);
        const blob = await response.blob();
        file = new File([blob], 'avatar.jpg', { type: blob.type || 'image/jpeg' });
      } else { file = value; }
      const stored = await api.upload<{ id: string }>('/files', file);
      fileId = stored.id;
    }
    profile.value = toProfile(await api.put<PublicUser>('/users/me/avatar', { fileId }));
  }

  async function logout(): Promise<void> {
    await api.post<void>('/auth/logout', {});
    profile.value = null;
    isReady.value = true;
    window.dispatchEvent(new Event('lifeboard:logout'));
  }

  function expireSession(): void { profile.value = null; isReady.value = true; }
  return { profile, isReady, isAuthenticated, userId, bootstrap, login, register, updateProfile, setAvatar, logout, expireSession };
});
