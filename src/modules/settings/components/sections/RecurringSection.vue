<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';

const { t } = useI18n();

interface RecurringItem {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  autoCreate: boolean;
  active: boolean;
}

const templates = ref<RecurringItem[]>([
  { id: 1, name: t('settings.recurring.salaryLabel'), amount: 5000, frequency: 'monthly', autoCreate: true, active: true },
  { id: 2, name: t('settings.recurring.subscriptionLabel'), amount: 9.99, frequency: 'monthly', autoCreate: false, active: true },
]);

const frequencies = [
  { value: 'weekly', label: t('settings.recurring.weekly') },
  { value: 'monthly', label: t('settings.recurring.monthly') },
  { value: 'yearly', label: t('settings.recurring.yearly') },
];

function removeTemplate(id: number) {
  templates.value = templates.value.filter((tpl) => tpl.id !== id);
}

function addTemplate() {
  const newId = Date.now();
  templates.value.push({
    id: newId,
    name: '',
    amount: 0,
    frequency: 'monthly',
    autoCreate: false,
    active: true,
  });
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <p class="m-0 text-sm text-text-muted">
      {{ t('settings.recurring.description') }}
    </p>

    <!-- Template list -->
    <div
      v-for="tpl in templates"
      :key="tpl.id"
      class="flex flex-col gap-3 rounded-lg border border-border bg-surface-alt p-4"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-1 flex-col gap-2">
          <InputText v-model="tpl.name" :placeholder="t('settings.recurring.namePlaceholder')" />
          <div class="flex flex-wrap gap-2">
            <InputNumber
              v-model="tpl.amount"
              :placeholder="t('settings.recurring.amountPlaceholder')"
              :min="0"
              class="w-36"
              mode="currency"
              currency="USD"
            />
            <Select
              v-model="tpl.frequency"
              :options="frequencies"
              option-label="label"
              class="w-40"
            />
          </div>
        </div>
        <Button
          icon="bi bi-trash"
          severity="danger"
          variant="text"
          size="small"
          @click="removeTemplate(tpl.id)"
        />
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="tpl.autoCreate" />
          <span class="text-xs text-text">{{ t('settings.recurring.autoCreate') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <ToggleSwitch v-model="tpl.active" />
          <span class="text-xs text-text">{{ t('settings.recurring.active') }}</span>
        </div>
      </div>
    </div>

    <!-- Add button -->
    <Button
      :label="t('settings.recurring.addTemplate')"
      icon="bi bi-plus-lg"
      variant="outlined"
      size="small"
      class="w-fit"
      @click="addTemplate"
    />
  </div>
</template>
