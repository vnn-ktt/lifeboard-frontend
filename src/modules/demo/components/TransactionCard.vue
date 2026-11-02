<script setup lang="ts">
defineProps<{
  amount: string;
  category: string;
  icon: string;
  name: string;
  toneClass: string;
}>();
</script>

<template>
  <div class="flex items-center justify-between gap-3 rounded-lg bg-bg p-3">
    <div class="flex min-w-0 items-center gap-3">
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        :class="toneClass"
      >
        <i class="bi" :class="icon" />
      </span>
      <div class="min-w-0">
        <p class="m-0 truncate text-sm font-bold text-text">
          {{ name }}
        </p>
        <p class="m-0 truncate text-xs font-semibold text-text-muted">
          {{ category }}
        </p>
      </div>
    </div>
    <span class="shrink-0 text-sm font-bold text-text">
      {{ amount }}
    </span>
  </div>
</template>
