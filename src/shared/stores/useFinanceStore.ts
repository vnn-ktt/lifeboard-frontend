import { ref } from 'vue';
import { defineStore } from 'pinia';
import { MOCK_CATEGORIES } from '@/shared/api/mock/categories';
import type { CategoryTemplate } from '@/shared/types';
import type { TransactionItem } from '@/modules/transactions/types';

const now = '2026-05-09T10:00:00.000Z';

const initialTransactions: TransactionItem[] = [
  {
    id: 'tx-1',
    amount: 85000,
    currency: 'RUB',
    categoryId: 'salary',
    categoryName: '',
    categoryIcon: 'bi bi-briefcase',
    categoryColor: '#14b8a6',
    description: null,
    kind: 'income',
    occurredAt: '2026-05-09T10:00:00.000Z',
    accountName: 'Tinkoff',
    ownerId: '',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'tx-2',
    amount: 691,
    currency: 'RUB',
    categoryId: 'cafe',
    categoryName: '',
    categoryIcon: 'bi bi-cup-hot-fill',
    categoryColor: '#f97316',
    description: null,
    kind: 'expense',
    occurredAt: '2026-05-09T19:12:00.000Z',
    accountName: 'Tinkoff',
    ownerId: '',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'tx-3',
    amount: 90,
    currency: 'RUB',
    categoryId: 'groceries',
    categoryName: '',
    categoryIcon: 'bi bi-basket',
    categoryColor: '#10b981',
    description: null,
    kind: 'expense',
    occurredAt: '2026-05-08T18:22:00.000Z',
    accountName: 'Tinkoff',
    ownerId: '',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'tx-4',
    amount: 12000,
    currency: 'RUB',
    categoryId: 'freelance',
    categoryName: '',
    categoryIcon: 'bi bi-laptop',
    categoryColor: '#6366f1',
    description: null,
    kind: 'income',
    occurredAt: '2026-05-08T14:20:00.000Z',
    accountName: 'Tinkoff',
    ownerId: '',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'tx-5',
    amount: 667,
    currency: 'RUB',
    categoryId: 'health',
    categoryName: '',
    categoryIcon: 'bi bi-heart-pulse',
    categoryColor: '#f43f5e',
    description: null,
    kind: 'expense',
    occurredAt: '2026-05-08T12:05:00.000Z',
    accountName: 'Tinkoff',
    ownerId: '',
    createdAt: now,
    updatedAt: now,
  },
];

export const useFinanceStore = defineStore('finance', () => {
  const categories = ref<CategoryTemplate[]>(MOCK_CATEGORIES.map((category) => ({ ...category })));
  const transactions = ref<TransactionItem[]>(initialTransactions);

  function addTransaction(transaction: TransactionItem) {
    transactions.value.unshift(transaction);
  }

  function updateCategory(categoryId: string, data: Partial<CategoryTemplate>) {
    const index = categories.value.findIndex((category) => category.id === categoryId);

    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...data };
    }
  }

  function addCategory(category: CategoryTemplate) {
    categories.value.unshift(category);
  }

  function deleteCategory(categoryId: string) {
    categories.value = categories.value.filter((category) => category.id !== categoryId);
  }

  return {
    addCategory,
    addTransaction,
    categories,
    deleteCategory,
    transactions,
    updateCategory,
  };
});
