<script setup lang="ts">
import ProgressBar from 'primevue/progressbar';
const props = withDefaults(defineProps<{ label: string; value: string; percent?: number; icon?: string }>(), { icon: 'bi-graph-up' });
</script>
<template>
  <article class="lb-showcase-metric">
    <span class="lb-showcase-metric-icon"><i :class="['bi', props.icon]" /></span>
    <span class="lb-showcase-metric-copy"><small>{{ label }}</small><strong>{{ value }}</strong>
      <ProgressBar v-if="percent !== undefined" :value="Math.max(0, Math.min(100, percent))" :show-value="false" />
    </span>
  </article>
</template>
