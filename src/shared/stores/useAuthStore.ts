import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { LocalProfile, ProfileUpdate } from '@/shared/types/profile';

const PROFILE_KEY = 'lifeboard:local-profile:v1';
const SESSION_KEY = 'lifeboard:local-session:v1';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function storedProfile(): LocalProfile | null {
  try {
    const value = localStorage.getItem(PROFILE_KEY);
    if (!value) return null;
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== 'object') return null;
    const p = data as Partial<LocalProfile>;
    if (typeof p.id !== 'string' || typeof p.name !== 'string' || typeof p.email !== 'string' || typeof p.createdAt !== 'string') return null;
    return { id: p.id, name: p.name, email: p.email, about: typeof p.about === 'string' ? p.about : '', avatar: typeof p.avatar === 'string' && p.avatar.startsWith('data:image/') ? p.avatar : undefined, createdAt: p.createdAt };
  } catch { return null; }
}

function storedSession(profile: LocalProfile | null): boolean {
  try { return Boolean(profile && sessionStorage.getItem(SESSION_KEY) === profile.id); }
  catch { return false; }
}

function validate(input: ProfileUpdate) {
  if (input.name.trim().length < 2) throw new Error('Имя должно содержать не менее двух символов.');
  if (input.name.trim().length > 60) throw new Error('Имя должно содержать не более 60 символов.');
  if (!EMAIL_PATTERN.test(input.email.trim())) throw new Error('Проверь адрес электронной почты.');
  if (input.email.length > 254) throw new Error('Адрес электронной почты слишком длинный.');
  if (input.about.length > 400) throw new Error('Описание должно содержать не более 400 символов.');
}

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<LocalProfile | null>(storedProfile());
  const signedIn = ref(storedSession(profile.value));
  const isAuthenticated = computed(() => Boolean(profile.value && signedIn.value));
  const userId = computed(() => isAuthenticated.value ? profile.value?.id ?? null : null);

  function createProfile(input: { name: string; email: string }) {
    if (profile.value) throw new Error('В этом браузере уже создан профиль. Войди в него.');
    const values = { name: input.name.trim(), email: input.email.trim().toLowerCase(), about: '' };
    validate(values);
    const newProfile: LocalProfile = {
      ...values,
      id: crypto.randomUUID?.() ?? `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    sessionStorage.setItem(SESSION_KEY, newProfile.id);
    profile.value = newProfile;
    signedIn.value = true;
  }

  /** Email recognition only: intentionally NOT secure authentication. */
  function loginLocal(email: string) {
    if (!profile.value) throw new Error('В этом браузере пока нет профиля. Создай его.');
    if (email.trim().toLowerCase() !== profile.value.email) throw new Error('Профиль с таким email не найден в этом браузере.');
    sessionStorage.setItem(SESSION_KEY, profile.value.id);
    signedIn.value = true;
  }

  function updateProfile(input: ProfileUpdate) {
    if (!profile.value || !signedIn.value) throw new Error('Для редактирования профиля нужно войти.');
    const values = { name: input.name.trim(), email: input.email.trim().toLowerCase(), about: input.about.trim() };
    validate(values);
    const updated = { ...profile.value, ...values };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    profile.value = updated;
  }

  function setAvatar(value?: string) {
    if (!profile.value || !signedIn.value) throw new Error('Sign in first');
    const updated = { ...profile.value, avatar: value };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    profile.value = updated;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    signedIn.value = false;
  }

  return { profile, userId, isAuthenticated, createProfile, loginLocal, updateProfile, setAvatar, logout };
});
