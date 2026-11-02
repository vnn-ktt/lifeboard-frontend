import { reactive } from 'vue';
import type { TransactionForm, TransactionKind } from '@/modules/transactions/types';
import { useTransactionValidation } from '@/modules/transactions/composables/useTransactionValidation';

export function useTransactionForm() {
  const form = reactive<TransactionForm>({
    amount: null,
    categoryId: null,
    date: new Date(),
    description: '',
    type: 'expense',
  });

  const { canSave, isAmountValid } = useTransactionValidation(form);

  function updateType(type: TransactionKind) {
    form.type = type;
    // Reset category when switching type since categories are type-specific
    form.categoryId = null;
  }

  function updateAmount(amount: number | null) {
    form.amount = amount;
  }

  function updateCategory(categoryId: string | null) {
    form.categoryId = categoryId;
  }

  function updateDate(date: Date) {
    form.date = date;
  }

  function updateDescription(description: string) {
    form.description = description;
  }

  function resetForm() {
    form.amount = null;
    form.categoryId = null;
    form.date = new Date();
    form.description = '';
  }

  function saveTransaction() {
    if (!canSave.value) {
      return;
    }

    // TODO: Replace with actual API call
    const transaction = {
      amount: form.amount!,
      categoryId: form.categoryId,
      currency: 'RUB',
      description: form.description || null,
      kind: form.type,
      occurredAt: form.date.toISOString(),
    };

    console.log('Saving transaction:', transaction);
  }

  return {
    canSave,
    form,
    isAmountValid,
    resetForm,
    saveTransaction,
    updateAmount,
    updateCategory,
    updateDate,
    updateDescription,
    updateType,
  };
}
