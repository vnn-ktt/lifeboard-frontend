<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTitle } from '@vueuse/core';
import AppLayout from '@/shared/components/Layout/AppLayout.vue';
import AuthShell from '@/shared/components/Auth/AuthShell.vue';
import { useLifeI18n } from '@/modules/lifeboard/i18n';
import LifeShell from '@/modules/lifeboard/components/LifeShell.vue';

const route = useRoute();
const { t } = useLifeI18n();
const breadcrumbs = computed<Record<string, ReturnType<typeof t>>>(() => ({'life-dashboard': t('overview'),'life-today': t('today'),'life-goals': t('goals'),'life-review': t('review'),'life-profile': t('account')}));
const layout = computed(() => route.meta.layout);
useTitle(computed(() => breadcrumbs.value[String(route.name)] ? `${breadcrumbs.value[String(route.name)]} — Lifeboard` : 'Lifeboard'));
</script>

<template>
  <LifeShell v-if="layout === 'life'"><RouterView /></LifeShell>
  <AuthShell v-else-if="layout === 'auth'"><RouterView /></AuthShell>
  <AppLayout v-else><RouterView /></AppLayout>
</template>
