<script setup lang="ts">
defineProps<{
  balanceLabel: string;
  balanceValue: string;
  growth: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <p class="text-sm font-semibold text-text-muted">
        {{ balanceLabel }}
      </p>
      <p class="mt-2 text-4xl font-bold text-text">
        {{ balanceValue }}
      </p>
    </div>
    <span
      class="inline-flex w-fit items-center gap-2 rounded-lg bg-primary-muted px-3 py-2 text-sm font-bold text-primary"
    >
      <i class="bi bi-graph-up-arrow" />
      {{ growth }}
    </span>
  </div>
</template>
