<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { RouteName } from '@/shared/constants/route-name';
import LifeboardLogo from '@/shared/components/Brand/LifeboardLogo.vue';
const router = useRouter();
</script>

<template>
  <button class="lb-shared-brand-button" type="button" @click="router.push({ name: RouteName.HOME })">
    <LifeboardLogo compact />
  </button>
</template>
