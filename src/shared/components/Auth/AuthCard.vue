<script setup lang="ts">
defineProps<{ title: string; description: string; error?: string }>();
</script>
<template>
  <section class="lb-auth-card">
    <div class="lb-auth-icon"><i class="bi bi-shield-lock" aria-hidden="true" /></div>
    <h2>{{ title }}</h2><p class="lb-auth-description">{{ description }}</p>
    <p v-if="error" class="lb-auth-error" role="alert">{{ error }}</p>
    <slot />
    <div class="lb-auth-switch"><slot name="footer" /></div>
  </section>
</template>
