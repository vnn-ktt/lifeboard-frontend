<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import DashboardCard from '@/modules/dashboard/components/DashboardCard.vue';

const { t } = useI18n();
const toast = useToast();

const actions = computed(
  () =>
    [
      {
        icon: 'bi bi-plus-circle',
        label: t('dashboard.addTransaction'),
        severity: 'primary',
        action: 'add-transaction',
      },
      {
        icon: 'bi bi-tag',
        label: t('dashboard.addCategory'),
        severity: 'info',
        action: 'add-category',
      },
      {
        icon: 'bi bi-wallet',
        label: t('dashboard.createAccount'),
        severity: 'success',
        action: 'create-account',
      },
      {
        icon: 'bi bi-upload',
        label: t('dashboard.importCsv'),
        severity: 'warn',
        action: 'import-csv',
      },
      {
        icon: 'bi bi-download',
        label: t('dashboard.exportData'),
        severity: 'secondary',
        action: 'export-data',
      },
    ] as const,
);

function handleAction(action: string) {
  const actionNames: Record<string, string> = {
    'add-transaction': t('dashboard.addTransaction'),
    'add-category': t('dashboard.addCategory'),
    'create-account': t('dashboard.createAccount'),
    'import-csv': t('dashboard.importCsv'),
    'export-data': t('dashboard.exportData'),
  };
  toast.add({
    severity: 'info',
    summary: actionNames[action] || action,
    detail: t('dashboard.actionDialogHint', { action: actionNames[action] || action }),
    life: 3000,
  });
}
</script>

<template>
  <DashboardCard :title="t('dashboard.quickActions')" icon="bi bi-lightning">
    <div class="grid grid-cols-2 gap-3">
      <Button
        v-for="action in actions"
        :key="action.action"
        class="quick-action-btn flex h-auto flex-col items-center justify-center gap-2 rounded-xl p-4"
        :class="[
          action.severity === 'primary'
            ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
            : action.severity === 'secondary'
              ? 'bg-surface-muted text-text-muted hover:bg-surface-hover border border-border'
              : `bg-${action.severity}-500/10 text-${action.severity}-500 hover:bg-${action.severity}-500/20 border border-${action.severity}-500/20`,
        ]"
        :severity="undefined"
        outlined
        @click="handleAction(action.action)"
      >
        <span class="flex h-10 w-10 items-center justify-center rounded-xl text-xl">
          <i :class="action.icon" />
        </span>
        <span class="text-xs font-semibold leading-tight">{{ action.label }}</span>
      </Button>
    </div>
  </DashboardCard>
</template>

<style scoped>
.quick-action-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 5rem;
}

.quick-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
