<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { CategoryTemplate } from '@/shared/types';

interface Props {
  category: CategoryTemplate;
  transactionCount?: number;
  selected?: boolean;
  selectable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  transactionCount: 0,
  selected: false,
  selectable: false,
});

const emit = defineEmits<{
  edit: [category: CategoryTemplate];
  delete: [category: CategoryTemplate];
  select: [categoryId: string];
}>();

const { t } = useI18n();

function getKindLabel(kind: string) {
  return kind === 'income' ? t('common.kind.income') : t('common.kind.expense');
}
</script>

<template>
  <div
    class="group relative rounded-xl border bg-surface/80 p-4 shadow-soft backdrop-blur-sm transition-all duration-200"
    :class="[
      selectable
        ? selected
          ? 'border-primary bg-primary/5 cursor-pointer ring-1 ring-primary/20'
          : 'border-border cursor-pointer hover:border-primary/30 hover:shadow-md'
        : 'border-border hover:border-primary/20 hover:shadow-md',
    ]"
    @click="selectable && emit('select', category.id)"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg text-white"
          :style="{ backgroundColor: category.color }"
        >
          <i :class="category.icon" />
        </span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-text truncate">
            {{ category.name }}
          </p>
          <p class="text-xs text-text-muted">
            {{ getKindLabel(category.kind) }}
          </p>
        </div>
      </div>

      <!-- Actions (visible on hover) -->
      <div
        v-if="!selectable"
        class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <button
          class="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted hover:text-primary transition-colors"
          @click="emit('edit', category)"
        >
          <i class="bi bi-pencil-square text-xs" />
        </button>
        <button
          class="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
          @click="emit('delete', category)"
        >
          <i class="bi bi-trash3 text-xs" />
        </button>
      </div>
    </div>

    <!-- Transaction count -->
    <div v-if="transactionCount > 0" class="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
      <i class="bi bi-receipt" />
      <span>{{ t('category.transactionCount', { count: transactionCount }) }}</span>
    </div>

    <!-- Color bar -->
    <div class="mt-3 h-1 w-full rounded-full" :style="{ backgroundColor: category.color + '30' }">
      <div
        class="h-full rounded-full transition-all duration-300"
        :style="{ backgroundColor: category.color, width: '100%' }"
      />
    </div>
  </div>
</template>
