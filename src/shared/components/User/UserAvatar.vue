<script setup lang="ts">
import { computed } from 'vue';
const props = withDefaults(defineProps<{ name?: string; size?: 'sm' | 'lg' }>(), { name: '', size: 'sm' });
const initials = computed(() => props.name.trim().split(/\s+/).slice(0, 2).map((s) => s.charAt(0).toLocaleUpperCase('ru-RU')).join('') || 'Я');
</script>
<template><span class="lb-avatar" :class="{ 'lb-avatar--large': size === 'lg' }" aria-hidden="true">{{ initials }}</span></template>
