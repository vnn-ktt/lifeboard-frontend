<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AuthCard from '@/shared/components/Auth/AuthCard.vue';
import AuthField from '@/shared/components/Auth/AuthField.vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const name = ref('');
const email = ref('');
const error = ref('');
function submit() {
  error.value = '';
  try {
    auth.createProfile({ name: name.value, email: email.value });
    const redirect = route.query.redirect;
    const destination = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/\\') ? redirect : '/';
    void router.replace(destination);
  } catch (e) { error.value = e instanceof Error ? e.message : 'Не удалось создать профиль.'; }
}
</script>

<template>
  <AuthCard title="Создай пространство" description="Назови себя и начни отслеживать то, что важно." :error="error">
    <form class="lb-auth-form" @submit.prevent="submit">
      <AuthField id="register-name" v-model="name" label="Как тебя зовут" autocomplete="name" required :maxlength="60" placeholder="Имя" />
      <AuthField id="register-email" v-model="email" label="Email (для локального входа)" type="email" autocomplete="email" required :maxlength="254" placeholder="you@example.com" />
      <button class="lb-button lb-button-primary lb-auth-submit" type="submit">Создать профиль <i class="bi bi-arrow-right" /></button>
    </form>
    <template #footer><span>Уже есть профиль?</span> <RouterLink :to="{ path: '/login', query: route.query }">Войти</RouterLink></template>
  </AuthCard>
</template>
