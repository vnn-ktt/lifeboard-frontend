<script setup lang="ts">
defineProps<{
  disabled?: boolean;
  label: string;
}>();

defineEmits<{
  (event: 'click'): void;
}>();
</script>

<template>
  <button
    type="submit"
    :disabled="disabled"
    class="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition duration-300 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
  >
    {{ label }}
  </button>
</template>
