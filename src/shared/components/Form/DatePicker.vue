<script setup lang="ts">
import DatePickerPrime from 'primevue/datepicker';

defineProps<{
  label: string;
  modelValue: Date;
}>();

const emit = defineEmits<{
  (event: 'update:model-value', value: Date): void;
}>();

function onDateChange(value: unknown) {
  if (value instanceof Date) {
    emit('update:model-value', value);
  }
}
</script>

<template>
  <section>
    <label class="mb-2 block text-sm font-bold text-text">{{ label }}</label>
    <DatePickerPrime
      :model-value="modelValue"
      date-format="dd.mm.yy"
      fluid
      class="w-full"
      input-class="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary"
      panel-class="bg-surface border-border text-text"
      @update:model-value="onDateChange"
    />
  </section>
</template>
