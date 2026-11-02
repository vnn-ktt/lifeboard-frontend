<script lang="ts" setup>
import { computed } from 'vue';
import { useThemeStore, type Theme } from '@/shared/stores/useThemeStore';

const themeStore = useThemeStore();
const themeOptions = computed(() => [
  { value: 'forest' as Theme, label: 'Базовая', description: 'Зелёная спокойная тема Lifeboard', icon: 'bi bi-flower1' },
  { value: 'dark' as Theme, label: 'Тёмная', description: 'Для вечера и долгих рабочих сессий', icon: 'bi bi-moon-stars' },
  { value: 'orange' as Theme, label: 'Оранжевая', description: 'Мягкая тёплая тема без перегруза', icon: 'bi bi-sunrise' },
]);

function changeTheme(value: Theme) {
  themeStore.setTheme(value);
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <div class="text-sm font-medium text-text">Тема Lifeboard</div>
      <div class="grid gap-3 md:grid-cols-3">
        <button
          v-for="theme in themeOptions"
          :key="theme.value"
          type="button"
          class="rounded-2xl border border-border bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm"
          :class="themeStore.theme === theme.value ? 'ring-2 ring-primary/25 border-primary/35' : ''"
          @click="changeTheme(theme.value)"
        >
          <div class="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
            <i :class="theme.icon" />
            <span>{{ theme.label }}</span>
          </div>
          <p class="m-0 text-sm text-text-muted">{{ theme.description }}</p>
        </button>
      </div>
    </div>
  </div>
</template>
