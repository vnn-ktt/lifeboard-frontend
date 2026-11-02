<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Skeleton from 'primevue/skeleton';
import type { MoneyAmount } from '@/shared/types';
import type { BalanceSummaryTemplate } from '@/modules/dashboard/types';

interface Props {
  errorMessage?: string;
  isLoading?: boolean;
  summary: BalanceSummaryTemplate | null;
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: '',
  isLoading: false,
});

const { t } = useI18n();

function formatMoney(value: MoneyAmount) {
  return new Intl.NumberFormat('en-US', {
    currency: value.currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value.amount);
}
</script>

<template>
  <Card class="h-full border border-border bg-surface shadow-sm">
    <template #title>
      <div class="flex items-center justify-between gap-4">
        <span class="text-base font-bold text-text">{{ t('dashboard.totalBalance') }}</span>
        <span
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-primary"
        >
          <i class="bi bi-wallet2" />
        </span>
      </div>
    </template>

    <template #content>
      <div v-if="props.isLoading" class="grid gap-5">
        <Skeleton height="2.5rem" width="70%" />
        <div class="grid gap-3 sm:grid-cols-2">
          <Skeleton height="4.5rem" />
          <Skeleton height="4.5rem" />
        </div>
      </div>

      <Message v-else-if="props.errorMessage" severity="error" :closable="false">
        {{ props.errorMessage }}
      </Message>

      <div
        v-else-if="!props.summary"
        class="rounded-lg border border-dashed border-border bg-surface p-5 text-sm font-medium text-text-muted"
      >
        {{ t('dashboard.emptyBalance') }}
      </div>

      <div v-else>
        <p class="m-0 text-3xl font-bold leading-tight text-text sm:text-4xl">
          {{ formatMoney(props.summary.totalBalance) }}
        </p>
        <p class="m-0 mt-2 text-sm font-medium text-text-muted">
          {{ t('dashboard.savingsRateValue', { value: props.summary.savingsRate }) }}
        </p>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg bg-surface-muted p-4">
            <div class="flex items-center gap-2 text-sm font-bold text-primary">
              <i class="bi bi-arrow-down-left" />
              {{ t('dashboard.income') }}
            </div>
            <p class="m-0 mt-2 text-xl font-bold text-text">
              {{ formatMoney(props.summary.income) }}
            </p>
          </div>

          <div class="rounded-lg bg-surface-muted p-4">
            <div class="flex items-center gap-2 text-sm font-bold text-danger">
              <i class="bi bi-arrow-up-right" />
              {{ t('dashboard.expenses') }}
            </div>
            <p class="m-0 mt-2 text-xl font-bold text-text">
              {{ formatMoney(props.summary.expenses) }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
