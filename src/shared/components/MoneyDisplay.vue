<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  amount: number;
  currency: string;
  kind?: 'expense' | 'income';
  showSign?: boolean;
}>();

const formatted = computed(() =>
  new Intl.NumberFormat('ru-RU', {
    currency: props.currency,
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(props.amount),
);

const displayValue = computed(() => {
  if (!props.showSign || !props.kind) {
    return formatted.value;
  }
  return props.kind === 'income' ? `+${formatted.value}` : `-${formatted.value}`;
});

const amountClass = computed(() => {
  if (!props.kind) return '';
  return props.kind === 'income' ? 'text-emerald-400' : 'text-rose-400';
});
</script>

<template>
  <span :class="amountClass">
    {{ displayValue }}
  </span>
</template>
