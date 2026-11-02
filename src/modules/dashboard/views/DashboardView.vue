<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { GridLayout } from 'grid-layout-plus';
import { useDashboardData } from '@/modules/dashboard/composables/useDashboardData';
import { useDashboardLayout } from '@/modules/dashboard/composables/useDashboardLayout';
import SummaryWidget from '@/modules/dashboard/components/SummaryWidget.vue';
import TransactionsWidget from '@/modules/dashboard/components/TransactionsWidget.vue';
import CategoriesWidget from '@/modules/dashboard/components/CategoriesWidget.vue';
import AccountsWidget from '@/modules/dashboard/components/AccountsWidget.vue';
import BudgetsWidget from '@/modules/dashboard/components/BudgetsWidget.vue';
import ChartsWidget from '@/modules/dashboard/components/ChartsWidget.vue';
import QuickActionsWidget from '@/modules/dashboard/components/QuickActionsWidget.vue';
import GoalsWidget from '@/modules/dashboard/components/GoalsWidget.vue';
import RecentActivityWidget from '@/modules/dashboard/components/RecentActivityWidget.vue';
import MobileDashboard from '@/modules/dashboard/components/MobileDashboard.vue';

const { t } = useI18n();

const {
  accounts,
  activities,
  balanceHistory,
  balanceSummary,
  budgets,
  categories,
  categoryExpenses,
  goals,
  monthlyTrend,
  transactions,
} = useDashboardData();

const {
  // State
  isEditMode,
  gridItems,

  // Layout events
  onLayoutUpdated,

  toggleVisibility,

  // Management
  resetLayout,
  availableWidgets,
} = useDashboardLayout();

/** Widget definitions for the v-for loop */
interface WidgetDef {
  component: any;
  id: string;
  props: Record<string, any>;
}

const widgets = computed<WidgetDef[]>(() => [
  {
    component: SummaryWidget,
    id: 'summary',
    props: { summary: balanceSummary.value },
  },
  { component: QuickActionsWidget, id: 'quick-actions', props: {} },
  {
    component: ChartsWidget,
    id: 'charts',
    props: {
      categoryExpenses: categoryExpenses.value,
      monthlyTrend: monthlyTrend.value,
      balanceHistory: balanceHistory.value,
    },
  },
  {
    component: BudgetsWidget,
    id: 'budgets',
    props: { budgets: budgets.value },
  },
  {
    component: GoalsWidget,
    id: 'goals',
    props: { goals: goals.value },
  },
  {
    component: RecentActivityWidget,
    id: 'activity',
    props: { activities: activities.value },
  },
  {
    component: TransactionsWidget,
    id: 'transactions',
    props: { transactions: transactions.value },
  },
  {
    component: CategoriesWidget,
    id: 'categories',
    props: { categories: categories.value },
  },
  {
    component: AccountsWidget,
    id: 'accounts',
    props: { accounts: accounts.value },
  },
]);
</script>

<template>
  <div class="min-h-full bg-bg text-text md:hidden">
    <MobileDashboard
      :summary="balanceSummary"
      :category-expenses="categoryExpenses"
      :monthly-trend="monthlyTrend"
      :balance-history="balanceHistory"
      :transactions="transactions"
    />
  </div>

  <div class="hidden min-h-full bg-bg text-text md:grid md:gap-6">
    <!-- Page Header -->
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-primary">
          {{ t('dashboard.title') }}
        </p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight text-text sm:text-3xl">
          {{ t('dashboard.welcome', { name: t('dashboard.demo.userName') }) }}
        </h1>
        <p class="mt-1 text-sm text-text-muted">
          {{ t('dashboard.subtitle', { month: t('common.months.long.june') }) }}
        </p>
      </div>

      <button
        v-if="!isEditMode"
        type="button"
        class="widget-toolbar__button widget-toolbar__button--primary"
        @click="isEditMode = true"
      >
        <i class="bi bi-pencil-square" aria-hidden="true" />
        {{ t('dashboard.edit') }}
      </button>
    </div>

    <div
      v-if="isEditMode"
      class="widget-toolbar"
      role="toolbar"
      :aria-label="t('dashboard.widgets')"
    >
      <span class="widget-toolbar__title">{{ t('dashboard.widgets') }}</span>
      <div class="widget-toolbar__list">
        <button
          v-for="aw in availableWidgets"
          :key="aw.id"
          type="button"
          class="widget-toolbar__button"
          :class="aw.isVisible ? 'widget-toolbar__button--selected' : ''"
          :aria-pressed="aw.isVisible"
          @click="toggleVisibility(aw.id)"
        >
          <i :class="aw.isVisible ? 'bi bi-eye' : 'bi bi-eye-slash'" aria-hidden="true" />
          {{ t(`dashboard.widgetNames.${aw.id}`) }}
        </button>
      </div>
      <div class="widget-toolbar__actions">
        <button type="button" class="widget-toolbar__button" @click="resetLayout">
          <i class="bi bi-arrow-counterclockwise" aria-hidden="true" />
          {{ t('dashboard.resetLayout') }}
        </button>
        <button
          type="button"
          class="widget-toolbar__button widget-toolbar__button--primary"
          @click="isEditMode = false"
        >
          <i class="bi bi-check-lg" aria-hidden="true" />
          {{ t('dashboard.done') }}
        </button>
      </div>
    </div>

    <!-- Dashboard Canvas -->
    <div>
      <GridLayout
        :layout="gridItems"
        :col-num="4"
        :row-height="120"
        :margin="[20, 20]"
        :is-draggable="isEditMode"
        :is-resizable="isEditMode"
        :is-bounded="true"
        :vertical-compact="true"
        :auto-size="true"
        :use-css-transforms="true"
        class="dashboard-grid"
        @layout-updated="onLayoutUpdated"
      >
        <template #item="{ item }">
          <div class="grid-item h-full" :class="{ 'grid-item--editing': isEditMode }">
            <template v-for="w in widgets" :key="w.id">
              <div v-if="w.id === item.i" class="h-full">
                <component :is="w.component" v-bind="w.props" />
              </div>
            </template>
          </div>
        </template>
      </GridLayout>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  position: relative;
}

/* Grid item wrapper */
.grid-item {
  position: relative;
  height: 100%;
}

.grid-item--editing {
  outline: 2px dashed color-mix(in srgb, var(--color-primary) 40%, transparent);
  outline-offset: 2px;
  border-radius: 0.75rem;
  transition: outline-color 0.2s;
}

.grid-item--editing:hover {
  outline-color: color-mix(in srgb, var(--color-primary) 60%, transparent);
}

.widget-toolbar {
  position: sticky;
  top: 4.5rem;
  z-index: 30;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  box-shadow: 0 4px 24px rgb(0 0 0 / 0.12);
}

.widget-toolbar__title {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.widget-toolbar__list,
.widget-toolbar__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.widget-toolbar__list {
  flex: 1;
}

.widget-toolbar__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.25rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.widget-toolbar__button:hover {
  background: var(--color-surface-muted);
  border-color: var(--color-primary);
}

.widget-toolbar__button--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-muted);
  color: var(--color-primary);
}

.widget-toolbar__button--primary,
.widget-toolbar__button--primary:hover {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-primary-text);
}
</style>
