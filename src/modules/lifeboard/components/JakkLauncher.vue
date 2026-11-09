<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppOverlayDialog from '@/shared/components/Overlay/AppOverlayDialog.vue'
import InDevelop from '@/shared/components/Feedback/InDevelop.vue'
import LifeboardMascot from '@/shared/components/Brand/LifeboardMascot.vue'
import { useUiPreferencesStore } from '@/shared/stores/useUiPreferencesStore'
import { useLifeI18n } from '../i18n'

const visible = ref(false)
const prefs = useUiPreferencesStore()
const { lang } = useLifeI18n()
const launcherLabel = computed(() => ({
  ru: 'Открыть чат Helper',
  en: 'Open Helper chat',
  de: 'Helper-Chat öffnen',
}[lang.value]))
watch(() => prefs.showJakk, shown => { if (!shown) visible.value = false })
</script>

<template>
  <Teleport to="body">
    <button
      v-if="prefs.showJakk && !visible"
      type="button"
      class="lb-jakk-launcher"
      title="Helper"
      :aria-label="launcherLabel"
      aria-haspopup="dialog"
      :aria-expanded="visible"
      @click="visible = true"
    >
      <LifeboardMascot size="sm" /><span>Helper</span>
    </button>
  </Teleport>
  <AppOverlayDialog :open="visible && prefs.showJakk" title="Helper" labelled-by="lb-jakk-dialog-title" panel-class="lb-jakk-dialog" @close="visible = false">
    <InDevelop feature="Helper" />
  </AppOverlayDialog>
</template>
