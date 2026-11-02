<script setup lang="ts">
import Card from 'primevue/card';

defineProps<{
  accentClass: string;
  animationDelay?: string;
  description: string;
  icon: string;
  title: string;
}>();
</script>

<template>
  <Card
    class="animate-appear-invisible-bottom min-h-20 border border-border shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    :style="{
      animationDelay,
    }"
    :pt="{
      body: {
        class: 'h-full p-6',
      },
      content: {
        class: 'flex h-full flex-col p-0',
      },
    }"
  >
    <template #content>
      <span
        class="flex h-11 w-11 items-center justify-center rounded-lg text-lg"
        :class="accentClass"
      >
        <i class="bi" :class="icon" />
      </span>
      <h3 class="mt-5 text-xl font-bold leading-7 text-text">
        {{ title }}
      </h3>
      <p class="mb-0 mt-4 grow leading-7 text-text-muted">
        {{ description }}
      </p>
    </template>
  </Card>
</template>
