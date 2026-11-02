import { computed, type ComputedRef } from 'vue';
import type { TransactionForm } from '@/modules/transactions/types';

export function useTransactionValidation(form: TransactionForm): {
  canSave: ComputedRef<boolean>;
  isAmountValid: ComputedRef<boolean>;
} {
  const isAmountValid = computed(() => form.amount !== null && form.amount > 0);
  const canSave = computed(() => isAmountValid.value && form.categoryId !== null);

  return {
    canSave,
    isAmountValid,
  };
}
