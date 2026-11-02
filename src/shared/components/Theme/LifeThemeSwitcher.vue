<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore, type Theme } from '@/shared/stores/useThemeStore';

const themeStore = useThemeStore();
const items = computed(() => [
  { value: 'forest' as Theme, icon: 'bi bi-flower1', label: 'Базовая' },
  { value: 'dark' as Theme, icon: 'bi bi-moon-stars', label: 'Тёмная' },
  { value: 'orange' as Theme, icon: 'bi bi-sunrise', label: 'Оранжевая' },
]);
</script>

<template>
  <div class="lb-theme-switcher" role="group" aria-label="Переключение темы">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      :class="['lb-theme-chip', { 'is-active': themeStore.theme === item.value }]"
      :aria-pressed="themeStore.theme === item.value"
      :title="item.label"
      @click="themeStore.setTheme(item.value)"
    >
      <i :class="item.icon" aria-hidden="true" />
      <span>{{ item.label }}</span>
    </button>
  </div>
</template>
