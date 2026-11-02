<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Skeleton from 'primevue/skeleton';
import type { MonthlySpendingPoint } from '@/modules/dashboard/types';

interface Props {
  errorMessage?: string;
  isLoading?: boolean;
  points: readonly MonthlySpendingPoint[];
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: '',
  isLoading: false,
});

const { t } = useI18n();

const maxAmount = computed(() => Math.max(...props.points.map((point) => point.budget), 1));

function barHeight(point: MonthlySpendingPoint) {
  return `${Math.max((point.amount / maxAmount.value) * 100, 8)}%`;
}

function usageLabel(point: MonthlySpendingPoint) {
  return `${Math.round((point.amount / point.budget) * 100)}%`;
}
</script>

<template>
  <Card class="h-full border border-border bg-surface shadow-sm">
    <template #title>
      <div class="flex items-center justify-between gap-4">
        <span class="text-base font-bold text-text">{{ t('dashboard.monthlySpending') }}</span>
        <span
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-primary"
        >
          <i class="bi bi-bar-chart-line" />
        </span>
      </div>
    </template>

    <template #content>
      <div v-if="props.isLoading" class="grid gap-4">
        <Skeleton height="12rem" />
        <Skeleton height="1rem" width="60%" />
      </div>

      <Message v-else-if="props.errorMessage" severity="error" :closable="false">
        {{ props.errorMessage }}
      </Message>

      <div
        v-else-if="props.points.length === 0"
        class="rounded-lg border border-dashed border-border bg-surface p-5 text-sm font-medium text-text-muted"
      >
        {{ t('dashboard.emptySpending') }}
      </div>

      <div v-else>
        <div class="flex h-56 items-end gap-3 rounded-lg bg-surface-muted px-4 pb-4 pt-6">
          <div
            v-for="point in props.points"
            :key="point.label"
            class="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <div class="flex h-40 w-full items-end rounded-md bg-surface">
              <div
                class="w-full rounded-md bg-primary transition-all"
                :style="{ height: barHeight(point) }"
                :title="
                  t('dashboard.spendingBarTitle', { label: point.label, value: usageLabel(point) })
                "
              />
            </div>
            <span class="text-xs font-bold text-primary">{{ point.label }}</span>
          </div>
        </div>

        <p class="m-0 mt-4 text-sm font-medium text-text-muted">
          {{
            t('dashboard.currentMonthPacing', {
              value: usageLabel(props.points[props.points.length - 1]),
            })
          }}
        </p>
      </div>
    </template>
  </Card>
</template>
