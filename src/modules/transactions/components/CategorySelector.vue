<script setup lang="ts">
import { CategoryCard } from '@/shared/components/Category';
import type { CategoryTemplate } from '@/shared/types';

defineProps<{
  categories: CategoryTemplate[];
  label: string;
  modelValue: string | null;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <section>
    <p class="mb-3 text-sm font-bold text-text">
      {{ label }}
    </p>
    <div class="grid gap-3 sm:grid-cols-2">
      <CategoryCard
        v-for="category in categories"
        :key="category.id"
        :category="category"
        :selected="modelValue === category.id"
        :selectable="true"
        @select="emit('update:modelValue', $event)"
      />
    </div>
  </section>
</template>
