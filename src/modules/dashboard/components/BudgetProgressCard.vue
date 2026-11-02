<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import Skeleton from 'primevue/skeleton';
import type { BudgetProgressItem } from '@/modules/dashboard/types';

interface Props {
  budgets: readonly BudgetProgressItem[];
  errorMessage?: string;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: '',
  isLoading: false,
});

const { t } = useI18n();

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
}

function progressValue(budget: BudgetProgressItem) {
  return Math.min(Math.round((budget.spent / budget.limit) * 100), 100);
}
</script>

<template>
  <Card class="h-full border border-border bg-surface shadow-sm">
    <template #title>
      <div class="flex items-center justify-between gap-4">
        <span class="text-base font-bold text-text">{{ t('dashboard.budgetProgress') }}</span>
        <span
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-primary"
        >
          <i class="bi bi-pie-chart" />
        </span>
      </div>
    </template>

    <template #content>
      <div v-if="props.isLoading" class="grid gap-5">
        <Skeleton v-for="index in 3" :key="index" height="4.25rem" />
      </div>

      <Message v-else-if="props.errorMessage" severity="error" :closable="false">
        {{ props.errorMessage }}
      </Message>

      <div
        v-else-if="props.budgets.length === 0"
        class="rounded-lg border border-dashed border-border bg-surface p-5 text-sm font-medium text-text-muted"
      >
        {{ t('dashboard.emptyBudgets') }}
      </div>

      <div v-else class="grid gap-5">
        <div v-for="budget in props.budgets" :key="budget.id" class="grid gap-2">
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm font-bold text-text">{{ budget.categoryName }}</span>
            <span class="text-sm font-semibold text-text-muted">
              {{ formatMoney(budget.spent, budget.currency) }} /
              {{ formatMoney(budget.limit, budget.currency) }}
            </span>
          </div>
          <ProgressBar
            class="h-3 overflow-hidden"
            :pt="{ value: { class: budget.colorClass } }"
            :show-value="false"
            :value="progressValue(budget)"
          />
        </div>
      </div>
    </template>
  </Card>
</template>
