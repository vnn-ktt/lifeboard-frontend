<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import type { RegisterFormValues } from '@/modules/auth/types';
import AuthForm from '@/modules/auth/components/AuthForm.vue';
import AuthLayout from '@/modules/auth/components/AuthLayout.vue';
import { useAuth } from '@/modules/auth/composables/useAuth';
import { RouteName } from '@/shared/constants/route-name';

const { t } = useI18n();
const { errorMessage, isLoading, register } = useAuth();

const form = reactive<RegisterFormValues>({
  email: '',
  name: '',
  password: '',
  passwordConfirmation: '',
});

const validationErrors = reactive({
  email: '',
  name: '',
  password: '',
  passwordConfirmation: '',
});

const successMessage = ref('');

const translatedErrorMessage = computed(() => (errorMessage.value ? t(errorMessage.value) : ''));

function validateForm() {
  validationErrors.email = '';
  validationErrors.name = '';
  validationErrors.password = '';
  validationErrors.passwordConfirmation = '';

  if (!form.name.trim()) {
    validationErrors.name = t('auth.validation.nameRequired');
  } else if (form.name.trim().length < 2) {
    validationErrors.name = t('auth.validation.nameMin');
  }

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

  if (!form.passwordConfirmation) {
    validationErrors.passwordConfirmation = t('auth.validation.passwordConfirmationRequired');
  } else if (form.passwordConfirmation !== form.password) {
    validationErrors.passwordConfirmation = t('auth.validation.passwordConfirmationMismatch');
  }

  return (
    !validationErrors.email &&
    !validationErrors.name &&
    !validationErrors.password &&
    !validationErrors.passwordConfirmation
  );
}

async function handleSubmit() {
  successMessage.value = '';

  if (!validateForm()) {
    return;
  }

  await register({
    email: form.email,
    name: form.name,
    password: form.password,
  });

  successMessage.value = t('auth.register.success');
}
</script>

<template>
  <AuthLayout>
    <template #eyebrow>
      {{ t('auth.register.eyebrow') }}
    </template>

    <template #title>
      {{ t('auth.register.heroTitle') }}
    </template>

    <template #description>
      {{ t('auth.register.heroDescription') }}
    </template>

    <AuthForm
      :error-message="translatedErrorMessage"
      :is-loading="isLoading"
      :submit-label="t('auth.register.submit')"
      :subtitle="t('auth.register.subtitle')"
      :success-message="successMessage"
      :switch-label="t('auth.register.switchLabel')"
      :switch-text="t('auth.register.switchText')"
      :switch-to="{ name: RouteName.LOGIN }"
      :title="t('auth.register.title')"
      @submit="handleSubmit"
    >
      <label class="grid gap-2">
        <span class="text-sm font-bold text-text-muted">
          {{ t('auth.fields.name') }}
        </span>
        <InputText
          v-model="form.name"
          autocomplete="name"
          :invalid="Boolean(validationErrors.name)"
          :placeholder="t('auth.placeholders.name')"
        />
        <small v-if="validationErrors.name" class="text-sm text-red-600">
          {{ validationErrors.name }}
        </small>
      </label>

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
          autocomplete="new-password"
          fluid
          :invalid="Boolean(validationErrors.password)"
          :placeholder="t('auth.placeholders.password')"
          toggle-mask
        />
        <small v-if="validationErrors.password" class="text-sm text-red-600">
          {{ validationErrors.password }}
        </small>
      </label>

      <label class="grid gap-2">
        <span class="text-sm font-bold text-text-muted">
          {{ t('auth.fields.passwordConfirmation') }}
        </span>
        <Password
          v-model="form.passwordConfirmation"
          autocomplete="new-password"
          :feedback="false"
          fluid
          :invalid="Boolean(validationErrors.passwordConfirmation)"
          :placeholder="t('auth.placeholders.passwordConfirmation')"
          toggle-mask
        />
        <small v-if="validationErrors.passwordConfirmation" class="text-sm text-red-600">
          {{ validationErrors.passwordConfirmation }}
        </small>
      </label>
    </AuthForm>
  </AuthLayout>
</template>
