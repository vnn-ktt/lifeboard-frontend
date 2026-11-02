<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';
import { useProfileSettings } from '@/modules/settings/composables/useProfileSettings';

const { t } = useI18n();

const {
  displayName,
  avatarPreview,
  isSaving,
  canSave,
  handleAvatarUpload,
  removeAvatar,
  saveProfile,
} = useProfileSettings();

const avatarInputId = 'settings-avatar-upload';
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Avatar -->
    <div class="flex items-center gap-6">
      <Avatar
        :icon="!avatarPreview ? 'bi bi-person' : undefined"
        :image="avatarPreview ?? undefined"
        :label="(!avatarPreview ? displayName.charAt(0).toUpperCase() : undefined) ?? undefined"
        size="xlarge"
        shape="circle"
        class="h-24 w-24 shrink-0 text-3xl"
      />

      <div class="flex flex-col gap-2">
        <label
          :for="avatarInputId"
          class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface-alt px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-hover"
        >
          <i class="bi bi-camera" aria-hidden="true" />
          {{ t('settings.profile.uploadAvatar') }}
        </label>
        <input
          :id="avatarInputId"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          class="sr-only"
          @change="handleAvatarUpload"
        />
        <Button
          v-if="avatarPreview"
          severity="danger"
          variant="text"
          size="small"
          :label="t('settings.profile.removeAvatar')"
          @click="removeAvatar"
        />
        <p class="m-0 text-xs text-text-muted">
          {{ t('settings.profile.avatarHint') }}
        </p>
      </div>
    </div>

    <!-- Name & Email -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="flex flex-col gap-2">
        <label for="settings-name" class="text-sm font-medium text-text">
          {{ t('settings.profile.displayNameLabel') }}
        </label>
        <InputText
          id="settings-name"
          v-model="displayName"
          :placeholder="t('settings.profile.displayNamePlaceholder')"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="settings-email" class="text-sm font-medium text-text">
          {{ t('settings.profile.emailLabel') }}
        </label>
        <InputText
          id="settings-email"
          :placeholder="t('settings.profile.emailPlaceholder')"
          disabled
        />
        <p class="m-0 text-xs text-text-muted">
          {{ t('settings.profile.emailHint') }}
        </p>
      </div>
    </div>

    <!-- Save -->
    <div class="flex justify-end">
      <Button
        :label="t('settings.profile.save')"
        :loading="isSaving"
        :disabled="!canSave"
        icon="bi bi-check-lg"
        @click="saveProfile"
      />
    </div>
  </div>
</template>
