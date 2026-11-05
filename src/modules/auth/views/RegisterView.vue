<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AuthCard from '@/shared/components/Auth/AuthCard.vue';
import AuthField from '@/shared/components/Auth/AuthField.vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useLifeI18n } from '@/modules/lifeboard/i18n';

const auth = useAuthStore();
const {t, lang}=useLifeI18n();
const router = useRouter();
const route = useRoute();
const name = ref('');
const nickname = ref('');
const nicknameLabel = { ru: 'Никнейм (необязательно)', en: 'Nickname (optional)', de: 'Nickname (optional)' }; 
const email = ref('');
const error = ref('');
function submit() {
  error.value = '';
  try {
    auth.createProfile({ name: name.value, nickname: nickname.value, email: email.value });
    const redirect = route.query.redirect;
    const destination = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/\\') ? redirect : '/';
    void router.replace(destination);
  } catch (e) { error.value = e instanceof Error ? e.message : 'Не удалось создать профиль.'; }
}
</script>

<template>
  <AuthCard :title="t('registerTitle')" :description="t('registerDescription')" :error="error">
    <form class="lb-auth-form" @submit.prevent="submit">
      <AuthField id="register-name" v-model="name" :label="t('howName')" autocomplete="name" required :maxlength="60" placeholder="Имя" />
      <AuthField id="register-nickname" v-model="nickname" :label="nicknameLabel[lang]" autocomplete="off" :maxlength="24" />
      <AuthField id="register-email" v-model="email" :label="t('localEmail')" type="email" autocomplete="email" required :maxlength="254" placeholder="you@example.com" />
      <button class="lb-button lb-button-primary lb-auth-submit" type="submit">{{ t('registerButton') }} <i class="bi bi-arrow-right" /></button>
    </form>
    <template #footer><span>{{ t('existingPrompt') }}</span> <RouterLink :to="{ path: '/login', query: route.query }">{{ t('login') }}</RouterLink></template>
  </AuthCard>
</template>
