<script setup lang="ts">
import { computed, ref } from 'vue';
import AppOverlayDialog from '@/shared/components/Overlay/AppOverlayDialog.vue';
import InDevelop from '@/shared/components/InDevelop.vue';
import { useLifeI18n } from '../i18n';
const visible = ref(false);
const { lang } = useLifeI18n();
const copy = computed(() => ({
  ru: { label: 'ИИ', title: 'AI', desc: 'Будущий помощник для анализа целей, ритма и взаимосвязей.' },
  en: { label: 'AI', title: 'AI', desc: 'A future assistant for exploring goals, rhythm and connections.' },
  de: { label: 'KI', title: 'KI', desc: 'Ein künftiger Assistent für Ziele, Rhythmus und Zusammenhänge.' },
}[lang.value]));
</script>

<template>
  <button type="button" class="lb-ai-launch" :title="copy.title" :aria-label="copy.title" @click="visible = true">
    <span class="lb-ai-launch-spark"><i class="bi bi-stars" aria-hidden="true" /></span>
    <span class="lb-ai-launch-label">{{ copy.label }}</span>
  </button>
  <AppOverlayDialog :open="visible" :title="copy.title" labelled-by="lb-ai-consult-title" @close="visible = false">
    <div class="lb-ai-dialog-body">
      <div class="lb-ai-intro"><span class="lb-ai-orb"><i class="bi bi-stars" /></span><div><strong>{{ copy.title }}</strong><p>{{ copy.desc }}</p></div></div>
      <InDevelop compact />
    </div>
  </AppOverlayDialog>
</template>
