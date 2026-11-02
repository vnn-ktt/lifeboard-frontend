<script setup lang="ts">
import Card from 'primevue/card';
import Button from 'primevue/button';

interface Props {
  title: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'ghost';
  isEditMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'bi bi-grid-3x3-gap',
  variant: 'default',
  isEditMode: false,
});

const emit = defineEmits<{
  hide: [];
}>();
</script>

<template>
  <div
    class="dashboard-card group h-full"
    :class="{
      'dashboard-card--editable': isEditMode,
    }"
  >
    <Card
      class="h-full border bg-surface/80 shadow-soft backdrop-blur-sm transition-all duration-300"
      :class="[
        isEditMode
          ? 'border-dashed border-primary/40 hover:border-primary/60'
          : 'border-border hover:shadow-md hover:border-primary/20',
        variant === 'primary' ? 'ring-1 ring-primary/10' : '',
        variant === 'ghost' ? 'bg-transparent border-dashed' : '',
      ]"
    >
      <!-- Edit mode toolbar -->
      <div v-if="isEditMode" class="edit-toolbar">
        <div class="flex items-center gap-1">
          <span class="drag-handle">
            <i class="bi bi-grip-vertical" />
          </span>
          <span class="text-xs font-medium text-text-muted select-none">{{ title }}</span>
        </div>
        <div class="flex items-center gap-0.5">
          <Button
            icon="bi bi-eye-slash"
            size="small"
            severity="secondary"
            text
            rounded
            class="edit-btn"
            @click="emit('hide')"
          />
        </div>
      </div>

      <!-- Normal header (hidden in edit mode) -->
      <template v-if="!isEditMode" #title>
        <div class="flex items-center justify-between gap-3 px-1">
          <div class="flex items-center gap-2.5">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors duration-200"
              :class="
                variant === 'primary'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-surface-muted text-text-muted group-hover:text-primary group-hover:bg-primary/10'
              "
            >
              <i :class="icon" />
            </span>
            <span class="text-sm font-semibold text-text">{{ title }}</span>
          </div>
          <slot name="header-actions" />
        </div>
      </template>

      <template #content>
        <div class="px-1" :class="{ 'pt-2': isEditMode }">
          <slot />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.dashboard-card {
  position: relative;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

/* Constrain the PrimeVue Card to the grid cell so its
   content never overflows outside the card bounds. */
.dashboard-card :deep(.p-card) {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.dashboard-card :deep(.p-card-body) {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

/* Keep the title row from shrinking/collapsing; only the content scrolls. */
.dashboard-card :deep(.p-card-caption) {
  flex-shrink: 0;
}

.dashboard-card :deep(.p-card-content) {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
.dashboard-card--editable {
  cursor: default;
}

/* ─── Edit Toolbar ──────────────────────────────────── */

.edit-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.5rem;
  background: var(--color-primary-muted);
  border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-radius: 0.75rem 0.75rem 0 0;
  cursor: default;
  flex-shrink: 0;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.375rem;
  color: var(--color-text-muted);
  cursor: grab;
  transition: all 0.15s;
}

.drag-handle:hover {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.drag-handle:active {
  cursor: grabbing;
}

.edit-btn {
  opacity: 0.6;
  transition: opacity 0.15s;
}

.edit-btn:hover {
  opacity: 1;
}
</style>
