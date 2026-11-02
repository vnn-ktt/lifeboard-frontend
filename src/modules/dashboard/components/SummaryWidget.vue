<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardCard from '@/modules/dashboard/components/DashboardCard.vue';
import type { BalanceSummaryTemplate } from '@/modules/dashboard/types';

interface Props {
  summary: BalanceSummaryTemplate;
}

const props = defineProps<Props>();
const { t } = useI18n();

const netCashFlow = computed(() => props.summary.income.amount - props.summary.expenses.amount);

const savingsRateChange = '+5%';
const expenseChange = '+12%';
const incomeChange = '+8%';

function formatMoney(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
}
</script>

<template>
  <DashboardCard :title="t('dashboard.summary')" icon="bi bi-wallet2" variant="primary">
    <div class="grid gap-5">
      <!-- Main Balance -->
      <div class="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
        <p class="text-xs font-medium uppercase tracking-wider text-text-muted">
          {{ t('dashboard.totalBalance') }}
        </p>
        <p class="mt-1 text-3xl font-bold tracking-tight text-text">
          {{ formatMoney(summary.totalBalance.amount, summary.totalBalance.currency) }}
        </p>
        <div class="mt-2 flex items-center gap-1.5">
          <span
            class="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500"
          >
            <i class="bi bi-arrow-up-short text-sm" />
            {{ savingsRateChange }}
          </span>
          <span class="text-xs text-text-muted">{{ t('dashboard.vsLastMonth') }}</span>
        </div>
      </div>

      <!-- Income / Expenses / Net -->
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl bg-surface-muted p-4 transition-colors hover:bg-emerald-500/5">
          <div class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500"
            >
              <i class="bi bi-arrow-down-left text-xs" />
            </span>
            <span class="text-xs font-semibold text-text-muted">{{ t('dashboard.income') }}</span>
          </div>
          <p class="mt-2 text-lg font-bold text-emerald-500">
            {{ formatMoney(summary.income.amount, summary.income.currency) }}
          </p>
          <div class="mt-1 flex items-center gap-1 text-xs text-emerald-500">
            <i class="bi bi-arrow-up-short" />
            {{ incomeChange }}
          </div>
        </div>

        <div class="rounded-xl bg-surface-muted p-4 transition-colors hover:bg-red-500/5">
          <div class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500"
            >
              <i class="bi bi-arrow-up-right text-xs" />
            </span>
            <span class="text-xs font-semibold text-text-muted">{{ t('dashboard.expenses') }}</span>
          </div>
          <p class="mt-2 text-lg font-bold text-red-500">
            {{ formatMoney(summary.expenses.amount, summary.expenses.currency) }}
          </p>
          <div class="mt-1 flex items-center gap-1 text-xs text-red-500">
            <i class="bi bi-arrow-up-short" />
            {{ expenseChange }}
          </div>
        </div>

        <div class="rounded-xl bg-surface-muted p-4 transition-colors hover:bg-primary/5">
          <div class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <i class="bi bi-piggy-bank text-xs" />
            </span>
            <span class="text-xs font-semibold text-text-muted">{{ t('dashboard.savings') }}</span>
          </div>
          <p class="mt-2 text-lg font-bold text-primary">{{ summary.savingsRate }}%</p>
          <div class="mt-1 flex items-center gap-1 text-xs text-primary">
            <i class="bi bi-arrow-up-short" />
            {{ t('dashboard.rate') }}
          </div>
        </div>
      </div>

      <!-- Net Cash Flow Bar -->
      <div
        class="flex items-center justify-between rounded-xl border border-border bg-surface-muted/50 px-4 py-3"
      >
        <span class="text-sm font-medium text-text-muted">{{ t('dashboard.netCashFlow') }}</span>
        <span
          class="text-lg font-bold"
          :class="netCashFlow >= 0 ? 'text-emerald-500' : 'text-red-500'"
        >
          {{ netCashFlow >= 0 ? '+' : ''
          }}{{ formatMoney(Math.abs(netCashFlow), summary.totalBalance.currency) }}
        </span>
      </div>
    </div>
  </DashboardCard>
</template>
