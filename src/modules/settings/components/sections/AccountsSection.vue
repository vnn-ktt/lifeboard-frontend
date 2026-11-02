<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ToggleSwitch from 'primevue/toggleswitch';
import Select from 'primevue/select';

const { t } = useI18n();

const hideInactive = ref(false);
const defaultCategory = ref(null);

const categories = computed(() => [
  { id: '1', name: t('settings.accounts.demoCategories.foodDrinks') },
  { id: '2', name: t('category.mock.transport') },
  { id: '3', name: t('dashboard.demo.categories.entertainment') },
  { id: '4', name: t('common.kind.income') },
]);
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Default category -->
    <div class="flex flex-col gap-2">
      <label for="default-category" class="text-sm font-medium text-text">
        {{ t('settings.accounts.defaultCategory') }}
      </label>
      <Select
        id="default-category"
        v-model="defaultCategory"
        :options="categories"
        option-label="name"
        :placeholder="t('settings.accounts.defaultCategoryPlaceholder')"
        class="w-full md:w-72"
        clearable
      />
      <p class="m-0 text-xs text-text-muted">
        {{ t('settings.accounts.defaultCategoryHint') }}
      </p>
    </div>

    <hr class="border-border" />

    <!-- Hide inactive -->
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium text-text">{{ t('settings.accounts.hideInactive') }}</span>
        <span class="text-xs text-text-muted">{{ t('settings.accounts.hideInactiveHint') }}</span>
      </div>
      <ToggleSwitch v-model="hideInactive" />
    </div>
  </div>
</template>
