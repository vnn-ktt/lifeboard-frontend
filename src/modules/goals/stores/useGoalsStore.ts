import { createId } from '@/shared/utils/createId';
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import type { FinancialGoal, GoalInput } from '@/modules/goals/types';

const storageKey = (userId: string) => `goals:${userId}`;

function readGoals(userId: string): FinancialGoal[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]');
    return Array.isArray(value) ? value.filter((goal) => goal.ownerId === userId) : [];
  } catch {
    return [];
  }
}

export const useGoalsStore = defineStore('goals', () => {
  const authStore = useAuthStore();
  const goals = ref<FinancialGoal[]>([]);

  watch(
    () => authStore.userId,
    (userId) => {
      goals.value = userId ? readGoals(userId) : [];
    },
    { immediate: true },
  );

  function save() {
    if (authStore.userId) {
      localStorage.setItem(storageKey(authStore.userId), JSON.stringify(goals.value));
    }
  }

  function createGoal(input: GoalInput) {
    if (!authStore.userId) return;
    const now = new Date().toISOString();
    goals.value.unshift({
      ...input,
      id: createId(),
      ownerId: authStore.userId,
      createdAt: now,
      updatedAt: now,
    });
    save();
  }

  function updateGoal(id: string, input: GoalInput) {
    const goal = goals.value.find((item) => item.id === id);
    if (!goal || goal.ownerId !== authStore.userId) return;
    Object.assign(goal, input, { updatedAt: new Date().toISOString() });
    save();
  }

  function deleteGoal(id: string) {
    goals.value = goals.value.filter((goal) => goal.id !== id);
    save();
  }

  return { goals, createGoal, updateGoal, deleteGoal };
});
