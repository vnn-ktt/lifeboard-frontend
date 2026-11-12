<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthCard from '@/shared/components/Auth/AuthCard.vue';
import AuthField from '@/shared/components/Auth/AuthField.vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useLifeI18n } from '@/modules/lifeboard/i18n';

const auth = useAuthStore();
const { t, lang } = useLifeI18n();
const router = useRouter();
const route = useRoute();
const name = ref('');
const nickname = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const pending = ref(false);
const error = ref('');
const nicknameLabel = { ru: 'Никнейм (необязательно)', en: 'Nickname (optional)', de: 'Nickname (optional)' };
const passwordLabel = computed(() => ({ ru: 'Пароль (минимум 12 символов)', en: 'Password (at least 12 characters)', de: 'Passwort (mindestens 12 Zeichen)' }[lang.value]));
async function submit() {
  if (pending.value) return;
  error.value = '';
  if (password.value !== passwordConfirm.value) { error.value = 'Пароли не совпадают'; return; }
  pending.value = true;
  try {
    await auth.register({ name: name.value, nickname: nickname.value, email: email.value, password: password.value });
    password.value = '';
    passwordConfirm.value = '';
    const redirect = route.query.redirect;
    const destination = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/\\') ? redirect : '/';
    await router.replace(destination);
  } catch (e) { error.value = e instanceof Error ? e.message : 'Не удалось зарегистрироваться.'; }
  finally { pending.value = false; }
}
</script>
<template>
  <AuthCard :title="t('registerTitle')" :description="t('registerDescription')" :error="error">
    <form class="lb-auth-form" @submit.prevent="submit">
      <AuthField id="register-name" v-model="name" :label="t('howName')" autocomplete="name" required :maxlength="60" />
      <AuthField id="register-nickname" v-model="nickname" :label="nicknameLabel[lang]" :maxlength="24" />
      <AuthField id="register-email" v-model="email" :label="t('email')" type="email" autocomplete="email" required :maxlength="254" />
      <AuthField id="register-password" v-model="password" :label="passwordLabel" type="password" autocomplete="new-password" required :maxlength="128" />
      <AuthField id="register-password-confirm" v-model="passwordConfirm" label="Повтори пароль / Confirm password" type="password" autocomplete="new-password" required :maxlength="128" />
      <button type="submit" class="lb-button lb-button-primary lb-auth-submit" :disabled="pending || password.length < 12">{{ pending ? '…' : t('registerButton') }} <i class="bi bi-arrow-right" /></button>
    </form>
    <template #footer><span>{{ t('existingPrompt') }}</span> <RouterLink :to="{ path: '/login', query: route.query }">{{ t('login') }}</RouterLink></template>
  </AuthCard>
</template>
