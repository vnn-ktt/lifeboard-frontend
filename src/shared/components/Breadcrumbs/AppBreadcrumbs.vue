<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { BreadcrumbItem } from '@/shared/types/breadcrumb';
import { useLifeI18n } from '@/modules/lifeboard/i18n';

const props = withDefaults(defineProps<{ items?: BreadcrumbItem[]; rootLabel?: string; rootTo?: string }>(), { rootLabel: 'Обзор', rootTo: '/' });
const route = useRoute();
const {t}=useLifeI18n();
const translatedLabels:Record<string, Parameters<typeof t>[0]> = {
  'life-dashboard':'overview','life-today':'today','life-goals':'goals','life-review':'review','life-notes':'notesTitlePage','life-profile':'account','life-quotes':'quoteArchive',
};
const crumbs = computed<BreadcrumbItem[]>(() => {
  if (props.items) return props.items;
  const nested = route.matched.filter((record) => typeof record.meta.breadcrumb === 'string')
     .map((record) => ({ label: translatedLabels[String(record.name)] ? t(translatedLabels[String(record.name)]) : String(record.meta.breadcrumb), to: record.path }));
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
