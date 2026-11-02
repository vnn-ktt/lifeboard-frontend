<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  value: string;
}>();
</script>

<template>
  <div class="rounded-lg border border-border bg-surface p-4">
    <div class="flex items-center justify-between gap-3">
      <span class="text-sm font-semibold text-text-muted">
        {{ title }}
      </span>
      <i class="bi text-primary" :class="icon" />
    </div>
    <p class="mt-3 text-2xl font-bold text-text">
      {{ value }}
    </p>
  </div>
</template>
