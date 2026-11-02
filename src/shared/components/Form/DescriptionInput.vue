<script setup lang="ts">
import Textarea from 'primevue/textarea';

defineProps<{
  label: string;
  modelValue: string;
  placeholder: string;
}>();

const emit = defineEmits<{
  (event: 'update:model-value', value: string): void;
}>();
</script>

<template>
  <section>
    <label class="mb-2 block text-sm font-bold text-text">{{ label }}</label>
    <Textarea
      :model-value="modelValue"
      :placeholder="placeholder"
      :auto-resize="true"
      rows="2"
      fluid
      class="w-full"
      input-class="w-full rounded-lg border border-border bg-bg px-4 py-2.5 text-text placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary resize-none"
      @update:model-value="emit('update:model-value', $event)"
    />
  </section>
</template>
