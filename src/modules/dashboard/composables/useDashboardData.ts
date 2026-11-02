import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useCategories } from '@/shared/composables/useCategories';
import { useFinanceStore } from '@/shared/stores/useFinanceStore';
import { useGoalsStore } from '@/modules/goals/stores/useGoalsStore';
import type {
  BalanceSummaryTemplate,
  BudgetProgressItem,
  ChartDataPoint,
  DashboardAccount,
  DashboardActivity,
  DashboardCategory,
  DashboardTransaction,
  MonthlyTrendPoint,
} from '@/modules/dashboard/types';

export function useDashboardData() {
  const { t } = useI18n();
  const financeStore = useFinanceStore();
  const goalsStore = useGoalsStore();
  const { transactions: financeTransactions } = storeToRefs(financeStore);
  const { goals } = storeToRefs(goalsStore);
  const { categories: financeCategories, getCategoryById } = useCategories();

  const isLoading = ref(false);
  const errorMessage = ref('');

  const balanceSummary: BalanceSummaryTemplate = {
    totalBalance: { amount: 48250, currency: 'USD' },
    income: { amount: 8450, currency: 'USD' },
    expenses: { amount: 5230, currency: 'USD' },
    savingsRate: 38,
  };

  const transactions = ref<DashboardTransaction[]>([
    {
      id: 'tx-1',
      amount: 3200,
      categoryName: t('dashboard.demo.categories.salary'),
      categoryColor: '#10b981',
      currency: 'USD',
      description: t('dashboard.demo.transactions.monthlySalary'),
      kind: 'income',
      occurredAt: '2026-06-01T09:00:00.000Z',
      status: 'completed',
      accountName: t('dashboard.demo.accounts.main'),
    },
    {
      id: 'tx-2',
      amount: 156,
      categoryName: t('dashboard.demo.categories.groceries'),
      categoryColor: '#f59e0b',
      currency: 'USD',
      description: t('dashboard.demo.transactions.weeklyGroceries'),
      kind: 'expense',
      occurredAt: '2026-06-15T14:30:00.000Z',
      status: 'completed',
      accountName: t('dashboard.demo.accounts.main'),
    },
    {
      id: 'tx-3',
      amount: 45,
      categoryName: t('dashboard.demo.categories.transport'),
      categoryColor: '#3b82f6',
      currency: 'USD',
      description: t('dashboard.demo.transactions.uberRide'),
      kind: 'expense',
      occurredAt: '2026-06-14T19:15:00.000Z',
      status: 'completed',
      accountName: t('dashboard.demo.accounts.creditCard'),
    },
    {
      id: 'tx-4',
      amount: 89,
      categoryName: t('dashboard.demo.categories.dining'),
      categoryColor: '#ef4444',
      currency: 'USD',
      description: t('dashboard.demo.transactions.dinner'),
      kind: 'expense',
      occurredAt: '2026-06-13T20:00:00.000Z',
      status: 'completed',
      accountName: t('dashboard.demo.accounts.creditCard'),
    },
    {
      id: 'tx-5',
      amount: 120,
      categoryName: t('dashboard.demo.categories.utilities'),
      categoryColor: '#8b5cf6',
      currency: 'USD',
      description: t('dashboard.demo.transactions.internetBill'),
      kind: 'expense',
      occurredAt: '2026-06-12T10:00:00.000Z',
      status: 'completed',
      accountName: t('dashboard.demo.accounts.main'),
    },
    {
      id: 'tx-6',
      amount: 500,
      categoryName: t('dashboard.demo.categories.freelance'),
      categoryColor: '#10b981',
      currency: 'USD',
      description: t('dashboard.demo.transactions.designPayment'),
      kind: 'income',
      occurredAt: '2026-06-10T15:00:00.000Z',
      status: 'completed',
      accountName: t('dashboard.demo.accounts.savings'),
    },
    {
      id: 'tx-7',
      amount: 2000,
      categoryName: t('dashboard.demo.categories.salary'),
      categoryColor: '#10b981',
      currency: 'USD',
      description: t('dashboard.demo.transactions.bonusPayment'),
      kind: 'income',
      occurredAt: '2026-06-05T09:00:00.000Z',
      status: 'pending',
      accountName: t('dashboard.demo.accounts.main'),
    },
    {
      id: 'tx-8',
      amount: 34,
      categoryName: t('dashboard.demo.categories.entertainment'),
      categoryColor: '#ec4899',
      currency: 'USD',
      description: t('dashboard.demo.transactions.netflix'),
      kind: 'expense',
      occurredAt: '2026-06-03T08:00:00.000Z',
      status: 'completed',
      accountName: t('dashboard.demo.accounts.creditCard'),
    },
    {
      id: 'tx-9',
      amount: 2750,
      categoryName: t('dashboard.demo.categories.freelance'),
      categoryColor: '#10b981',
      currency: 'USD',
      description: t('dashboard.demo.transactions.webProject'),
      kind: 'income',
      occurredAt: '2026-05-28T14:00:00.000Z',
      status: 'completed',
      accountName: t('dashboard.demo.accounts.main'),
    },
    {
      id: 'tx-10',
      amount: 220,
      categoryName: t('dashboard.demo.categories.shopping'),
      categoryColor: '#f97316',
      currency: 'USD',
      description: t('dashboard.demo.transactions.amazonOrder'),
      kind: 'expense',
      occurredAt: '2026-05-25T11:30:00.000Z',
      status: 'completed',
      accountName: t('dashboard.demo.accounts.creditCard'),
    },
    {
      id: 'tx-11',
      amount: 65,
      categoryName: t('dashboard.demo.categories.health'),
      categoryColor: '#14b8a6',
      currency: 'USD',
      description: t('dashboard.demo.transactions.pharmacy'),
      kind: 'expense',
      occurredAt: '2026-05-22T16:45:00.000Z',
      status: 'completed',
      accountName: t('dashboard.demo.accounts.main'),
    },
    {
      id: 'tx-12',
      amount: 180,
      categoryName: t('dashboard.demo.categories.transport'),
      categoryColor: '#3b82f6',
      currency: 'USD',
      description: t('dashboard.demo.transactions.transitPass'),
      kind: 'expense',
      occurredAt: '2026-05-20T07:00:00.000Z',
      status: 'completed',
      accountName: t('dashboard.demo.accounts.main'),
    },
  ]);

  const categories = ref<DashboardCategory[]>([
    {
      id: 'cat-1',
      name: t('dashboard.demo.categories.salary'),
      color: '#10b981',
      icon: 'bi bi-cash-stack',
      kind: 'income',
      transactionCount: 12,
    },
    {
      id: 'cat-2',
      name: t('dashboard.demo.categories.freelance'),
      color: '#34d399',
      icon: 'bi bi-laptop',
      kind: 'income',
      transactionCount: 8,
    },
    {
      id: 'cat-3',
      name: t('dashboard.demo.categories.groceries'),
      color: '#f59e0b',
      icon: 'bi bi-cart',
      kind: 'expense',
      transactionCount: 24,
    },
    {
      id: 'cat-4',
      name: t('dashboard.demo.categories.transport'),
      color: '#3b82f6',
      icon: 'bi bi-car-front',
      kind: 'expense',
      transactionCount: 18,
    },
    {
      id: 'cat-5',
      name: t('dashboard.demo.categories.dining'),
      color: '#ef4444',
      icon: 'bi bi-cup-hot',
      kind: 'expense',
      transactionCount: 15,
    },
    {
      id: 'cat-6',
      name: t('dashboard.demo.categories.utilities'),
      color: '#8b5cf6',
      icon: 'bi bi-lightning',
      kind: 'expense',
      transactionCount: 6,
    },
    {
      id: 'cat-7',
      name: t('dashboard.demo.categories.entertainment'),
      color: '#ec4899',
      icon: 'bi bi-film',
      kind: 'expense',
      transactionCount: 9,
    },
    {
      id: 'cat-8',
      name: t('dashboard.demo.categories.shopping'),
      color: '#f97316',
      icon: 'bi bi-bag',
      kind: 'expense',
      transactionCount: 11,
    },
    {
      id: 'cat-9',
      name: t('dashboard.demo.categories.health'),
      color: '#14b8a6',
      icon: 'bi bi-heart-pulse',
      kind: 'expense',
      transactionCount: 4,
    },
  ]);

  const accounts = ref<DashboardAccount[]>([
    {
      id: 'acc-1',
      name: t('dashboard.demo.accounts.main'),
      type: 'debit',
      currency: 'USD',
      balance: 12450,
      transactionCount: 45,
    },
    {
      id: 'acc-2',
      name: t('dashboard.demo.accounts.creditCard'),
      type: 'credit',
      currency: 'USD',
      balance: -2340,
      transactionCount: 32,
    },
    {
      id: 'acc-3',
      name: t('dashboard.demo.accounts.savings'),
      type: 'savings',
      currency: 'USD',
      balance: 34200,
      transactionCount: 8,
    },
    {
      id: 'acc-4',
      name: t('dashboard.demo.accounts.cash'),
      type: 'cash',
      currency: 'USD',
      balance: 640,
      transactionCount: 12,
    },
    {
      id: 'acc-5',
      name: t('dashboard.demo.accounts.investment'),
      type: 'investment',
      currency: 'USD',
      balance: 15300,
      transactionCount: 3,
    },
  ]);

  const budgets = ref<BudgetProgressItem[]>([
    {
      id: 'budget-1',
      categoryName: t('dashboard.demo.categories.groceries'),
      colorClass: 'bg-amber-400',
      currency: 'USD',
      limit: 900,
      spent: 642,
    },
    {
      id: 'budget-2',
      categoryName: t('dashboard.demo.categories.transport'),
      colorClass: 'bg-sky-400',
      currency: 'USD',
      limit: 380,
      spent: 214,
    },
    {
      id: 'budget-3',
      categoryName: t('dashboard.demo.categories.dining'),
      colorClass: 'bg-red-400',
      currency: 'USD',
      limit: 520,
      spent: 471,
    },
    {
      id: 'budget-4',
      categoryName: t('dashboard.demo.categories.entertainment'),
      colorClass: 'bg-pink-400',
      currency: 'USD',
      limit: 200,
      spent: 89,
    },
    {
      id: 'budget-5',
      categoryName: t('dashboard.demo.categories.shopping'),
      colorClass: 'bg-orange-400',
      currency: 'USD',
      limit: 400,
      spent: 220,
    },
  ]);

  const activities = ref<DashboardActivity[]>([
    {
      id: 'act-1',
      action: 'created',
      entityType: 'transaction',
      description: t('dashboard.demo.activities.salaryIncome'),
      timestamp: '2026-06-15T09:00:00.000Z',
    },
    {
      id: 'act-2',
      action: 'updated',
      entityType: 'category',
      description: t('dashboard.demo.activities.renamedFood'),
      timestamp: '2026-06-14T14:30:00.000Z',
    },
    {
      id: 'act-3',
      action: 'created',
      entityType: 'account',
      description: t('dashboard.demo.activities.investmentAccount'),
      timestamp: '2026-06-13T11:00:00.000Z',
    },
    {
      id: 'act-4',
      action: 'deleted',
      entityType: 'transaction',
      description: t('dashboard.demo.activities.removedCoffee'),
      timestamp: '2026-06-12T16:45:00.000Z',
    },
    {
      id: 'act-5',
      action: 'imported',
      entityType: 'transaction',
      description: t('dashboard.demo.activities.importedCsv'),
      timestamp: '2026-06-11T10:00:00.000Z',
    },
    {
      id: 'act-6',
      action: 'created',
      entityType: 'budget',
      description: t('dashboard.demo.activities.shoppingBudget'),
      timestamp: '2026-06-10T08:30:00.000Z',
    },
    {
      id: 'act-7',
      action: 'updated',
      entityType: 'goal',
      description: t('dashboard.demo.activities.emergencyProgress'),
      timestamp: '2026-06-09T15:00:00.000Z',
    },
  ]);

  const categoryExpenses: ChartDataPoint[] = [
    { label: t('dashboard.demo.categories.groceries'), value: 642, color: '#f59e0b' },
    { label: t('dashboard.demo.categories.dining'), value: 471, color: '#ef4444' },
    { label: t('dashboard.demo.categories.shopping'), value: 220, color: '#f97316' },
    { label: t('dashboard.demo.categories.transport'), value: 214, color: '#3b82f6' },
    { label: t('dashboard.demo.categories.entertainment'), value: 89, color: '#ec4899' },
    { label: t('dashboard.demo.categories.utilities'), value: 120, color: '#8b5cf6' },
    { label: t('dashboard.demo.categories.health'), value: 65, color: '#14b8a6' },
  ];

  const monthlyTrend: MonthlyTrendPoint[] = [
    { label: t('common.months.short.jan'), income: 7200, expenses: 4100 },
    { label: t('common.months.short.feb'), income: 6800, expenses: 4500 },
    { label: t('common.months.short.mar'), income: 8100, expenses: 3900 },
    { label: t('common.months.short.apr'), income: 7800, expenses: 4800 },
    { label: t('common.months.short.may'), income: 8450, expenses: 5230 },
    { label: t('common.months.short.jun'), income: 5700, expenses: 3100 },
  ];

  const balanceHistory: ChartDataPoint[] = [
    { label: t('common.months.short.jan'), value: 38500, color: '#10b981' },
    { label: t('common.months.short.feb'), color: '#10b981', value: 40800 },
    { label: t('common.months.short.mar'), value: 45000, color: '#10b981' },
    { label: t('common.months.short.apr'), value: 43800, color: '#10b981' },
    { label: t('common.months.short.may'), value: 46200, color: '#10b981' },
    { label: t('common.months.short.jun'), value: 48250, color: '#10b981' },
  ];

  const dashboardTransactions = computed<DashboardTransaction[]>(() =>
    financeTransactions.value.map((transaction) => {
      const category = getCategoryById(transaction.categoryId);

      return {
        id: transaction.id,
        amount: transaction.amount,
        categoryName: category?.name ?? transaction.categoryName,
        categoryColor: category?.color ?? transaction.categoryColor,
        currency: transaction.currency,
        description:
          transaction.description ?? category?.name ?? t('transactions.details.noDescription'),
        kind: transaction.kind,
        occurredAt: transaction.occurredAt,
        status: 'completed',
        accountName: transaction.accountName,
      };
    }),
  );

  const dashboardCategories = computed<DashboardCategory[]>(() =>
    financeCategories.value.map((category) => ({
      ...category,
      transactionCount: financeTransactions.value.filter(
        (transaction) => transaction.categoryId === category.id,
      ).length,
    })),
  );

  const financeCategoryExpenses = computed<ChartDataPoint[]>(() =>
    dashboardCategories.value
      .filter((category) => category.kind === 'expense')
      .map((category) => ({
        label: category.name,
        value: financeTransactions.value
          .filter(
            (transaction) =>
              transaction.kind === 'expense' && transaction.categoryId === category.id,
          )
          .reduce((total, transaction) => total + transaction.amount, 0),
        color: category.color,
      }))
      .filter((point) => point.value > 0),
  );

  const financeMonthlyTrend = computed<MonthlyTrendPoint[]>(() => {
    const monthLabels = [
      t('common.months.short.jan'),
      t('common.months.short.feb'),
      t('common.months.short.mar'),
      t('common.months.short.apr'),
      t('common.months.short.may'),
      t('common.months.short.jun'),
    ];

    return monthLabels.map((label, monthIndex) => {
      const monthTransactions = financeTransactions.value.filter(
        (transaction) => new Date(transaction.occurredAt).getMonth() === monthIndex,
      );

      return {
        label,
        income: monthTransactions
          .filter((transaction) => transaction.kind === 'income')
          .reduce((total, transaction) => total + transaction.amount, 0),
        expenses: monthTransactions
          .filter((transaction) => transaction.kind === 'expense')
          .reduce((total, transaction) => total + transaction.amount, 0),
      };
    });
  });

  const financeBalanceSummary = computed<BalanceSummaryTemplate>(() => {
    const income = financeTransactions.value
      .filter((transaction) => transaction.kind === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0);
    const expenses = financeTransactions.value
      .filter((transaction) => transaction.kind === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0);

    return {
      totalBalance: { amount: income - expenses, currency: 'RUB' },
      income: { amount: income, currency: 'RUB' },
      expenses: { amount: expenses, currency: 'RUB' },
      savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
    };
  });

  const financeBalanceHistory = computed<ChartDataPoint[]>(() => {
    let balance = 0;

    return financeMonthlyTrend.value.map((point) => {
      balance += point.income - point.expenses;

      return {
        label: point.label,
        value: balance,
        color: '#10b981',
      };
    });
  });

  return {
    accounts,
    activities,
    balanceHistory: financeBalanceHistory,
    balanceSummary: financeBalanceSummary,
    budgets,
    categories: dashboardCategories,
    categoryExpenses: financeCategoryExpenses,
    errorMessage,
    goals,
    isLoading,
    monthlyTrend: financeMonthlyTrend,
    transactions: dashboardTransactions,
  };
}
