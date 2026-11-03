<script setup lang="ts">
import LifeboardMascot from './LifeboardMascot.vue';
withDefaults(defineProps<{ compact?: boolean; subtitle?: string }>(), {
  compact: false,
  subtitle: 'ASSEMBLED LIFE',
});
</script>

<template>
  <div :class="['lb-logo', { 'is-compact': compact }]">
    <div class="lb-logo-mark-wrap">
      <div class="lb-logo-mark">
        <LifeboardMascot size="sm" />
      </div>
    </div>
    <div class="lb-logo-copy">
      <strong>Lifeboard</strong>
      <small>{{ subtitle }}</small>
    </div>
  </div>
</template>
