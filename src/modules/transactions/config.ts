import type { RecentTransactionPreview } from '@/modules/transactions/types';
import { i18n } from '@/core/i18n';

const t = i18n.global.t;

export const recentTransactions = [
  {
    amount: '-$42.80',
    category: t('category.mock.groceries'),
    icon: 'bi-basket',
    id: 'recent-1',
    name: t('transactions.demo.recent.weeklyMarket'),
    toneClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  {
    amount: '-$12.40',
    category: t('category.mock.transport'),
    icon: 'bi-bus-front',
    id: 'recent-2',
    name: t('transactions.demo.recent.metroPass'),
    toneClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  },
  {
    amount: '+$2,100',
    category: t('common.kind.income'),
    icon: 'bi-briefcase',
    id: 'recent-3',
    name: t('category.mock.salary'),
    toneClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  },
  {
    amount: '-$18.00',
    category: t('category.mock.food'),
    icon: 'bi-cup-hot',
    id: 'recent-4',
    name: t('transactions.demo.recent.lunch'),
    toneClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
] as const satisfies readonly RecentTransactionPreview[];
