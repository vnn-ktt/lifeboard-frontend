import { computed } from 'vue';

export function useMoneyFormat(amount: number, currency: string) {
  const formatted = computed(() =>
    new Intl.NumberFormat('ru-RU', {
      currency,
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(amount),
  );

  function withSign(kind: 'expense' | 'income') {
    return kind === 'income' ? `+${formatted.value}` : `-${formatted.value}`;
  }

  return {
    formatted,
    withSign,
  };
}
