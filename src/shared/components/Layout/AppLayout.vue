<script lang="ts" setup>
import { computed } from 'vue';
import AppFooter from '@/shared/components/Layout/AppFooter.vue';
import AppHeader from '@/shared/components/Layout/AppHeader.vue';
import { navigationItems } from '@/shared/components/Layout/config';
import { useAuthStore } from '@/shared/stores/useAuthStore';

const props = withDefaults(
  defineProps<{
    hideHeader?: boolean;
    hideFooter?: boolean;
  }>(),
  {
    hideHeader: false,
    hideFooter: false,
  },
);

const authStore = useAuthStore();

const appNavigation = computed(() => (authStore.isAuthenticated ? navigationItems : []));
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg text-text">
    <AppHeader v-if="!hideHeader" :navigation-items="appNavigation" />

    <main
      :class="[
        'mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8',
        hideFooter ? 'pb-6 lg:pb-8' : 'pb-24 md:pb-8 lg:pb-10',
      ]"
    >
      <slot />
    </main>

    <AppFooter v-if="!hideFooter" :navigation-items="appNavigation" />
  </div>
</template>
