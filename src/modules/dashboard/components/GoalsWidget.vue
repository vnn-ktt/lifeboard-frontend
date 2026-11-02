<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardCard from '@/modules/dashboard/components/DashboardCard.vue';
import type { DashboardGoal } from '@/modules/dashboard/types';
import { RouteName } from '@/shared/constants/route-name';

interface Props {
  goals: DashboardGoal[];
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

function progressValue(goal: DashboardGoal) {
  return Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
}

function daysRemaining(deadline: string) {
  const now = new Date();
  const end = new Date(deadline);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

const sortedGoals = computed(() =>
  [...props.goals].sort((a, b) => {
    const aPct = a.currentAmount / a.targetAmount;
    const bPct = b.currentAmount / b.targetAmount;
    return aPct - bPct;
  }),
);
</script>

<template>
  <DashboardCard :title="t('dashboard.goals')" icon="bi bi-flag">
    <div v-if="!goals.length" class="grid justify-items-center gap-2 py-8 text-center">
      <i class="bi bi-flag text-2xl text-primary" aria-hidden="true" />
      <p class="text-sm text-text-muted">{{ t('goals.emptyTitle') }}</p>
      <RouterLink :to="{ name: RouteName.GOALS }" class="text-sm font-semibold text-primary">
        {{ t('goals.add') }}
      </RouterLink>
    </div>
    <div class="grid gap-4">
      <div
        v-for="goal in sortedGoals"
        :key="goal.id"
        class="group rounded-xl border border-border bg-surface-muted/50 p-4 transition-all hover:border-primary/20 hover:bg-surface-muted"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-text">
              {{ goal.name }}
            </p>
            <p class="mt-0.5 text-xs text-text-muted">
              {{ formatMoney(goal.currentAmount, goal.currency) }}
              <span class="text-text-muted/60">{{ t('dashboard.of') }}</span>
              {{ formatMoney(goal.targetAmount, goal.currency) }}
            </p>
          </div>
          <div class="shrink-0 text-right">
            <p
              class="text-sm font-bold"
              :class="progressValue(goal) >= 100 ? 'text-emerald-500' : 'text-primary'"
            >
              {{ progressValue(goal) }}%
            </p>
            <p class="mt-0.5 text-xs text-text-muted">
              <template v-if="daysRemaining(goal.deadline) > 0">
                {{ t('dashboard.daysLeft', { days: daysRemaining(goal.deadline) }) }}
              </template>
              <template v-else-if="daysRemaining(goal.deadline) === 0">
                {{ t('dashboard.dueToday') }}
              </template>
              <template v-else>{{ t('dashboard.overdue') }}</template>
            </p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            class="h-full rounded-full transition-all duration-700 ease-out"
            :class="
              progressValue(goal) >= 100
                ? 'bg-emerald-500'
                : progressValue(goal) >= 75
                  ? 'bg-primary'
                  : progressValue(goal) >= 50
                    ? 'bg-sky-500'
                    : 'bg-amber-500'
            "
            :style="{ width: `${progressValue(goal)}%` }"
          />
        </div>

        <!-- Remaining amount -->
        <div
          v-if="progressValue(goal) < 100"
          class="mt-2 flex items-center gap-1 text-xs text-text-muted"
        >
          <i class="bi bi-arrow-up-short text-emerald-500" />
          <span>
            {{
              t('dashboard.remaining', {
                amount: formatMoney(goal.targetAmount - goal.currentAmount, goal.currency),
              })
            }}
          </span>
        </div>
        <div v-else class="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-500">
          <i class="bi bi-check-circle-fill" />
          <span>{{ t('dashboard.goalAchieved') }}</span>
        </div>
      </div>
    </div>
  </DashboardCard>
</template>
