<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/shared/components/Layout/AppLayout.vue';
const route = useRoute();
const authPage = computed(() => route.meta.layout === 'auth');
</script>
<template><RouterView v-if="authPage" /><AppLayout v-else><RouterView /></AppLayout></template>
