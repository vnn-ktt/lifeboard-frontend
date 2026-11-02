<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Select from 'primevue/select';
import { useThemeStore, type Theme } from '@/shared/stores/useThemeStore';

const { t } = useI18n();
const themeStore = useThemeStore();

const themeOptions = computed(() => [
  { value: 'light', label: t('settings.appearance.themeLight') },
  { value: 'dark', label: t('settings.appearance.themeDark') },
  { value: 'system', label: t('settings.appearance.themeSystem') },
]);
const selectedTheme = computed(() =>
  themeOptions.value.find((option) => option.value === themeStore.theme),
);

const chartStyleOptions = [
  { value: 'categories', label: t('settings.appearance.chartCategories') },
  { value: 'timeline', label: t('settings.appearance.chartTimeline') },
];
const chartStyle = ref(chartStyleOptions[0]);

function changeTheme(option: { value: Theme; label: string }) {
  themeStore.setTheme(option.value);
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Theme -->
    <div class="flex flex-col gap-2">
      <label for="theme-select" class="text-sm font-medium text-text">
        {{ t('settings.appearance.theme') }}
      </label>
      <Select
        id="theme-select"
        :model-value="selectedTheme"
        :options="themeOptions"
        option-label="label"
        class="w-full md:w-56"
        @update:model-value="changeTheme"
      />
    </div>

    <hr class="border-border" />

    <!-- Chart style -->
    <div class="flex flex-col gap-2">
      <label for="chart-style" class="text-sm font-medium text-text">
        {{ t('settings.appearance.chartStyle') }}
      </label>
      <Select
        id="chart-style"
        v-model="chartStyle"
        :options="chartStyleOptions"
        option-label="label"
        class="w-full md:w-56"
      />
    </div>
  </div>
</template>
