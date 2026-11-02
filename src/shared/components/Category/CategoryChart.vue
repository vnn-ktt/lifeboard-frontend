<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Chart from 'primevue/chart';
import type { CategoryTemplate } from '@/shared/types';

interface Props {
  categories: CategoryTemplate[];
  /** Optional spending amounts per category id for the chart */
  amounts?: Record<string, number>;
  currency?: string;
}

const props = withDefaults(defineProps<Props>(), {
  amounts: () => ({}),
  currency: 'RUB',
});

const { t } = useI18n();

const isDark = computed(() => document.documentElement.classList.contains('app-dark'));

const textColor = computed(() => (isDark.value ? '#94a3b8' : '#64748b'));

const chartItems = computed(() =>
  props.categories
    .filter((c) => (props.amounts[c.id] || 0) > 0)
    .map((c) => ({
      label: c.name,
      value: props.amounts[c.id] || 0,
      color: c.color,
    })),
);

const hasChartData = computed(() => chartItems.value.length > 0);

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    currency: props.currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

const chartData = computed(() => {
  return {
    labels: chartItems.value.map((d) => d.label),
    datasets: [
      {
        data: chartItems.value.map((d) => d.value),
        backgroundColor: chartItems.value.map((d) => d.color),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        color: textColor.value,
        font: { size: 11, family: 'Inter, sans-serif' },
        padding: 12,
        usePointStyle: true,
        pointStyle: 'circle' as const,
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? '#1e293b' : '#ffffff',
      titleColor: isDark.value ? '#f1f5f9' : '#0f172a',
      bodyColor: isDark.value ? '#94a3b8' : '#64748b',
      borderColor: isDark.value ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => {
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0';
          return ` ${context.label}: ${formatCurrency(context.parsed)} (${pct}%)`;
        },
      },
    },
  },
}));
</script>

<template>
  <div class="category-chart">
    <h3 class="mb-4 text-lg font-bold text-text">{{ t('category.distribution') }}</h3>
    <div class="flex items-center justify-center" style="height: 280px">
      <Chart
        v-if="hasChartData"
        type="doughnut"
        :data="chartData"
        :options="chartOptions"
        class="h-full w-full"
      />
      <div v-else class="flex flex-col items-center gap-2 text-text-muted">
        <i class="bi bi-pie-chart text-4xl" />
        <p class="text-sm">{{ t('category.emptyChart') }}</p>
      </div>
    </div>
  </div>
</template>
