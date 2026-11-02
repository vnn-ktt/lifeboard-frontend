<script setup lang="ts">
defineProps<{
  label: string;
  error?: string;
}>();

defineSlots<{
  default(): void;
}>();
</script>

<template>
  <section>
    <label class="mb-2 block text-sm font-bold text-text">{{ label }}</label>
    <slot />
    <p v-if="error" class="mt-1 text-xs text-danger">{{ error }}</p>
  </section>
</template>
