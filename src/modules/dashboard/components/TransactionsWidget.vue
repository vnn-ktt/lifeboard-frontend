<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Select from 'primevue/select';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import DashboardCard from '@/modules/dashboard/components/DashboardCard.vue';
import type { DashboardTransaction } from '@/modules/dashboard/types';

interface Props {
  transactions: DashboardTransaction[];
}

const props = defineProps<Props>();

const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

const selectedTransactions = ref<DashboardTransaction[]>([]);
const globalSearch = ref('');
const editingRows = ref<DashboardTransaction[]>([]);

const kindOptions = computed(() => [
  { label: t('common.kind.income'), value: 'income' },
  { label: t('common.kind.expense'), value: 'expense' },
]);

const statusOptions = computed(() => [
  { label: t('common.status.completed'), value: 'completed' },
  { label: t('common.status.pending'), value: 'pending' },
  { label: t('common.status.cancelled'), value: 'cancelled' },
]);

const statusSeverity: Record<
  string,
  'success' | 'warn' | 'danger' | 'secondary' | 'info' | 'contrast'
> = {
  completed: 'success',
  pending: 'warn',
  cancelled: 'danger',
};

function formatMoney(amount: number, currency: string, kind: string) {
  const formatted = new Intl.NumberFormat('en-US', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
  return kind === 'income' ? `+${formatted}` : `-${formatted}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function confirmDeleteMultiple() {
  if (selectedTransactions.value.length === 0) return;
  confirm.require({
    message: t('dashboard.deleteSelected', { count: selectedTransactions.value.length }),
    header: t('dashboard.confirmDelete'),
    icon: 'bi bi-exclamation-triangle',
    rejectLabel: t('common.actions.cancel'),
    acceptLabel: t('common.actions.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      toast.add({
        severity: 'success',
        summary: t('common.status.deleted'),
        detail: t('dashboard.transactionsDeleted', { count: selectedTransactions.value.length }),
        life: 3000,
      });
      selectedTransactions.value = [];
    },
  });
}

function confirmDeleteSingle(transaction: DashboardTransaction) {
  confirm.require({
    message: t('dashboard.deleteSingle', { description: transaction.description }),
    header: t('dashboard.confirmDelete'),
    icon: 'bi bi-exclamation-triangle',
    rejectLabel: t('common.actions.cancel'),
    acceptLabel: t('common.actions.delete'),
    acceptClass: 'p-button-danger',
    accept: () => {
      toast.add({
        severity: 'success',
        summary: t('common.status.deleted'),
        detail: t('dashboard.transactionDeleted', { description: transaction.description }),
        life: 3000,
      });
    },
  });
}

function duplicateTransaction(transaction: DashboardTransaction) {
  toast.add({
    severity: 'info',
    summary: t('dashboard.duplicated'),
    detail: t('dashboard.transactionDuplicated', { description: transaction.description }),
    life: 3000,
  });
}

function onRowEditSave(event: { data: DashboardTransaction; index: number }) {
  toast.add({
    severity: 'success',
    summary: t('common.status.updated'),
    detail: t('dashboard.transactionUpdated', { description: event.data.description }),
    life: 3000,
  });
}
</script>

<template>
  <DashboardCard :title="t('dashboard.transactions')" icon="bi bi-receipt">
    <template #header-actions>
      <div class="flex items-center gap-2">
        <IconField icon-position="left">
          <InputIcon class="bi bi-search text-text-muted" />
          <InputText
            v-model="globalSearch"
            :placeholder="t('dashboard.searchTransactions')"
            class="h-8 w-44 text-xs"
          />
        </IconField>
        <Button
          v-if="selectedTransactions.length > 0"
          icon="bi bi-trash3"
          severity="danger"
          size="small"
          outlined
          :label="t('dashboard.deleteCount', { count: selectedTransactions.length })"
          @click="confirmDeleteMultiple"
        />
      </div>
    </template>

    <ConfirmDialog />

    <DataTable
      :value="transactions"
      v-model:selection="selectedTransactions"
      v-model:editing-rows="editingRows"
      :global-filter-fields="['description', 'categoryName', 'accountName', 'amount']"
      :paginator="true"
      :rows="5"
      :rows-per-page-options="[5, 10, 20]"
      edit-mode="row"
      data-key="id"
      sort-field="occurredAt"
      :sort-order="-1"
      selection-mode="multiple"
      striped-rows
      show-gridlines
      size="small"
      class="dashboard-table"
      @row-edit-save="onRowEditSave"
    >
      <Column selection-mode="multiple" header-style="width: 3rem" />

      <Column
        field="occurredAt"
        :header="t('dashboard.date')"
        :sortable="true"
        style="min-width: 110px"
      >
        <template #body="{ data }">
          <span class="text-xs font-medium text-text-muted">{{ formatDate(data.occurredAt) }}</span>
        </template>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" class="w-full text-xs" />
        </template>
      </Column>

      <Column
        field="categoryName"
        :header="t('dashboard.category')"
        :sortable="true"
        style="min-width: 120px"
      >
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <span
              class="h-2.5 w-2.5 rounded-full"
              :style="{ backgroundColor: data.categoryColor }"
            />
            <span class="text-xs font-medium">{{ data.categoryName }}</span>
          </div>
        </template>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" class="w-full text-xs" />
        </template>
      </Column>

      <Column
        field="accountName"
        :header="t('dashboard.account')"
        :sortable="true"
        style="min-width: 110px"
      >
        <template #body="{ data }">
          <span class="text-xs text-text-muted">{{ data.accountName }}</span>
        </template>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" class="w-full text-xs" />
        </template>
      </Column>

      <Column
        field="description"
        :header="t('dashboard.description')"
        :sortable="true"
        style="min-width: 150px"
      >
        <template #body="{ data }">
          <span class="text-xs font-medium">{{ data.description }}</span>
        </template>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" class="w-full text-xs" />
        </template>
      </Column>

      <Column
        field="amount"
        :header="t('dashboard.amount')"
        :sortable="true"
        style="min-width: 110px"
      >
        <template #body="{ data }">
          <span
            class="text-xs font-bold"
            :class="data.kind === 'income' ? 'text-emerald-500' : 'text-red-500'"
          >
            {{ formatMoney(data.amount, data.currency, data.kind) }}
          </span>
        </template>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" class="w-full text-xs" type="number" />
        </template>
      </Column>

      <Column field="kind" :header="t('dashboard.type')" :sortable="true" style="min-width: 90px">
        <template #body="{ data }">
          <Tag
            :value="data.kind === 'income' ? t('common.kind.income') : t('common.kind.expense')"
            :severity="data.kind === 'income' ? 'success' : 'danger'"
            class="text-xs"
          />
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

      <Column
        field="status"
        :header="t('dashboard.status')"
        :sortable="true"
        style="min-width: 100px"
      >
        <template #body="{ data }">
          <Tag
            :value="t(`common.status.${data.status}`)"
            :severity="statusSeverity[data.status]"
            class="text-xs"
          />
        </template>
        <template #editor="{ data, field }">
          <Select
            v-model="data[field]"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            class="w-full text-xs"
          />
        </template>
      </Column>

      <Column :header="t('dashboard.actions')" header-style="width: 8rem" style="min-width: 120px">
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
              icon="bi bi-copy"
              size="small"
              severity="secondary"
              text
              rounded
              class="action-btn"
              @click="duplicateTransaction(data)"
            />
            <Button
              icon="bi bi-trash3"
              size="small"
              severity="danger"
              text
              rounded
              class="action-btn"
              @click="confirmDeleteSingle(data)"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="flex flex-col items-center gap-3 py-8 text-text-muted">
          <i class="bi bi-inbox text-3xl" />
          <p class="text-sm font-medium">{{ t('dashboard.noTransactions') }}</p>
        </div>
      </template>
    </DataTable>
  </DashboardCard>
</template>

<style scoped>
.dashboard-table :deep(.p-datatable-table-container) {
  border-radius: 0.75rem;
  overflow: hidden;
}

.dashboard-table :deep(.p-datatable-thead > tr > th) {
  background-color: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.dashboard-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.dashboard-table :deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--color-surface-hover);
}

.dashboard-table :deep(.p-paginator) {
  padding: 0.5rem 0;
  background: transparent;
}

.dashboard-table :deep(.p-paginator .p-paginator-current) {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.action-btn {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 1;
}
</style>
