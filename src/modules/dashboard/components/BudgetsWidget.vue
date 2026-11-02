<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ProgressBar from 'primevue/progressbar';
import DashboardCard from '@/modules/dashboard/components/DashboardCard.vue';
import type { BudgetProgressItem } from '@/modules/dashboard/types';

interface Props {
  budgets: BudgetProgressItem[];
}

const props = defineProps<Props>();
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

const totalBudget = computed(() => props.budgets.reduce((sum, b) => sum + b.limit, 0));

const totalSpent = computed(() => props.budgets.reduce((sum, b) => sum + b.spent, 0));

const overallProgress = computed(() =>
  Math.min(Math.round((totalSpent.value / totalBudget.value) * 100), 100),
);

const isOverBudget = (budget: BudgetProgressItem) => budget.spent > budget.limit;
const isNearLimit = (budget: BudgetProgressItem) =>
  !isOverBudget(budget) && budget.spent / budget.limit >= 0.8;
</script>

<template>
  <DashboardCard :title="t('dashboard.budgets')" icon="bi bi-pie-chart">
    <!-- Overall Budget Summary -->
    <div class="mb-4 rounded-xl bg-surface-muted p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-medium text-text-muted">{{ t('dashboard.overallBudget') }}</p>
          <p class="mt-0.5 text-lg font-bold text-text">
            {{ formatMoney(totalSpent, 'USD') }}
            <span class="text-sm font-medium text-text-muted">
              / {{ formatMoney(totalBudget, 'USD') }}</span
            >
          </p>
        </div>
        <div class="text-right">
          <p class="text-xs font-medium text-text-muted">{{ t('dashboard.used') }}</p>
          <p
            class="mt-0.5 text-lg font-bold"
            :class="overallProgress > 90 ? 'text-red-500' : 'text-primary'"
          >
            {{ overallProgress }}%
          </p>
        </div>
      </div>
      <ProgressBar
        class="mt-3 h-2 overflow-hidden rounded-full"
        :pt="{
          value: {
            class: overallProgress > 90 ? 'bg-red-500' : 'bg-primary',
          },
        }"
        :show-value="false"
        :value="overallProgress"
      />
    </div>

    <!-- Individual Budgets -->
    <div class="grid gap-4">
      <div
        v-for="budget in budgets"
        :key="budget.id"
        class="group rounded-xl border border-border bg-surface-muted/50 p-3.5 transition-all hover:border-primary/20 hover:bg-surface-muted"
        :class="{
          'border-red-500/30 bg-red-500/5': isOverBudget(budget),
          'border-amber-500/30 bg-amber-500/5': isNearLimit(budget) && !isOverBudget(budget),
        }"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
              :class="budget.colorClass"
            >
              {{ budget.categoryName.charAt(0) }}
            </span>
            <div>
              <p class="text-sm font-semibold text-text">
                {{ budget.categoryName }}
              </p>
              <p class="text-xs text-text-muted">
                {{ formatMoney(budget.spent, budget.currency) }} {{ t('dashboard.of') }}
                {{ formatMoney(budget.limit, budget.currency) }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p
              class="text-sm font-bold"
              :class="isOverBudget(budget) ? 'text-red-500' : 'text-text'"
            >
              {{ formatMoney(budget.limit - budget.spent, budget.currency) }}
            </p>
            <p class="text-xs text-text-muted">
              {{ isOverBudget(budget) ? t('dashboard.over') : t('dashboard.left') }}
            </p>
          </div>
        </div>

        <ProgressBar
          class="mt-2.5 h-2 overflow-hidden rounded-full"
          :pt="{
            value: {
              class: isOverBudget(budget)
                ? 'bg-red-500'
                : isNearLimit(budget)
                  ? 'bg-amber-500'
                  : budget.colorClass,
            },
          }"
          :show-value="false"
          :value="progressValue(budget)"
        />

        <!-- Warning indicator -->
        <div
          v-if="isOverBudget(budget)"
          class="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500"
        >
          <i class="bi bi-exclamation-triangle-fill" />
          <span>
            {{
              t('dashboard.budgetExceeded', {
                amount: formatMoney(budget.spent - budget.limit, budget.currency),
              })
            }}
          </span>
        </div>
        <div
          v-else-if="isNearLimit(budget)"
          class="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-500"
        >
          <i class="bi bi-exclamation-circle-fill" />
          <span>{{ t('dashboard.nearLimit', { percent: 100 - progressValue(budget) }) }}</span>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>
