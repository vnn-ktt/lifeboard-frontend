<script lang="ts" setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import { RouteName } from '@/shared/constants/route-name';


const router = useRouter();
</script>

<template>
  <Button text type="button" @click="router.push({ name: RouteName.HOME })">
    <span class="text-xl" aria-hidden="true">◈</span>
    <span class="text-lg font-normal">
      Lifeboard
    </span>
  </Button>
</template>
