<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import type { LoginFormValues } from '@/modules/auth/types';
import AuthForm from '@/modules/auth/components/AuthForm.vue';
import AuthLayout from '@/modules/auth/components/AuthLayout.vue';
import { useAuth } from '@/modules/auth/composables/useAuth';
import { RouteName } from '@/shared/constants/route-name';

const { t } = useI18n();
const { errorMessage, isLoading, login } = useAuth();

const form = reactive<LoginFormValues>({
  email: '',
  password: '',
});

const validationErrors = reactive({
  email: '',
  password: '',
});

const successMessage = ref('');

const translatedErrorMessage = computed(() => (errorMessage.value ? t(errorMessage.value) : ''));

function validateForm() {
  validationErrors.email = '';
  validationErrors.password = '';

  if (!form.email.trim()) {
    validationErrors.email = t('auth.validation.emailRequired');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    validationErrors.email = t('auth.validation.emailInvalid');
  }

  if (!form.password) {
    validationErrors.password = t('auth.validation.passwordRequired');
  } else if (form.password.length < 8) {
    validationErrors.password = t('auth.validation.passwordMin');
  }

  return !validationErrors.email && !validationErrors.password;
}

async function handleSubmit() {
  successMessage.value = '';

  if (!validateForm()) {
    return;
  }

  await login({
    email: form.email,
    password: form.password,
  });

  successMessage.value = t('auth.login.success');
}
</script>

<template>
  <AuthLayout>
    <template #eyebrow>
      {{ t('auth.login.eyebrow') }}
    </template>

    <template #title>
      {{ t('auth.login.heroTitle') }}
    </template>

    <template #description>
      {{ t('auth.login.heroDescription') }}
    </template>

    <AuthForm
      :error-message="translatedErrorMessage"
      :is-loading="isLoading"
      :submit-label="t('auth.login.submit')"
      :subtitle="t('auth.login.subtitle')"
      :success-message="successMessage"
      :switch-label="t('auth.login.switchLabel')"
      :switch-text="t('auth.login.switchText')"
      :switch-to="{ name: RouteName.REGISTER }"
      :title="t('auth.login.title')"
      @submit="handleSubmit"
    >
      <label class="grid gap-2">
        <span class="text-sm font-bold text-text-muted">
          {{ t('auth.fields.email') }}
        </span>
        <InputText
          v-model="form.email"
          autocomplete="email"
          inputmode="email"
          :invalid="Boolean(validationErrors.email)"
          :placeholder="t('auth.placeholders.email')"
          type="email"
        />
        <small v-if="validationErrors.email" class="text-sm text-red-600">
          {{ validationErrors.email }}
        </small>
      </label>

      <label class="grid gap-2">
        <span class="text-sm font-bold text-text-muted">
          {{ t('auth.fields.password') }}
        </span>
        <Password
          v-model="form.password"
          autocomplete="current-password"
          :feedback="false"
          fluid
          :invalid="Boolean(validationErrors.password)"
          :placeholder="t('auth.placeholders.password')"
          toggle-mask
        />
        <small v-if="validationErrors.password" class="text-sm text-red-600">
          {{ validationErrors.password }}
        </small>
      </label>
    </AuthForm>
  </AuthLayout>
</template>
