<script setup lang="ts">
defineProps<{ title: string; description: string; error?: string }>();
</script>

<template>
  <section class="lb-auth-card">
    <div class="lb-auth-icon"><i class="bi bi-person-circle" aria-hidden="true" /></div>
    <h2>{{ title }}</h2><p class="lb-auth-description">{{ description }}</p>
    <div class="lb-auth-notice" role="note"><i class="bi bi-info-circle" aria-hidden="true" /><span>Это локальный профиль без пароля и серверной защиты. Не используй его для хранения секретов.</span></div>
    <p v-if="error" class="lb-auth-error" role="alert">{{ error }}</p>
    <slot />
    <div class="lb-auth-switch"><slot name="footer" /></div>
  </section>
</template>
