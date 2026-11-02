<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTitle } from '@vueuse/core';
import AppLayout from '@/shared/components/Layout/AppLayout.vue';
import LifeShell from '@/modules/lifeboard/components/LifeShell.vue';

const route = useRoute();
const isLife = computed(() => route.meta.layout === 'life');
useTitle(computed(() => isLife.value ? 'Lifeboard — управляй своей жизнью' : 'Lifeboard'));
</script>

<template>
  <LifeShell v-if="isLife"><RouterView /></LifeShell>
  <AppLayout v-else><RouterView /></AppLayout>
</template>
