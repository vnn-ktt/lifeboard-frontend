<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { useCategories } from '@/shared/composables/useCategories';
import { useFinanceStore } from '@/shared/stores/useFinanceStore';
import {
  CategoryCard,
  CategoryTable,
  CategoryChart,
  CategoryFormDialog,
} from '@/shared/components/Category';
import type { CategoryTemplate } from '@/shared/types';

const { t } = useI18n();
const toast = useToast();
const {
  addCategory,
  categories,
  deleteCategory: deleteStoreCategory,
  expenseCategories,
  updateCategory,
} = useCategories();
const financeStore = useFinanceStore();
const { transactions } = storeToRefs(financeStore);

const dialogVisible = ref(false);
const editingCategory = ref<CategoryTemplate | null>(null);

const transactionCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {};
  categories.value.forEach((category) => {
    counts[category.id] = transactions.value.filter(
      (transaction) => transaction.categoryId === category.id,
    ).length;
  });
  return counts;
});

const spendingAmounts = computed<Record<string, number>>(() => {
  const amounts: Record<string, number> = {};
  expenseCategories.value.forEach((category) => {
    amounts[category.id] = transactions.value
      .filter(
        (transaction) => transaction.kind === 'expense' && transaction.categoryId === category.id,
      )
      .reduce((total, transaction) => total + transaction.amount, 0);
  });
  return amounts;
});

const spendingCurrency = computed(
  () => transactions.value.find((transaction) => transaction.kind === 'expense')?.currency ?? 'RUB',
);

function openAddDialog() {
  editingCategory.value = null;
  dialogVisible.value = true;
}

function openEditDialog(category: CategoryTemplate) {
  editingCategory.value = category;
  dialogVisible.value = true;
}

function saveCategory(data: Partial<CategoryTemplate>) {
  if (editingCategory.value) {
    updateCategory(editingCategory.value.id, data);
    toast.add({
      severity: 'success',
      summary: t('common.status.updated'),
      detail: t('category.toast.updated', { name: data.name }),
      life: 3000,
    });
  } else {
    const newCat: CategoryTemplate = {
      id: `cat-${Date.now()}`,
      name: data.name || t('category.new'),
      color: data.color || '#6366f1',
      icon: data.icon || 'bi bi-tag',
      kind: data.kind || 'expense',
    };
    addCategory(newCat);
    toast.add({
      severity: 'success',
      summary: t('common.status.created'),
      detail: t('category.toast.created', { name: newCat.name }),
      life: 3000,
    });
  }
}

function deleteCategory(category: CategoryTemplate) {
  deleteStoreCategory(category.id);
  toast.add({
    severity: 'success',
    summary: t('common.status.deleted'),
    detail: t('category.toast.deleted', { name: category.name }),
    life: 3000,
  });
}
</script>

<template>
  <div class="min-h-full bg-bg text-text">
    <!-- Desktop Layout (lg+) -->
    <div class="hidden lg:grid lg:grid-cols-5 lg:gap-6">
      <section class="items-end justify-between gap-6 md:flex">
        <PageHeader
          :title="t('transactions.title')"
          :description="t('transactions.description')"
          icon="bi-arrow-left-right"
        />

        <Button
          :label="t('category.add')"
          icon="bi bi-plus-lg"
          class="shrink-0"
          @click="openAddDialog"
        />
      </section>
      <!-- Chart - takes 2 columns -->
      <div class="lg:col-span-2">
        <div class="rounded-xl border border-border bg-surface/80 p-6 shadow-soft backdrop-blur-sm">
          <CategoryChart
            :categories="expenseCategories"
            :amounts="spendingAmounts"
            :currency="spendingCurrency"
          />
        </div>
      </div>

      <!-- Table - takes 3 columns -->
      <div class="lg:col-span-3">
        <div class="rounded-xl border border-border bg-surface/80 p-6 shadow-soft backdrop-blur-sm">
          <CategoryTable
            :categories="categories"
            :transaction-counts="transactionCounts"
            @add="openAddDialog"
            @edit="openEditDialog"
            @delete="deleteCategory"
            @save="saveCategory"
          />
        </div>
      </div>
    </div>

    <!-- Mobile/Tablet Layout (< lg) -->
    <div class="flex flex-col gap-6 lg:hidden">
      <!-- Chart -->
      <div class="rounded-xl border border-border bg-surface/80 p-6 shadow-soft backdrop-blur-sm">
        <CategoryChart
          :categories="expenseCategories"
          :amounts="spendingAmounts"
          :currency="spendingCurrency"
        />
      </div>

      <!-- Cards grid -->
      <div class="grid gap-4 sm:grid-cols-2">
        <CategoryCard
          v-for="category in categories"
          :key="category.id"
          :category="category"
          :transaction-count="transactionCounts[category.id] || 0"
          @edit="openEditDialog"
          @delete="deleteCategory"
        />
      </div>
    </div>

    <!-- Form Dialog -->
    <CategoryFormDialog
      v-model:visible="dialogVisible"
      :category="editingCategory"
      @save="saveCategory"
    />
  </div>
</template>
