<script setup lang="ts">
import Button from 'primevue/button';
const props = withDefaults(defineProps<{ title: string; description?: string; icon?: string; action?: string }>(), { icon: 'bi-inbox' });
const emit = defineEmits<{ action: [] }>();
</script>
<template>
  <section class="lb-showcase-empty" role="status">
    <i :class="['bi', props.icon]" aria-hidden="true" />
    <h3>{{ title }}</h3><p v-if="description">{{ description }}</p>
    <Button v-if="action" :label="action" icon="bi bi-plus-lg" @click="emit('action')" />
  </section>
</template>
