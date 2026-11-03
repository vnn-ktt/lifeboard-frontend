<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthCard from '@/shared/components/Auth/AuthCard.vue';
import AuthField from '@/shared/components/Auth/AuthField.vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useLifeI18n } from '@/modules/lifeboard/i18n';

const auth = useAuthStore();
const {t}=useLifeI18n();
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
  <AuthCard :title="t('loginTitle')" :description="t('loginDescription')" :error="error">
    <form v-if="hasProfile" class="lb-auth-form" @submit.prevent="submit">
      <AuthField id="login-email" v-model="email" :label="t('localEmail')" type="email" autocomplete="email" required placeholder="you@example.com" />
      <button class="lb-button lb-button-primary lb-auth-submit" type="submit">{{ t('loginButton') }} <i class="bi bi-arrow-right" /></button>
    </form>
    <div v-else class="lb-auth-form"><p class="lb-muted">{{ t('noProfile') }}</p><RouterLink class="lb-button lb-button-primary lb-auth-submit" :to="{ path: '/register', query: route.query }">{{ t('registerButton') }} <i class="bi bi-arrow-right" /></RouterLink></div>
    <template #footer><span>{{ t('registerPrompt') }}</span> <RouterLink to="/register">{{ t('register') }}</RouterLink></template>
  </AuthCard>
</template>
