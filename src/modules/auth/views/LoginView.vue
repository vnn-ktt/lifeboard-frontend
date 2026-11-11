<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthCard from '@/shared/components/Auth/AuthCard.vue';
import AuthField from '@/shared/components/Auth/AuthField.vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useLifeI18n } from '@/modules/lifeboard/i18n';

const auth = useAuthStore();
const { t } = useLifeI18n();
const router = useRouter();
const route = useRoute();
const email = ref('');
const password = ref('');
const pending = ref(false);
const error = ref('');
const nextPath = computed(() => {
  const value = route.query.redirect;
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : '/';
});
async function submit() {
  if (pending.value) return;
  error.value = '';
  pending.value = true;
  try {
    await auth.login({ email: email.value, password: password.value });
    password.value = '';
    await router.replace(nextPath.value);
  } catch (e) { error.value = e instanceof Error ? e.message : 'Не удалось войти.'; }
  finally { pending.value = false; }
}
</script>
<template>
  <AuthCard :title="t('loginTitle')" :description="t('loginDescription')" :error="error">
    <form class="lb-auth-form" @submit.prevent="submit">
      <AuthField id="login-email" v-model="email" :label="t('email')" type="email" autocomplete="email" required placeholder="you@example.com" />
      <AuthField id="login-password" v-model="password" label="Пароль / Password" type="password" autocomplete="current-password" required />
      <button class="lb-button lb-button-primary lb-auth-submit" :disabled="pending" type="submit">{{ pending ? '…' : t('loginButton') }} <i class="bi bi-arrow-right" /></button>
    </form>
    <template #footer><span>{{ t('registerPrompt') }}</span> <RouterLink to="/register">{{ t('register') }}</RouterLink></template>
  </AuthCard>
</template>
