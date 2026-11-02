<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import ColorPicker from 'primevue/colorpicker';
import Select from 'primevue/select';
import type { CategoryTemplate } from '@/shared/types';

interface Props {
  categories: CategoryTemplate[];
  transactionCounts?: Record<string, number>;
}

const props = withDefaults(defineProps<Props>(), {
  transactionCounts: () => ({}),
});

const emit = defineEmits<{
  add: [];
  edit: [category: CategoryTemplate];
  delete: [category: CategoryTemplate];
  save: [category: CategoryTemplate];
}>();

const { t } = useI18n();

const editingRows = ref<CategoryTemplate[]>([]);

const iconOptions = computed(() => [
  { label: t('category.icons.cash'), value: 'bi bi-cash-stack' },
  { label: t('category.icons.laptop'), value: 'bi bi-laptop' },
  { label: t('category.icons.cart'), value: 'bi bi-cart' },
  { label: t('category.icons.car'), value: 'bi bi-car-front' },
  { label: t('category.icons.coffee'), value: 'bi bi-cup-hot' },
  { label: t('category.icons.lightning'), value: 'bi bi-lightning' },
  { label: t('category.icons.film'), value: 'bi bi-film' },
  { label: t('category.icons.bag'), value: 'bi bi-bag' },
  { label: t('category.icons.heart'), value: 'bi bi-heart-pulse' },
  { label: t('category.icons.house'), value: 'bi bi-house' },
  { label: t('category.icons.gift'), value: 'bi bi-gift' },
  { label: t('category.icons.book'), value: 'bi bi-book' },
  { label: t('category.icons.basket'), value: 'bi bi-basket' },
  { label: t('category.icons.bus'), value: 'bi bi-bus-front' },
  { label: t('category.icons.briefcase'), value: 'bi bi-briefcase' },
]);

const kindOptions = computed(() => [
  { label: t('common.kind.expense'), value: 'expense' },
  { label: t('common.kind.income'), value: 'income' },
]);

function onRowEditSave(event: { data: CategoryTemplate; index: number }) {
  emit('save', event.data);
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-bold text-text">{{ t('category.title') }}</h3>
      <Button
        icon="bi bi-plus-lg"
        size="small"
        severity="primary"
        :label="t('category.add')"
        @click="emit('add')"
      />
    </div>

    <DataTable
      :value="categories"
      v-model:editing-rows="editingRows"
      edit-mode="row"
      data-key="id"
      striped-rows
      show-gridlines
      size="small"
      class="category-table"
      @row-edit-save="onRowEditSave"
    >
      <Column
        field="name"
        :header="t('category.fields.name')"
        :sortable="true"
        style="min-width: 140px"
      >
        <template #body="{ data }">
          <div class="flex items-center gap-2.5">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-lg text-xs text-white"
              :style="{ backgroundColor: data.color }"
            >
              <i :class="data.icon" />
            </span>
            <span class="text-xs font-medium">{{ data.name }}</span>
          </div>
        </template>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" class="w-full text-xs" />
        </template>
      </Column>

      <Column field="color" :header="t('category.fields.color')" style="width: 80px">
        <template #body="{ data }">
          <span
            class="inline-block h-5 w-5 rounded-full border border-border"
            :style="{ backgroundColor: data.color }"
          />
        </template>
        <template #editor="{ data, field }">
          <ColorPicker v-model="data[field]" />
        </template>
      </Column>

      <Column field="icon" :header="t('category.fields.icon')" style="width: 100px">
        <template #body="{ data }">
          <span
            class="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-muted text-text-muted"
          >
            <i :class="data.icon" />
          </span>
        </template>
        <template #editor="{ data, field }">
          <Select
            v-model="data[field]"
            :options="iconOptions"
            option-label="label"
            option-value="value"
            class="w-full text-xs"
          >
            <template #value="{ value }">
              <div class="flex items-center gap-2">
                <i :class="value" />
                <span class="text-xs">{{ iconOptions.find((o) => o.value === value)?.label }}</span>
              </div>
            </template>
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <i :class="option.value" />
                <span>{{ option.label }}</span>
              </div>
            </template>
          </Select>
        </template>
      </Column>

      <Column
        field="kind"
        :header="t('category.fields.type')"
        :sortable="true"
        style="width: 100px"
      >
        <template #body="{ data }">
          <span
            class="text-xs font-medium"
            :class="data.kind === 'income' ? 'text-emerald-500' : 'text-red-500'"
          >
            {{ data.kind === 'income' ? t('common.kind.income') : t('common.kind.expense') }}
          </span>
        </template>
        <template #editor="{ data, field }">
          <Select
            v-model="data[field]"
            :options="kindOptions"
            option-label="label"
            option-value="value"
            class="w-full text-xs"
          />
        </template>
      </Column>

      <Column :header="t('category.fields.transactions')" :sortable="true" style="width: 110px">
        <template #body="{ data }">
          <span class="text-xs font-medium text-text-muted">
            {{ transactionCounts[data.id] || 0 }}
          </span>
        </template>
      </Column>

      <Column :header="t('category.fields.actions')" header-style="width: 6rem" style="width: 80px">
        <template #body="{ data }">
          <div class="flex items-center gap-1">
            <Button
              icon="bi bi-pencil-square"
              size="small"
              severity="secondary"
              text
              rounded
              class="action-btn"
              @click="editingRows = [data]"
            />
            <Button
              icon="bi bi-trash3"
              size="small"
              severity="danger"
              text
              rounded
              class="action-btn"
              @click="emit('delete', data)"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="flex flex-col items-center gap-3 py-8 text-text-muted">
          <i class="bi bi-tag text-3xl" />
          <p class="text-sm font-medium">{{ t('category.empty') }}</p>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.category-table :deep(.p-datatable-table-container) {
  border-radius: 0.75rem;
  overflow: hidden;
}

.category-table :deep(.p-datatable-thead > tr > th) {
  background-color: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.category-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.category-table :deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--color-surface-hover);
}

.action-btn {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 1;
}
</style>
