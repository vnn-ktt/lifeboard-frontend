<script setup lang="ts">
import { ref } from 'vue';
import AppOverlayDialog from '@/shared/components/Overlay/AppOverlayDialog.vue';
import InDevelop from '@/shared/components/InDevelop.vue';
import { useLifeI18n } from '../i18n';
const visible = ref(false);
const { t } = useLifeI18n();
</script>

<template>
  <button type="button" class="lb-ai-launch" :title="t('aiConsult')" :aria-label="t('aiConsult')" @click="visible = true">
    <span class="lb-ai-launch-spark"><i class="bi bi-stars" aria-hidden="true" /></span>
    <span class="lb-ai-launch-label">{{ t('aiConsult') }}</span>
  </button>
  <AppOverlayDialog :open="visible" :title="t('aiConsult')" labelled-by="lb-ai-consult-title" @close="visible = false">
    <div class="lb-ai-dialog-body">
      <div class="lb-ai-intro"><span class="lb-ai-orb"><i class="bi bi-stars" /></span><div><strong>{{ t('aiComing') }}</strong><p>{{ t('aiDescription') }}</p></div></div>
      <InDevelop compact />
    </div>
  </AppOverlayDialog>
</template>
