<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import DashboardCard from '@/modules/dashboard/components/DashboardCard.vue';
import type { DashboardAccount } from '@/modules/dashboard/types';

interface Props {
  accounts: DashboardAccount[];
}

defineProps<Props>();

const { t } = useI18n();
const toast = useToast();

const typeSeverity: Record<string, 'success' | 'warn' | 'info' | 'secondary' | 'contrast'> = {
  debit: 'success',
  credit: 'warn',
  savings: 'info',
  cash: 'secondary',
  investment: 'contrast',
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
}

function showAction(action: string, name: string) {
  toast.add({
    severity: 'info',
    summary: action,
    detail: t('dashboard.actionToast', { action, name }),
    life: 3000,
  });
}
</script>

<template>
  <DashboardCard :title="t('dashboard.accounts')" icon="bi bi-wallet2">
    <template #header-actions>
      <Button
        icon="bi bi-plus-lg"
        size="small"
        severity="primary"
        :label="t('dashboard.addAccount')"
        @click="showAction(t('common.actions.create'), t('dashboard.newAccount'))"
      />
    </template>

    <DataTable
      :value="accounts"
      data-key="id"
      striped-rows
      show-gridlines
      size="small"
      class="dashboard-table"
    >
      <Column field="name" :header="t('dashboard.name')" :sortable="true" style="min-width: 130px">
        <template #body="{ data }">
          <span class="text-xs font-medium">{{ data.name }}</span>
        </template>
      </Column>

      <Column field="type" :header="t('dashboard.type')" :sortable="true" style="width: 100px">
        <template #body="{ data }">
          <Tag :value="data.type" :severity="typeSeverity[data.type]" class="text-xs" />
        </template>
      </Column>

      <Column field="currency" :header="t('dashboard.currency')" style="width: 80px">
        <template #body="{ data }">
          <span class="text-xs font-medium text-text-muted">{{ data.currency }}</span>
        </template>
      </Column>

      <Column
        field="balance"
        :header="t('dashboard.balance')"
        :sortable="true"
        style="min-width: 110px"
      >
        <template #body="{ data }">
          <span
            class="text-xs font-bold"
            :class="data.balance >= 0 ? 'text-emerald-500' : 'text-red-500'"
          >
            {{ formatMoney(data.balance, data.currency) }}
          </span>
        </template>
      </Column>

      <Column
        field="transactionCount"
        :header="t('dashboard.transactionCount')"
        :sortable="true"
        style="width: 100px"
      >
        <template #body="{ data }">
          <span class="text-xs text-text-muted">{{ data.transactionCount }}</span>
        </template>
      </Column>

      <Column :header="t('dashboard.actions')" header-style="width: 6rem" style="width: 100px">
        <template #body="{ data }">
          <div class="flex items-center gap-1">
            <Button
              icon="bi bi-pencil-square"
              size="small"
              severity="secondary"
              text
              rounded
              class="action-btn"
              @click="showAction(t('common.actions.edit'), data.name)"
            />
            <Button
              icon="bi bi-trash3"
              size="small"
              severity="danger"
              text
              rounded
              class="action-btn"
              @click="showAction(t('common.actions.delete'), data.name)"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="flex flex-col items-center gap-3 py-8 text-text-muted">
          <i class="bi bi-wallet text-3xl" />
          <p class="text-sm font-medium">{{ t('dashboard.noAccounts') }}</p>
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

.action-btn {
  opacity: 0.6;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 1;
}
</style>
