<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Chart from 'primevue/chart';
import type {
  BalanceSummaryTemplate,
  ChartDataPoint,
  DashboardTransaction,
  MonthlyTrendPoint,
} from '@/modules/dashboard/types';

interface Props {
  balanceHistory: ChartDataPoint[];
  categoryExpenses: ChartDataPoint[];
  monthlyTrend: MonthlyTrendPoint[];
  summary: BalanceSummaryTemplate;
  transactions: DashboardTransaction[];
}

const props = defineProps<Props>();
const { locale, t } = useI18n();

const currency = computed(() => props.summary.totalBalance.currency);
const totalExpenses = computed(() =>
  props.categoryExpenses.reduce((sum, item) => sum + item.value, 0),
);
const topCategories = computed(() =>
  [...props.categoryExpenses].sort((a, b) => b.value - a.value).slice(0, 4),
);
const recentTransactions = computed(() =>
  [...props.transactions]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 5),
);

const cashFlowChartData = computed(() => ({
  labels: props.monthlyTrend.map((item) => item.label),
  datasets: [
    {
      data: props.balanceHistory.map((item) => item.value),
      borderColor: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.42,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointBackgroundColor: '#ffffff',
    },
  ],
}));

const cashFlowChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' as const },
  plugins: {
    legend: { display: false },
    tooltip: {
      displayColors: false,
      callbacks: {
        label: (context: any) => formatMoney(context.parsed.y),
      },
    },
  },
  scales: {
    x: {
      border: { display: false },
      grid: { display: false },
      ticks: { color: 'rgba(255,255,255,.68)', font: { size: 10 } },
    },
    y: { display: false },
  },
};

const spendingChartData = computed(() => ({
  labels: topCategories.value.map((item) => item.label),
  datasets: [
    {
      data: topCategories.value.map((item) => item.value),
      backgroundColor: topCategories.value.map((item) => item.color),
      borderColor: 'transparent',
      borderWidth: 0,
      hoverOffset: 3,
      spacing: 3,
      borderRadius: 5,
    },
  ],
}));

const spendingChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '74%',
  plugins: {
    legend: { display: false },
    tooltip: {
      displayColors: false,
      callbacks: {
        label: (context: any) => formatMoney(context.parsed),
      },
    },
  },
};

function formatMoney(amount: number, withSign = false) {
  const formatted = new Intl.NumberFormat(locale.value, {
    currency: currency.value,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Math.abs(amount));

  if (!withSign) return formatted;
  return `${amount >= 0 ? '+' : '−'}${formatted}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}

function categoryShare(value: number) {
  return totalExpenses.value > 0 ? Math.round((value / totalExpenses.value) * 100) : 0;
}
</script>

<template>
  <div class="mobile-dashboard">
    <section class="hero-card">
      <div class="hero-card__glow" />
      <div class="relative z-10">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
              {{ t('dashboard.totalBalance') }}
            </p>
            <p class="m-0 mt-1 text-[2rem] font-bold tracking-[-0.04em] text-white">
              {{ formatMoney(summary.totalBalance.amount) }}
            </p>
          </div>
          <span
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white/14 text-white"
          >
            <i class="bi bi-wallet2 text-lg" />
          </span>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <div class="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur">
            <p class="m-0 text-[10px] font-medium text-white/60">{{ t('dashboard.income') }}</p>
            <p class="m-0 mt-0.5 text-sm font-bold text-white">
              {{ formatMoney(summary.income.amount, true) }}
            </p>
          </div>
          <div class="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur">
            <p class="m-0 text-[10px] font-medium text-white/60">{{ t('dashboard.expenses') }}</p>
            <p class="m-0 mt-0.5 text-sm font-bold text-white">
              {{ formatMoney(-summary.expenses.amount, true) }}
            </p>
          </div>
        </div>

        <div class="mt-4 h-28">
          <Chart
            type="line"
            :data="cashFlowChartData"
            :options="cashFlowChartOptions"
            class="h-full w-full"
          />
        </div>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-3">
      <article class="metric-card">
        <span class="metric-card__icon bg-primary/10 text-primary">
          <i class="bi bi-piggy-bank" />
        </span>
        <p class="m-0 mt-3 text-2xl font-bold tracking-tight text-text">
          {{ summary.savingsRate }}%
        </p>
        <p class="m-0 mt-0.5 text-[11px] font-medium text-text-muted">
          {{ t('dashboard.savingsRate') }}
        </p>
      </article>
      <article class="metric-card">
        <span class="metric-card__icon bg-amber-500/10 text-amber-500">
          <i class="bi bi-receipt-cutoff" />
        </span>
        <p class="m-0 mt-3 text-2xl font-bold tracking-tight text-text">
          {{ transactions.length }}
        </p>
        <p class="m-0 mt-0.5 text-[11px] font-medium text-text-muted">
          {{ t('dashboard.transactions') }}
        </p>
      </article>
    </section>

    <section class="section-card">
      <div class="flex items-center justify-between">
        <div>
          <p class="m-0 text-sm font-bold text-text">{{ t('dashboard.categories') }}</p>
          <p class="m-0 mt-0.5 text-[11px] text-text-muted">{{ t('dashboard.expenses') }}</p>
        </div>
        <p class="m-0 text-sm font-bold text-text">{{ formatMoney(totalExpenses) }}</p>
      </div>

      <div v-if="topCategories.length" class="mt-5 grid grid-cols-[112px_1fr] items-center gap-4">
        <div class="relative h-28">
          <Chart
            type="doughnut"
            :data="spendingChartData"
            :options="spendingChartOptions"
            class="h-full w-full"
          />
          <div
            class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          >
            <span class="text-lg font-bold text-text">{{ topCategories.length }}</span>
            <span class="text-[9px] text-text-muted">{{ t('dashboard.categories') }}</span>
          </div>
        </div>

        <div class="grid gap-3">
          <div v-for="category in topCategories" :key="category.label" class="grid gap-1">
            <div class="flex items-center justify-between gap-2">
              <div class="flex min-w-0 items-center gap-2">
                <span
                  class="h-2 w-2 shrink-0 rounded-full"
                  :style="{ backgroundColor: category.color }"
                />
                <span class="truncate text-[11px] font-medium text-text">{{ category.label }}</span>
              </div>
              <span class="text-[10px] font-bold text-text-muted">
                {{ categoryShare(category.value) }}%
              </span>
            </div>
            <div class="h-1 overflow-hidden rounded-full bg-surface-muted">
              <div
                class="h-full rounded-full"
                :style="{
                  backgroundColor: category.color,
                  width: `${categoryShare(category.value)}%`,
                }"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="mt-4 rounded-xl bg-surface-muted p-4 text-xs text-text-muted">
        {{ t('dashboard.emptySpending') }}
      </div>
    </section>

    <section class="section-card">
      <div class="flex items-center justify-between">
        <div>
          <p class="m-0 text-sm font-bold text-text">{{ t('dashboard.recentTransactions') }}</p>
          <p class="m-0 mt-0.5 text-[11px] text-text-muted">{{ t('dashboard.account') }}</p>
        </div>
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-text-muted"
        >
          <i class="bi bi-arrow-down-up text-xs" />
        </span>
      </div>

      <div v-if="recentTransactions.length" class="mt-3 divide-y divide-border">
        <article
          v-for="transaction in recentTransactions"
          :key="transaction.id"
          class="flex items-center gap-3 py-3"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm"
            :style="{
              backgroundColor: `${transaction.categoryColor}18`,
              color: transaction.categoryColor,
            }"
          >
            <i :class="transaction.kind === 'income' ? 'bi bi-arrow-down-left' : 'bi bi-bag'" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="m-0 truncate text-xs font-semibold text-text">
              {{ transaction.description }}
            </p>
            <p class="m-0 mt-0.5 truncate text-[10px] text-text-muted">
              {{ transaction.categoryName }} · {{ formatDate(transaction.occurredAt) }}
            </p>
          </div>
          <p
            class="m-0 shrink-0 text-xs font-bold"
            :class="transaction.kind === 'income' ? 'text-primary' : 'text-text'"
          >
            {{
              formatMoney(
                transaction.kind === 'income' ? transaction.amount : -transaction.amount,
                true,
              )
            }}
          </p>
        </article>
      </div>
      <p v-else class="m-0 mt-4 text-xs text-text-muted">
        {{ t('dashboard.emptyRecentTransactions') }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.mobile-dashboard {
  display: grid;
  gap: 0.875rem;
}

.hero-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  padding: 1.25rem;
  background: linear-gradient(145deg, #047857 0%, #059669 52%, #10b981 100%);
  box-shadow: 0 18px 40px -22px rgb(5 150 105 / 0.85);
}

.hero-card__glow {
  position: absolute;
  right: -3rem;
  top: -4rem;
  width: 11rem;
  height: 11rem;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.14);
  filter: blur(2px);
}

.metric-card,
.section-card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.metric-card {
  border-radius: 1.125rem;
  padding: 1rem;
}

.metric-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.75rem;
}

.section-card {
  border-radius: 1.25rem;
  padding: 1rem;
}
</style>
