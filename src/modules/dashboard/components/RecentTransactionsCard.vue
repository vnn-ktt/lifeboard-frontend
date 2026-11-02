<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import type { DashboardTransaction } from '@/modules/dashboard/types';

interface Props {
  errorMessage?: string;
  isLoading?: boolean;
  transactions: readonly DashboardTransaction[];
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: '',
  isLoading: false,
});

const { t } = useI18n();

function formatMoney(transaction: DashboardTransaction) {
  const value = new Intl.NumberFormat('en-US', {
    currency: transaction.currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(transaction.amount);

  return transaction.kind === 'income' ? `+${value}` : `-${value}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}
</script>

<template>
  <Card class="h-full border border-border bg-surface shadow-sm">
    <template #title>
      <div class="flex items-center justify-between gap-4">
        <span class="text-base font-bold text-text">{{ t('dashboard.recentTransactions') }}</span>
        <span
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-primary"
        >
          <i class="bi bi-receipt" />
        </span>
      </div>
    </template>

    <template #content>
      <div v-if="props.isLoading" class="grid gap-4">
        <Skeleton v-for="index in 4" :key="index" height="3.75rem" />
      </div>

      <Message v-else-if="props.errorMessage" severity="error" :closable="false">
        {{ props.errorMessage }}
      </Message>

      <div
        v-else-if="props.transactions.length === 0"
        class="rounded-lg border border-dashed border-border bg-surface p-5 text-sm font-medium text-text-muted"
      >
        {{ t('dashboard.emptyRecentTransactions') }}
      </div>

      <div v-else class="grid gap-3">
        <div
          v-for="transaction in props.transactions"
          :key="transaction.id"
          class="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface-muted p-3"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
              :class="
                transaction.kind === 'income'
                  ? 'bg-surface-muted text-primary'
                  : 'bg-surface-muted text-danger'
              "
            >
              <i
                :class="
                  transaction.kind === 'income' ? 'bi bi-arrow-down-left' : 'bi bi-arrow-up-right'
                "
              />
            </span>
            <div class="min-w-0">
              <p class="m-0 truncate text-sm font-bold text-text">
                {{ transaction.description }}
              </p>
              <div class="mt-1 flex flex-wrap items-center gap-2">
                <Tag
                  :severity="transaction.kind === 'income' ? 'success' : 'secondary'"
                  :value="transaction.categoryName"
                />
                <span class="text-xs font-medium text-text-muted">{{
                  formatDate(transaction.occurredAt)
                }}</span>
              </div>
            </div>
          </div>

          <span
            class="shrink-0 text-sm font-bold"
            :class="transaction.kind === 'income' ? 'text-primary' : 'text-danger'"
          >
            {{ formatMoney(transaction) }}
          </span>
        </div>
      </div>
    </template>
  </Card>
</template>
