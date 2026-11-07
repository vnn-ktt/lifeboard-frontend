<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
</script>
<template>
  <button type="button" class="flex items-center gap-2 font-bold tracking-wide text-emerald-700" aria-label="Budgee — главная" @click="router.push('/dashboard')">
    <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white text-xl">B</span>
    <span class="hidden sm:inline">Budgee</span>
  </button>
</template>
