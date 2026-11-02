<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Chart from 'primevue/chart';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import DashboardCard from '@/modules/dashboard/components/DashboardCard.vue';
import type { ChartDataPoint, MonthlyTrendPoint } from '@/modules/dashboard/types';

interface Props {
  categoryExpenses: ChartDataPoint[];
  monthlyTrend: MonthlyTrendPoint[];
  balanceHistory: ChartDataPoint[];
}

const props = defineProps<Props>();
const { t } = useI18n();

const activeTab = ref('0');

const isDark = computed(() => document.documentElement.classList.contains('app-dark'));

const textColor = computed(() => (isDark.value ? '#94a3b8' : '#64748b'));

const gridColor = computed(() => (isDark.value ? '#1e293b' : '#e2e8f0'));

const categoryChartData = computed(() => ({
  labels: props.categoryExpenses.map((d) => d.label),
  datasets: [
    {
      data: props.categoryExpenses.map((d) => d.value),
      backgroundColor: props.categoryExpenses.map((d) => d.color),
      borderWidth: 0,
      hoverOffset: 8,
    },
  ],
}));

const categoryChartOptions = computed(() => ({
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
        pointStyle: 'circle',
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
          const pct = ((context.parsed / total) * 100).toFixed(1);
          return ` $${context.parsed.toLocaleString()} (${pct}%)`;
        },
      },
    },
  },
}));

const trendChartData = computed(() => ({
  labels: props.monthlyTrend.map((d) => d.label),
  datasets: [
    {
      label: t('dashboard.income'),
      data: props.monthlyTrend.map((d) => d.income),
      backgroundColor: isDark.value ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
      borderColor: '#10b981',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: isDark.value ? '#0f172a' : '#ffffff',
      pointBorderWidth: 2,
    },
    {
      label: t('dashboard.expenses'),
      data: props.monthlyTrend.map((d) => d.expenses),
      backgroundColor: isDark.value ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
      borderColor: '#ef4444',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#ef4444',
      pointBorderColor: isDark.value ? '#0f172a' : '#ffffff',
      pointBorderWidth: 2,
    },
  ],
}));

const trendChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      align: 'end' as const,
      labels: {
        color: textColor.value,
        font: { size: 11, family: 'Inter, sans-serif' },
        padding: 16,
        usePointStyle: true,
        pointStyle: 'circle',
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
        label: (context: any) => ` ${context.dataset.label}: $${context.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: textColor.value, font: { size: 11 } },
    },
    y: {
      grid: { color: gridColor.value },
      ticks: {
        color: textColor.value,
        font: { size: 11 },
        callback: (value: number) => `$${(value / 1000).toFixed(0)}k`,
      },
    },
  },
}));

const balanceChartData = computed(() => ({
  labels: props.balanceHistory.map((d) => d.label),
  datasets: [
    {
      label: t('dashboard.balance'),
      data: props.balanceHistory.map((d) => d.value),
      backgroundColor: isDark.value ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
      borderColor: '#10b981',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: isDark.value ? '#0f172a' : '#ffffff',
      pointBorderWidth: 2,
    },
  ],
}));

const balanceChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? '#1e293b' : '#ffffff',
      titleColor: isDark.value ? '#f1f5f9' : '#0f172a',
      bodyColor: isDark.value ? '#94a3b8' : '#64748b',
      borderColor: isDark.value ? '#334155' : '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => ` $${context.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: textColor.value, font: { size: 11 } },
    },
    y: {
      grid: { color: gridColor.value },
      ticks: {
        color: textColor.value,
        font: { size: 11 },
        callback: (value: number) => `$${(value / 1000).toFixed(0)}k`,
      },
    },
  },
}));
</script>

<template>
  <DashboardCard :title="t('dashboard.analytics')" icon="bi bi-graph-up">
    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="0">
          <div class="flex items-center gap-1.5 text-xs">
            <i class="bi bi-pie-chart" />
            <span>{{ t('dashboard.categoriesTab') }}</span>
          </div>
        </Tab>
        <Tab value="1">
          <div class="flex items-center gap-1.5 text-xs">
            <i class="bi bi-bar-chart-line" />
            <span>{{ t('dashboard.trendTab') }}</span>
          </div>
        </Tab>
        <Tab value="2">
          <div class="flex items-center gap-1.5 text-xs">
            <i class="bi bi-activity" />
            <span>{{ t('dashboard.balanceTab') }}</span>
          </div>
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="0">
          <div class="flex items-center justify-center py-2" style="height: 220px">
            <Chart
              type="doughnut"
              :data="categoryChartData"
              :options="categoryChartOptions"
              class="h-full w-full"
            />
          </div>
        </TabPanel>

        <TabPanel value="1">
          <div style="height: 220px">
            <Chart
              type="line"
              :data="trendChartData"
              :options="trendChartOptions"
              class="h-full w-full"
            />
          </div>
        </TabPanel>

        <TabPanel value="2">
          <div style="height: 220px">
            <Chart
              type="line"
              :data="balanceChartData"
              :options="balanceChartOptions"
              class="h-full w-full"
            />
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </DashboardCard>
</template>
