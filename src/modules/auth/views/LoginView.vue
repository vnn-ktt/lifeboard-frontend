<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthCard from '@/shared/components/Auth/AuthCard.vue';
import AuthField from '@/shared/components/Auth/AuthField.vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const email = ref(auth.profile?.email ?? '');
const error = ref('');
const hasProfile = computed(() => Boolean(auth.profile));
const nextPath = computed(() => {
  const value = route.query.redirect;
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : '/';
});

function submit() {
  error.value = '';
  try {
    auth.loginLocal(email.value);
    void router.replace(nextPath.value);
  } catch (e) { error.value = e instanceof Error ? e.message : 'Не удалось выполнить вход.'; }
}
</script>

<template>
  <AuthCard title="С возвращением" description="Продолжи движение к своим целям." :error="error">
    <form v-if="hasProfile" class="lb-auth-form" @submit.prevent="submit">
      <AuthField id="login-email" v-model="email" label="Email локального профиля" type="email" autocomplete="email" required placeholder="you@example.com" />
      <button class="lb-button lb-button-primary lb-auth-submit" type="submit">Войти в Lifeboard <i class="bi bi-arrow-right" /></button>
    </form>
    <div v-else class="lb-auth-form"><p class="lb-muted">В этом браузере ещё нет профиля. Создай его, чтобы начать.</p><RouterLink class="lb-button lb-button-primary lb-auth-submit" :to="{ path: '/register', query: route.query }">Создать локальный профиль <i class="bi bi-arrow-right" /></RouterLink></div>
    <template #footer><span>Нужен новый профиль?</span> <RouterLink to="/register">Создать</RouterLink></template>
  </AuthCard>
</template>
