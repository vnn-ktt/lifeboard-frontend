<script setup lang="ts">
import Message from 'primevue/message';
defineProps<{ message: string; icon?: string }>();
</script>

<template>
  <Message severity="secondary" variant="simple" class="lb-prime-empty" role="status">
    <i :class="['bi', icon || 'bi-inbox']" aria-hidden="true" />
    <span>{{ message }}</span>
  </Message>
</template>
