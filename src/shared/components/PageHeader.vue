<script setup lang="ts">
defineProps<{
  description: string;
  title: string;
}>();
</script>

<template>
  <header
    class="animate-appear-invisible-bottom flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
  >
    <div>
      <h1 class="m-0 text-4xl font-bold leading-tight text-text sm:text-5xl">
        {{ title }}
      </h1>
      <p class="mt-3 max-w-2xl text-lg leading-8 text-text-muted">
        {{ description }}
      </p>
    </div>
  </header>
</template>
