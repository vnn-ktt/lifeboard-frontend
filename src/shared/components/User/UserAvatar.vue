<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { usePrivacyStore } from '@/shared/stores/usePrivacyStore';
const props = withDefaults(defineProps<{ name?: string; size?: 'sm' | 'lg' }>(), { name: '', size: 'sm' });
const auth = useAuthStore(); const privacy = usePrivacyStore();
const initials = computed(() => props.name.trim().split(/\s+/).slice(0, 2).map(s => s.charAt(0).toUpperCase()).join('') || '?');
const image = computed(() => privacy.showAvatar ? auth.profile?.avatar : undefined);
</script>
<template>
  <span class="lb-avatar" :class="{ 'lb-avatar--large': size === 'lg' }" aria-hidden="true">
    <img v-if="image" :src="image" alt="" class="lb-avatar-image" />
    <template v-else>{{ initials }}</template>
  </span>
</template>
