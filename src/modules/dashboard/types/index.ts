import type { OwnedEntity } from '@/core/supabase/types';
import type { MoneyAmount } from '@/shared/types';
import type { TransactionKind } from '@/shared/types';
import type { FinancialGoal } from '@/modules/goals/types';

export type DashboardLoadState = 'empty' | 'error' | 'loading' | 'ready';

export interface DashboardWidgetTemplate {
  id: string;
  isVisible: boolean;
  order: number;
  titleKey: string;
  gridColumn: string;
  gridRow: string;
}

export interface DashboardPreferenceTemplate extends OwnedEntity {
  defaultCurrency: string;
  widgets: DashboardWidgetTemplate[];
}

export interface BalanceSummaryTemplate {
  expenses: MoneyAmount;
  income: MoneyAmount;
  savingsRate: number;
  totalBalance: MoneyAmount;
}

export interface MonthlySpendingPoint {
  amount: number;
  budget: number;
  label: string;
}

export interface DashboardTransaction {
  amount: number;
  categoryName: string;
  categoryColor: string;
  currency: string;
  description: string;
  id: string;
  kind: TransactionKind;
  occurredAt: string;
  status: 'completed' | 'pending' | 'cancelled';
  accountName: string;
}

export interface BudgetProgressItem {
  categoryName: string;
  colorClass: string;
  currency: string;
  id: string;
  limit: number;
  spent: number;
}

export interface DashboardCategory {
  color: string;
  icon: string;
  id: string;
  kind: TransactionKind;
  name: string;
  transactionCount: number;
}

export interface DashboardAccount {
  balance: number;
  currency: string;
  id: string;
  name: string;
  transactionCount: number;
  type: 'cash' | 'credit' | 'debit' | 'savings' | 'investment';
}

export type DashboardGoal = FinancialGoal;

export interface DashboardActivity {
  action: 'created' | 'updated' | 'deleted' | 'imported';
  description: string;
  entityType: 'transaction' | 'category' | 'account' | 'budget' | 'goal';
  id: string;
  timestamp: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface MonthlyTrendPoint {
  expenses: number;
  income: number;
  label: string;
}
