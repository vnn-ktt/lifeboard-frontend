<script setup lang="ts">
import { ref } from 'vue'
import AppOverlayDialog from '@/shared/components/Overlay/AppOverlayDialog.vue'
import JakkChat from './jakk/JakkChat.vue'
import LifeboardMascot from '@/shared/components/Brand/LifeboardMascot.vue'

const visible = ref(false)
</script>

<template>
  <button type="button" class="lb-ai-launch lb-jakk-launch" title="Jakk" aria-label="Jakk" @click="visible = true">
    <span class="lb-ai-launch-spark"><i class="bi bi-chat-dots" aria-hidden="true" /></span>
    <span class="lb-ai-launch-label">Jakk</span>
  </button>
  <Teleport to="body">
    <button type="button" class="lb-jakk-mobile-launch" title="Jakk" aria-label="Jakk" @click="visible = true">
      <LifeboardMascot size="sm" /><span>Jakk</span>
    </button>
  </Teleport>
  <AppOverlayDialog :open="visible" title="Jakk" labelled-by="lb-jakk-dialog-title" panel-class="lb-jakk-dialog" @close="visible = false">
    <JakkChat :active="visible" />
  </AppOverlayDialog>
</template>
