<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useGoalsStore } from '@/modules/goals/stores/useGoalsStore';
import type { FinancialGoal, GoalInput } from '@/modules/goals/types';

const { t, locale } = useI18n();
const goalsStore = useGoalsStore();
const { goals } = storeToRefs(goalsStore);
const editingId = ref<string | null>(null);
const formOpen = ref(false);
const error = ref('');
const form = reactive<GoalInput>({
  name: '',
  targetAmount: 0,
  currentAmount: 0,
  currency: 'USD',
  deadline: '',
});

const completedCount = computed(
  () => goals.value.filter((goal) => goal.currentAmount >= goal.targetAmount).length,
);
const activeCount = computed(() => goals.value.length - completedCount.value);

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function progress(goal: FinancialGoal) {
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

function openCreate() {
  editingId.value = null;
  Object.assign(form, {
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    currency: 'USD',
    deadline: '',
  });
  error.value = '';
  formOpen.value = true;
}

function openEdit(goal: FinancialGoal) {
  editingId.value = goal.id;
  Object.assign(form, {
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    currency: goal.currency,
    deadline: goal.deadline,
  });
  error.value = '';
  formOpen.value = true;
}

function saveGoal() {
  if (
    !form.name.trim() ||
    !Number.isFinite(form.targetAmount) ||
    form.targetAmount <= 0 ||
    !Number.isFinite(form.currentAmount) ||
    form.currentAmount < 0 ||
    !form.deadline
  ) {
    error.value = t('goals.validation');
    return;
  }
  const input = { ...form, name: form.name.trim() };
  if (editingId.value) goalsStore.updateGoal(editingId.value, input);
  else goalsStore.createGoal(input);
  formOpen.value = false;
}

function deleteGoal(goal: FinancialGoal) {
  if (window.confirm(t('goals.confirmDelete', { name: goal.name }))) {
    goalsStore.deleteGoal(goal.id);
  }
}
</script>

<template>
  <div class="w-full space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-primary">
          {{ t('goals.eyebrow') }}
        </p>
        <h1 class="mt-1 text-3xl font-bold text-text">{{ t('goals.title') }}</h1>
        <p class="mt-1 text-sm text-text-muted">{{ t('goals.description') }}</p>
      </div>
      <button class="goal-button goal-button--primary" type="button" @click="openCreate">
        <i class="bi bi-plus-lg" aria-hidden="true" /> {{ t('goals.add') }}
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="goal-panel">
        <p class="goal-stat-label">{{ t('goals.total') }}</p>
        <p class="goal-stat-value">{{ goals.length }}</p>
      </div>
      <div class="goal-panel">
        <p class="goal-stat-label">{{ t('goals.completed') }}</p>
        <p class="goal-stat-value">{{ completedCount }}</p>
      </div>
      <div class="goal-panel">
        <p class="goal-stat-label">{{ t('goals.active') }}</p>
        <p class="goal-stat-value">{{ activeCount }}</p>
      </div>
    </div>

    <form v-if="formOpen" class="goal-panel grid gap-4 md:grid-cols-2" @submit.prevent="saveGoal">
      <h2 class="md:col-span-2 text-lg font-semibold text-text">
        {{ editingId ? t('goals.edit') : t('goals.add') }}
      </h2>
      <label class="goal-field"
        >{{ t('goals.name') }}<input v-model="form.name" maxlength="80" required
      /></label>
      <label class="goal-field"
        >{{ t('goals.deadline') }}<input v-model="form.deadline" type="date" required
      /></label>
      <label class="goal-field"
        >{{ t('goals.target')
        }}<input v-model.number="form.targetAmount" type="number" min="0.01" step="0.01" required
      /></label>
      <label class="goal-field"
        >{{ t('goals.current')
        }}<input v-model.number="form.currentAmount" type="number" min="0" step="0.01" required
      /></label>
      <label class="goal-field"
        >{{ t('goals.currency') }}
        <select v-model="form.currency">
          <option>USD</option>
          <option>RUB</option>
          <option>EUR</option>
        </select>
      </label>
      <p v-if="error" class="md:col-span-2 text-sm text-red-600" role="alert">{{ error }}</p>
      <div class="flex gap-2 md:col-span-2">
        <button class="goal-button goal-button--primary" type="submit">
          {{ t('goals.save') }}
        </button>
        <button class="goal-button" type="button" @click="formOpen = false">
          {{ t('goals.cancel') }}
        </button>
      </div>
    </form>

    <div v-if="!goals.length" class="goal-panel py-14 text-center">
      <i class="bi bi-flag text-3xl text-primary" aria-hidden="true" />
      <h2 class="mt-3 text-lg font-semibold text-text">{{ t('goals.emptyTitle') }}</h2>
      <p class="mt-1 text-sm text-text-muted">{{ t('goals.emptyDescription') }}</p>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <article v-for="goal in goals" :key="goal.id" class="goal-panel">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-text">{{ goal.name }}</h2>
            <p class="mt-1 text-sm text-text-muted">
              {{ t('goals.due', { date: goal.deadline }) }}
            </p>
          </div>
          <span class="rounded-full bg-primary-muted px-3 py-1 text-sm font-bold text-primary"
            >{{ progress(goal) }}%</span
          >
        </div>
        <p class="mt-5 text-sm text-text-muted">
          <strong class="text-text">{{ formatMoney(goal.currentAmount, goal.currency) }}</strong>
          / {{ formatMoney(goal.targetAmount, goal.currency) }}
        </p>
        <div
          class="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"
          role="progressbar"
          :aria-valuenow="progress(goal)"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="goal.name"
        >
          <div class="h-full rounded-full bg-primary" :style="{ width: `${progress(goal)}%` }" />
        </div>
        <div class="mt-5 flex gap-2">
          <button class="goal-button" type="button" @click="openEdit(goal)">
            <i class="bi bi-pencil" aria-hidden="true" /> {{ t('goals.edit') }}
          </button>
          <button class="goal-button goal-button--danger" type="button" @click="deleteGoal(goal)">
            <i class="bi bi-trash" aria-hidden="true" /> {{ t('goals.delete') }}
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.goal-panel {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-surface);
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
}
.goal-stat-label {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
.goal-stat-value {
  margin-top: 0.5rem;
  color: var(--color-text);
  font-size: 1.75rem;
  font-weight: 700;
}
.goal-field {
  display: grid;
  gap: 0.5rem;
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 600;
}
.goal-field input,
.goal-field select {
  min-height: 2.5rem;
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  padding: 0.5rem 0.75rem;
}
.goal-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.25rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}
.goal-button:hover {
  background: var(--color-surface-muted);
}
.goal-button--primary,
.goal-button--primary:hover {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-primary-text);
}
.goal-button--danger {
  color: var(--color-danger);
}
</style>
