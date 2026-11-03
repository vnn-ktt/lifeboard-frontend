<script setup lang="ts">
import { useI18n } from 'vue-i18n';
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });

const { t } = useI18n();
</script>

<template>
  <div :class="compact ? 'min-h-[175px] py-5' : 'min-h-[60vh]'"
    class="flex flex-col items-center justify-center gap-4 px-4 text-center">
    <div
      class="animate-pop-bounce flex h-20 w-20 items-center justify-center rounded-full bg-primary-muted"
    >
      <i class="bi bi-tools text-3xl text-primary animate-float"></i>
    </div>
    <h2 class="animate-pop-bounce animate-stagger-2 text-xl font-bold text-text">
      {{ t('common.inDevelop.title') }}
    </h2>
    <p class="animate-pop-bounce animate-stagger-3 max-w-md text-text-muted">
      {{ t('common.inDevelop.description') }}
    </p>
  </div>
</template>
