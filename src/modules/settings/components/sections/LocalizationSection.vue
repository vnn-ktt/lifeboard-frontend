<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import { useSettingsStore } from '@/shared/stores/useSettingsStore';

const { t } = useI18n();
const settings = useSettingsStore();

const currencies = [
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'RUB', name: 'Russian Ruble (₽)', symbol: '₽' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan (¥)', symbol: '¥' },
];

const numberFormats = [
  { value: 'dot' as const, label: t('settings.localization.formatDot') },
  { value: 'comma' as const, label: t('settings.localization.formatComma') },
];

const dateFormats = [
  { value: 'DD.MM.YYYY' as const, label: 'DD.MM.YYYY' },
  { value: 'MM/DD/YYYY' as const, label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD' as const, label: 'YYYY-MM-DD' },
];

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/Moscow', label: 'Moscow (UTC+3)' },
  { value: 'Europe/London', label: 'London (UTC+0/+1)' },
  { value: 'America/New_York', label: 'New York (UTC-5/-4)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
];

const selectedCurrency = computed({
  get: () => currencies.find((c) => c.code === settings.primaryCurrency) ?? currencies[0],
  set: (val) => settings.setCurrency(val.code),
});

const selectedNumberFormat = computed({
  get: () => numberFormats.find((f) => f.value === settings.numberFormat) ?? numberFormats[0],
  set: (val) => settings.setNumberFormat(val.value),
});

const selectedDateFormat = computed({
  get: () => dateFormats.find((f) => f.value === settings.dateFormat) ?? dateFormats[0],
  set: (val) => settings.setDateFormat(val.value),
});

const selectedTimezone = computed({
  get: () => timezones.find((tz) => tz.value === settings.timezone) ?? timezones[0],
  set: (val) => settings.setTimezone(val.value),
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Primary currency -->
    <div class="flex flex-col gap-2">
      <label for="currency" class="text-sm font-medium text-text">
        {{ t('settings.localization.primaryCurrency') }}
      </label>
      <Select
        id="currency"
        v-model="selectedCurrency"
        :options="currencies"
        option-label="name"
        class="w-full md:w-72"
      />
      <p class="m-0 text-xs text-text-muted">
        {{ t('settings.localization.currencyHint') }}
      </p>
    </div>

    <hr class="border-border" />

    <!-- Language -->
    <div class="flex flex-col gap-2">
      <label for="locale" class="text-sm font-medium text-text">
        {{ t('settings.localization.language') }}
      </label>
      <Select
        id="locale"
        :model-value="settings.currentLang"
        :options="['ru', 'en']"
        class="w-full md:w-48"
        @update:model-value="settings.setLanguage"
      >
        <template #value="{ value }">
          {{ value === 'ru' ? t('layout.lang.ru') : t('layout.lang.en') }}
        </template>
        <template #option="{ option }">
          {{ option === 'ru' ? t('layout.lang.ru') : t('layout.lang.en') }}
        </template>
      </Select>
    </div>

    <hr class="border-border" />

    <!-- Number format -->
    <div class="flex flex-col gap-2">
      <label for="number-format" class="text-sm font-medium text-text">
        {{ t('settings.localization.numberFormat') }}
      </label>
      <Select
        id="number-format"
        v-model="selectedNumberFormat"
        :options="numberFormats"
        option-label="label"
        class="w-full md:w-72"
      />
    </div>

    <hr class="border-border" />

    <!-- Date format -->
    <div class="flex flex-col gap-2">
      <label for="date-format" class="text-sm font-medium text-text">
        {{ t('settings.localization.dateFormat') }}
      </label>
      <Select
        id="date-format"
        v-model="selectedDateFormat"
        :options="dateFormats"
        option-label="label"
        class="w-full md:w-48"
      />
    </div>

    <hr class="border-border" />

    <!-- Timezone -->
    <div class="flex flex-col gap-2">
      <label for="timezone" class="text-sm font-medium text-text">
        {{ t('settings.localization.timezone') }}
      </label>
      <Select
        id="timezone"
        v-model="selectedTimezone"
        :options="timezones"
        option-label="label"
        class="w-full md:w-72"
      />
    </div>
  </div>
</template>
