<script setup lang="ts">
import LifeboardMascot from './LifeboardMascot.vue'

withDefaults(defineProps<{
  compact?: boolean
  subtitle?: string
}>(), {
  compact: false,
  subtitle: 'ASSEMBLED LIFE',
})
</script>

<template>
  <div :class="['lb-logo', { 'is-compact': compact }]">
    <div class="lb-logo-mark-wrap">
      <span class="lb-logo-mark">
        <LifeboardMascot size="sm" />
      </span>
    </div>
    <span class="lb-logo-copy">
      <strong>Lifeboard</strong>
      <small v-if="subtitle">{{ subtitle }}</small>
    </span>
  </div>
</template>
