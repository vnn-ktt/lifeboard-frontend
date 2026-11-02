<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import InputNumber from 'primevue/inputnumber';
import ToggleSwitch from 'primevue/toggleswitch';

const { t } = useI18n();

const carryOver = ref(false);
const threshold = ref(80);
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Carry over -->
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium text-text">{{ t('settings.budgets.carryOver') }}</span>
        <span class="text-xs text-text-muted">{{ t('settings.budgets.carryOverHint') }}</span>
      </div>
      <ToggleSwitch v-model="carryOver" />
    </div>

    <hr class="border-border" />

    <!-- Notification threshold -->
    <div class="flex flex-col gap-2">
      <label for="budget-threshold" class="text-sm font-medium text-text">
        {{ t('settings.budgets.notificationThreshold') }}
      </label>
      <div class="flex items-center gap-3">
        <InputNumber
          id="budget-threshold"
          v-model="threshold"
          :min="0"
          :max="100"
          :step="5"
          suffix="%"
          class="w-32"
        />
        <span class="text-xs text-text-muted">{{ t('settings.budgets.thresholdHint', { value: threshold }) }}</span>
      </div>
    </div>
  </div>
</template>
