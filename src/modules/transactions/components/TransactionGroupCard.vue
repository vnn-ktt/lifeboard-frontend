<script lang="ts" setup>
import Button from 'primevue/button';
import Card from 'primevue/card';
import MoneyDisplay from '@/shared/components/MoneyDisplay.vue';
import type { TransactionItem } from '@/modules/transactions/types';

interface Props {
  groupLabel: string;
  groupSubtitle: string;
  totalAmount: number;
  currency: string;
  transactions: readonly TransactionItem[];
}

const props = withDefaults(defineProps<Props>(), {
  groupSubtitle: '',
});

const emit = defineEmits<{
  (event: 'open', transaction: TransactionItem): void;
}>();
</script>

<template>
  <Card class="border border-border bg-surface shadow-sm">
    <template #title>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-text">
            {{ props.groupLabel }}
          </p>
          <p class="m-0 text-sm text-text-muted">
            {{ props.groupSubtitle }}
          </p>
        </div>

        <div
          class="rounded-3xl border border-border bg-surface-alt px-4 py-2 text-sm font-semibold text-text"
        >
          <MoneyDisplay :amount="props.totalAmount" :currency="props.currency" />
        </div>
      </div>
    </template>

    <template #content>
      <div class="grid gap-3">
        <Button
          v-for="transaction in props.transactions"
          :key="transaction.id"
          type="button"
          text
          class="w-full rounded-3xl border border-border bg-bg p-4 text-left text-text hover:border-primary"
          @click="emit('open', transaction)"
        >
          <div class="flex items-center gap-4">
            <span
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl"
              :style="{
                backgroundColor: transaction.categoryColor + '20',
                color: transaction.categoryColor,
              }"
            >
              <i :class="transaction.categoryIcon" />
            </span>
            <div class="min-w-0">
              <p class="m-0 truncate text-sm font-semibold text-text">
                {{ transaction.description ?? 'Transaction' }}
              </p>
              <p class="mt-1 text-xs text-text-muted">
                {{ transaction.categoryName }} · {{ transaction.accountName }}
              </p>
            </div>
            <span class="ml-auto text-sm font-bold">
              <MoneyDisplay
                :amount="transaction.amount"
                :currency="transaction.currency"
                :kind="transaction.kind"
                show-sign
              />
            </span>
          </div>
        </Button>
      </div>
    </template>
  </Card>
</template>
