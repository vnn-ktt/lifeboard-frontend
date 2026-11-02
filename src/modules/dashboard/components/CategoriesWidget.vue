<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import DashboardCard from '@/modules/dashboard/components/DashboardCard.vue';
import { CategoryTable, CategoryFormDialog } from '@/shared/components/Category';
import type { CategoryTemplate } from '@/shared/types';
import type { DashboardCategory } from '@/modules/dashboard/types';

interface Props {
  categories: DashboardCategory[];
}

const props = defineProps<Props>();

const { t } = useI18n();
const toast = useToast();
const localCategories = ref<CategoryTemplate[]>(
  props.categories.map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    icon: c.icon,
    kind: c.kind,
  })),
);

const transactionCounts = ref<Record<string, number>>(
  Object.fromEntries(props.categories.map((c) => [c.id, c.transactionCount])),
);

const dialogVisible = ref(false);
const editingCategory = ref<CategoryTemplate | null>(null);

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
    // Edit existing
    const idx = localCategories.value.findIndex((c) => c.id === editingCategory.value!.id);
    if (idx !== -1) {
      localCategories.value[idx] = { ...localCategories.value[idx], ...data };
    }
    toast.add({
      severity: 'success',
      summary: t('common.status.updated'),
      detail: t('category.toast.updated', { name: data.name }),
      life: 3000,
    });
  } else {
    // Add new
    const newCat: CategoryTemplate = {
      id: `cat-${Date.now()}`,
      name: data.name || t('category.new'),
      color: data.color || '#6366f1',
      icon: data.icon || 'bi bi-tag',
      kind: data.kind || 'expense',
    };
    localCategories.value.unshift(newCat);
    toast.add({
      severity: 'success',
      summary: t('common.status.created'),
      detail: t('category.toast.created', { name: newCat.name }),
      life: 3000,
    });
  }
}

function deleteCategory(category: CategoryTemplate) {
  localCategories.value = localCategories.value.filter((c) => c.id !== category.id);
  toast.add({
    severity: 'success',
    summary: t('common.status.deleted'),
    detail: t('category.toast.deleted', { name: category.name }),
    life: 3000,
  });
}
</script>

<template>
  <DashboardCard :title="t('dashboard.categories')" icon="bi bi-tags">
    <CategoryTable
      :categories="localCategories"
      :transaction-counts="transactionCounts"
      @add="openAddDialog"
      @edit="openEditDialog"
      @delete="deleteCategory"
      @save="saveCategory"
    />
    <CategoryFormDialog
      v-model:visible="dialogVisible"
      :category="editingCategory"
      @save="saveCategory"
    />
  </DashboardCard>
</template>
