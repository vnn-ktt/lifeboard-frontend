<script setup lang="ts">
import type { CategoryKind } from '@/shared/types';

defineProps<{
  color: string;
  icon: string;
  kind: CategoryKind;
  name: string;
}>();
</script>

<template>
  <span class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold">
    <span
      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      :style="{ backgroundColor: color + '20', color }"
    >
      <i :class="icon" class="text-xs" />
    </span>
    <span>{{ name }}</span>
  </span>
</template>
