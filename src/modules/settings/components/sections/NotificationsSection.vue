<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ToggleSwitch from 'primevue/toggleswitch';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';

const { t } = useI18n();

const pushEnabled = ref(true);
const emailEnabled = ref(false);
const inAppEnabled = ref(true);
const largeThreshold = ref<number | null>(10000);
const remindDays = ref(3);

const digestOptions = [
  { value: 'none', label: t('settings.notifications.digestNone') },
  { value: 'weekly', label: t('settings.notifications.digestWeekly') },
  { value: 'monthly', label: t('settings.notifications.digestMonthly') },
];
const digest = ref(digestOptions[0]);
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Channels -->
    <div class="flex flex-col gap-4">
      <span class="text-sm font-medium text-text">{{ t('settings.notifications.channels') }}</span>

      <div class="flex items-center justify-between">
        <span class="text-sm text-text">Push</span>
        <ToggleSwitch v-model="pushEnabled" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-text">Email</span>
        <ToggleSwitch v-model="emailEnabled" />
      </div>
      <div class="flex items-center justify-between">
        <span class="text-sm text-text">{{ t('settings.notifications.inApp') }}</span>
        <ToggleSwitch v-model="inAppEnabled" />
      </div>
    </div>

    <hr class="border-border" />

    <!-- Large transaction -->
    <div class="flex flex-col gap-2">
      <label for="large-threshold" class="text-sm font-medium text-text">
        {{ t('settings.notifications.largeTransaction') }}
      </label>
      <InputNumber
        id="large-threshold"
        v-model="largeThreshold"
        :min="0"
        :step="1000"
        :placeholder="t('settings.notifications.largeTransactionPlaceholder')"
        class="w-full md:w-56"
      />
      <p class="m-0 text-xs text-text-muted">
        {{ t('settings.notifications.largeTransactionHint') }}
      </p>
    </div>

    <hr class="border-border" />

    <!-- Recurring reminder -->
    <div class="flex flex-col gap-2">
      <label for="remind-days" class="text-sm font-medium text-text">
        {{ t('settings.notifications.recurringReminder') }}
      </label>
      <InputNumber
        id="remind-days"
        v-model="remindDays"
        :min="0"
        :max="30"
        :suffix="` ${t('settings.notifications.days')}`"
        class="w-full md:w-40"
      />
    </div>

    <hr class="border-border" />

    <!-- Digest -->
    <div class="flex flex-col gap-2">
      <label for="digest" class="text-sm font-medium text-text">
        {{ t('settings.notifications.digest') }}
      </label>
      <Select
        id="digest"
        v-model="digest"
        :options="digestOptions"
        option-label="label"
        class="w-full md:w-56"
      />
    </div>
  </div>
</template>
