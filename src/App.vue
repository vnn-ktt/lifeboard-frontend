<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTitle } from '@vueuse/core';
import AppLayout from '@/shared/components/Layout/AppLayout.vue';
import AuthShell from '@/shared/components/Auth/AuthShell.vue';
import LifeShell from '@/modules/lifeboard/components/LifeShell.vue';

const route = useRoute();
const layout = computed(() => route.meta.layout);
useTitle(computed(() => typeof route.meta.breadcrumb === 'string' ? `${route.meta.breadcrumb} — Lifeboard` : 'Lifeboard'));
</script>

<template>
  <LifeShell v-if="layout === 'life'"><RouterView /></LifeShell>
  <AuthShell v-else-if="layout === 'auth'"><RouterView /></AuthShell>
  <AppLayout v-else><RouterView /></AppLayout>
</template>
