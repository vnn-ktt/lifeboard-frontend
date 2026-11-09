<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; description?: string }>();
</script>
<template>
  <header class="lb-showcase-page-head">
    <p v-if="eyebrow" class="lb-overline">{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <p v-if="description" class="lb-muted">{{ description }}</p>
    <slot />
  </header>
</template>
