import type {
  DemoCategoryPreviewItem,
  DemoFeatureItem,
  DemoPreviewStatItem,
  DemoTransactionPreview,
} from '@/modules/demo/types';

export const features = [
  {
    accentClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    icon: 'bi-arrow-left-right',
    key: 'tracking',
  },
  {
    accentClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    icon: 'bi-tags',
    key: 'categorization',
  },
  {
    accentClass: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    icon: 'bi-bar-chart-line',
    key: 'analytics',
  },
  {
    accentClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    icon: 'bi-wallet2',
    key: 'budget',
  },
] as const satisfies readonly DemoFeatureItem[];

export const previewStats = [
  {
    icon: 'bi-grid-1x2',
    key: 'categories',
    value: '12',
  },
  {
    icon: 'bi-piggy-bank',
    key: 'savedThisMonth',
    value: '14 120 ₽',
  },
  {
    icon: 'bi-speedometer2',
    key: 'budgetUsed',
    value: '68%',
  },
] as const satisfies readonly DemoPreviewStatItem[];

export const previewCategories = [
  {
    colorClass: 'bg-emerald-500',
    key: 'groceries',
    value: '10 211₽',
    widthClass: 'w-[74%]',
  },
  {
    colorClass: 'bg-sky-500',
    key: 'transport',
    value: '1261 ₽',
    widthClass: 'w-[46%]',
  },
  {
    colorClass: 'bg-amber-500',
    key: 'subscriptions',
    value: '1235 ₽',
    widthClass: 'w-[28%]',
  },
] as const satisfies readonly DemoCategoryPreviewItem[];

export const previewTransactions = [
  {
    icon: 'bi-cup-hot',
    key: 'coffee',
    toneClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  {
    icon: 'bi-briefcase',
    key: 'salary',
    toneClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
] as const satisfies readonly DemoTransactionPreview[];
