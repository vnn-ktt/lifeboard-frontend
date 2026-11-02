<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
}>();
</script>

<template>
  <div class="rounded-lg border border-border bg-surface p-4">
    <div class="mb-4 flex items-center justify-between gap-3">
      <p class="m-0 text-sm font-bold uppercase tracking-[0.14em] text-text-muted">
        {{ title }}
      </p>
      <i class="bi text-primary" :class="icon" />
    </div>

    <slot />
  </div>
</template>
