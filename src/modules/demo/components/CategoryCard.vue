<script setup lang="ts">
defineProps<{
  colorClass: string;
  label: string;
  value: string;
  widthClass: string;
}>();
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between gap-3 text-sm">
      <span class="font-semibold text-text">
        {{ label }}
      </span>
      <span class="font-bold text-text-muted">
        {{ value }}
      </span>
    </div>
    <div class="h-2 rounded-lg bg-surface-muted">
      <div class="h-2 rounded-lg" :class="[colorClass, widthClass]" />
    </div>
  </div>
</template>
