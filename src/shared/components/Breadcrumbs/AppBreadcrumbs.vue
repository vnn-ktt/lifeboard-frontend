<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { BreadcrumbItem } from '@/shared/types/breadcrumb';

const props = withDefaults(defineProps<{ items?: BreadcrumbItem[]; rootLabel?: string; rootTo?: string }>(), { rootLabel: 'Обзор', rootTo: '/' });
const route = useRoute();
const crumbs = computed<BreadcrumbItem[]>(() => {
  if (props.items) return props.items;
  const nested = route.matched.filter((record) => typeof record.meta.breadcrumb === 'string')
    .map((record) => ({ label: String(record.meta.breadcrumb), to: record.path }));
  if (route.path === props.rootTo) return [{ label: props.rootLabel }];
  return [{ label: props.rootLabel, to: props.rootTo }, ...nested.map((item, index) => index === nested.length - 1 ? { label: item.label } : item)];
});
</script>

<template>
  <nav aria-label="Хлебные крошки" class="lb-breadcrumb">
    <template v-for="(item, index) in crumbs" :key="`${item.to ?? ''}:${item.label}:${index}`">
      <i v-if="index" class="bi bi-chevron-right" aria-hidden="true" />
      <RouterLink v-if="item.to && index !== crumbs.length - 1" :to="item.to">{{ item.label }}</RouterLink>
      <span v-else aria-current="page" class="lb-breadcrumb-current">{{ item.label }}</span>
    </template>
  </nav>
</template>
