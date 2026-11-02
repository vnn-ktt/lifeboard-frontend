import type { OwnedEntity, TimestampedEntity } from '@/core/supabase/types';
import type { CategoryKind } from '@/shared/types';

export type TransactionKind = CategoryKind;

export interface TransactionForm {
  amount: number | null;
  categoryId: string | null;
  date: Date;
  description: string;
  type: TransactionKind;
}

export interface TransactionItem extends TransactionTemplate {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  accountName: string;
}

export interface TransactionGroup {
  id: string;
  label: string;
  subtitle: string;
  totalAmount: number;
  currency: string;
  transactions: readonly TransactionItem[];
}

export interface RecentTransactionPreview {
  amount: string;
  category: string;
  icon: string;
  id: string;
  name: string;
  toneClass: string;
}

export interface TransactionTemplate extends OwnedEntity, TimestampedEntity {
  amount: number;
  categoryId: string | null;
  currency: string;
  description: string | null;
  id: string;
  kind: TransactionKind;
  occurredAt: string;
}

export type CreateTransactionPayload = Omit<
  TransactionTemplate,
  'createdAt' | 'id' | 'ownerId' | 'updatedAt'
>;
export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;
