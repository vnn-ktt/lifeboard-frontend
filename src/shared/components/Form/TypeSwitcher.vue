<script setup lang="ts">
import type { TransactionKind } from '@/shared/types';

defineProps<{
  expenseLabel: string;
  incomeLabel: string;
  modelValue: TransactionKind;
}>();

const emit = defineEmits<{
  (event: 'update:model-value', value: TransactionKind): void;
}>();
</script>

<template>
  <div class="flex overflow-hidden rounded-lg border border-border bg-bg">
    <button
      type="button"
      :class="[
        'flex-1 px-4 py-2 text-sm font-bold transition duration-300',
        modelValue === 'expense'
          ? 'bg-danger text-white'
          : 'bg-transparent text-text-muted hover:text-text',
      ]"
      @click="emit('update:model-value', 'expense')"
    >
      {{ expenseLabel }}
    </button>
    <button
      type="button"
      :class="[
        'flex-1 px-4 py-2 text-sm font-bold transition duration-300',
        modelValue === 'income'
          ? 'bg-primary text-white'
          : 'bg-transparent text-text-muted hover:text-text',
      ]"
      @click="emit('update:model-value', 'income')"
    >
      {{ incomeLabel }}
    </button>
  </div>
</template>
