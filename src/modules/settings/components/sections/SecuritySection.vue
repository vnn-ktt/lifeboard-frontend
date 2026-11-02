<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ToggleSwitch from 'primevue/toggleswitch';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Password from 'primevue/password';
import Message from 'primevue/message';
import type { SocialProvider } from '@/modules/settings/types';

const { t } = useI18n();

const twoFactorEnabled = ref(false);
const biometricEnabled = ref(false);
const pinCode = ref('');
const showChangePassword = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const socialLogins = ref<SocialProvider[]>([
  { id: 'google', name: 'google', connected: false, connectedAt: null },
  { id: 'apple', name: 'apple', connected: false, connectedAt: null },
  { id: 'github', name: 'github', connected: false, connectedAt: null },
]);

function toggleSocial(provider: SocialProvider) {
  provider.connected = !provider.connected;
  provider.connectedAt = provider.connected ? new Date().toISOString() : null;
}

function changePassword() {
  showChangePassword.value = !showChangePassword.value;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Change password -->
    <section class="flex flex-col gap-3">
      <h3 class="m-0 text-sm font-semibold text-text">
        {{ t('settings.security.passwordTitle') }}
      </h3>

      <Button
        :label="t('settings.security.changePassword')"
        icon="bi bi-key"
        variant="outlined"
        size="small"
        class="w-fit"
        @click="changePassword"
      />

      <div v-if="showChangePassword" class="flex flex-col gap-3 rounded-lg border border-border bg-surface-alt p-4">
        <div class="flex flex-col gap-2">
          <label for="current-password" class="text-sm text-text">{{ t('settings.security.currentPassword') }}</label>
          <Password id="current-password" v-model="currentPassword" :feedback="false" toggle-mask />
        </div>
        <div class="flex flex-col gap-2">
          <label for="new-password" class="text-sm text-text">{{ t('settings.security.newPassword') }}</label>
          <Password id="new-password" v-model="newPassword" toggle-mask />
        </div>
        <div class="flex flex-col gap-2">
          <label for="confirm-password" class="text-sm text-text">{{ t('settings.security.confirmPassword') }}</label>
          <Password id="confirm-password" v-model="confirmPassword" :feedback="false" toggle-mask />
        </div>
        <Button :label="t('settings.security.savePassword')" icon="bi bi-check-lg" size="small" class="w-fit" />
      </div>
    </section>

    <hr class="border-border" />

    <!-- Social logins -->
    <section class="flex flex-col gap-3">
      <h3 class="m-0 text-sm font-semibold text-text">
        {{ t('settings.security.socialTitle') }}
      </h3>

      <div
        v-for="provider in socialLogins"
        :key="provider.id"
        class="flex items-center justify-between rounded-lg border border-border bg-surface-alt px-4 py-3"
      >
        <div class="flex items-center gap-3">
          <i
            :class="[
              'text-xl',
              provider.name === 'google' ? 'bi bi-google' : '',
              provider.name === 'apple' ? 'bi bi-apple' : '',
              provider.name === 'github' ? 'bi bi-github' : '',
            ]"
          />
          <span class="text-sm capitalize text-text">{{ provider.name }}</span>
        </div>
        <Button
          :label="provider.connected ? t('settings.security.disconnect') : t('settings.security.connect')"
          :severity="provider.connected ? 'danger' : 'secondary'"
          size="small"
          variant="outlined"
          @click="toggleSocial(provider)"
        />
      </div>
    </section>

    <hr class="border-border" />

    <!-- Two-factor -->
    <section class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium text-text">{{ t('settings.security.twoFactor') }}</span>
        <span class="text-xs text-text-muted">{{ t('settings.security.twoFactorHint') }}</span>
      </div>
      <ToggleSwitch v-model="twoFactorEnabled" />
    </section>

    <hr class="border-border" />

    <!-- Biometrics -->
    <section class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium text-text">{{ t('settings.security.biometric') }}</span>
        <span class="text-xs text-text-muted">{{ t('settings.security.biometricHint') }}</span>
      </div>
      <ToggleSwitch v-model="biometricEnabled" />
    </section>

    <hr class="border-border" />

    <!-- PIN code -->
    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-sm font-medium text-text">{{ t('settings.security.pinCode') }}</span>
          <span class="text-xs text-text-muted">{{ t('settings.security.pinCodeHint') }}</span>
        </div>
      </div>
      <InputText
        v-model="pinCode"
        :placeholder="t('settings.security.pinCodePlaceholder')"
        type="password"
        maxlength="6"
        class="w-40"
      />
    </section>
  </div>
</template>

