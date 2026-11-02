<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DashboardCard from '@/modules/dashboard/components/DashboardCard.vue';
import type { DashboardActivity } from '@/modules/dashboard/types';

interface Props {
  activities: DashboardActivity[];
}

defineProps<Props>();

const { t } = useI18n();

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('dashboard.justNow');
  if (diffMins < 60) return t('dashboard.minutesAgo', { mins: diffMins });
  if (diffHours < 24) return t('dashboard.hoursAgo', { hours: diffHours });
  if (diffDays < 7) return t('dashboard.daysAgo', { days: diffDays });
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function getActionIcon(action: DashboardActivity['action']) {
  const icons: Record<string, string> = {
    created: 'bi bi-plus-circle-fill text-emerald-500',
    updated: 'bi bi-pencil-fill text-sky-500',
    deleted: 'bi bi-trash3-fill text-red-500',
    imported: 'bi bi-upload text-amber-500',
  };
  return icons[action] || 'bi bi-circle-fill text-text-muted';
}

function getEntityIcon(entityType: DashboardActivity['entityType']) {
  const icons: Record<string, string> = {
    transaction: 'bi bi-receipt',
    category: 'bi bi-tag',
    account: 'bi bi-wallet',
    budget: 'bi bi-pie-chart',
    goal: 'bi bi-flag',
  };
  return icons[entityType] || 'bi bi-circle';
}
</script>

<template>
  <DashboardCard :title="t('dashboard.recentActivity')" icon="bi bi-activity">
    <div class="grid gap-1.5">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="group flex items-start gap-3 rounded-xl p-3 transition-all hover:bg-surface-muted"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-xs"
        >
          <i :class="getActionIcon(activity.action)" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <i class="text-xs text-text-muted" :class="getEntityIcon(activity.entityType)" />
            <p class="truncate text-sm font-medium text-text">
              {{ activity.description }}
            </p>
          </div>
          <p class="mt-0.5 text-xs text-text-muted">
            {{ formatTimestamp(activity.timestamp) }}
          </p>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>
