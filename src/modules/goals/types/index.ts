import type { OwnedEntity, TimestampedEntity } from '@/core/supabase/types';

export interface FinancialGoal extends OwnedEntity, TimestampedEntity {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline: string;
}

export type GoalInput = Pick<
  FinancialGoal,
  'name' | 'targetAmount' | 'currentAmount' | 'currency' | 'deadline'
>;
