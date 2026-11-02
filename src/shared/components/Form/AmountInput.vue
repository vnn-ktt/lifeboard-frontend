<script setup lang="ts">
import InputNumber from 'primevue/inputnumber';

defineProps<{
  currency: string;
  error?: string;
  label: string;
  modelValue: number | null;
  placeholder: string;
}>();

const emit = defineEmits<{
  (event: 'update:model-value', value: number | null): void;
}>();
</script>

<template>
  <section>
    <label class="mb-2 block text-sm font-bold text-text">{{ label }}</label>
    <div class="relative">
      <InputNumber
        :model-value="modelValue"
        :placeholder="placeholder"
        :min-fraction-digits="2"
        :max-fraction-digits="2"
        fluid
        class="w-full"
        input-class="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary"
        @update:model-value="emit('update:model-value', $event)"
      />
      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">
        {{ currency }}
      </span>
    </div>
    <p v-if="error" class="mt-1 text-xs text-danger">{{ error }}</p>
  </section>
</template>
