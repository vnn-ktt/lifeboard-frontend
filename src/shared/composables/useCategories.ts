import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import type { CategoryKind, CategoryTemplate } from '@/shared/types';
import { MOCK_CATEGORIES } from '@/shared/api/mock/categories';
import { useFinanceStore } from '@/shared/stores/useFinanceStore';

export function useCategories() {
  const { locale, t } = useI18n();
  const financeStore = useFinanceStore();
  const { categories } = storeToRefs(financeStore);

  const localizeCategory = (category: CategoryTemplate): CategoryTemplate => ({
    ...category,
    name: t(`category.mock.${category.id}`),
  });

  categories.value = categories.value.map((category) => {
    const isMockCategory = MOCK_CATEGORIES.some((mock) => mock.id === category.id);
    return isMockCategory ? localizeCategory(category) : category;
  });

  watch(locale, () => {
    categories.value = categories.value.map((category) => {
      const isMockCategory = MOCK_CATEGORIES.some((mock) => mock.id === category.id);
      return isMockCategory ? localizeCategory(category) : category;
    });
  });

  const expenseCategories = computed(() => categories.value.filter((c) => c.kind === 'expense'));

  const incomeCategories = computed(() => categories.value.filter((c) => c.kind === 'income'));

  function getCategoryById(id: string | null): CategoryTemplate | undefined {
    if (!id) return undefined;
    return categories.value.find((c) => c.id === id);
  }

  function getCategoriesByKind(kind: CategoryKind): CategoryTemplate[] {
    return categories.value.filter((c) => c.kind === kind);
  }

  return {
    addCategory: financeStore.addCategory,
    categories,
    deleteCategory: financeStore.deleteCategory,
    expenseCategories,
    getCategoriesByKind,
    getCategoryById,
    incomeCategories,
    updateCategory: financeStore.updateCategory,
  };
}
