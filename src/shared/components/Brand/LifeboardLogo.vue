<script setup lang="ts">
import { computed } from 'vue'
import { useLifeI18n } from '@/modules/lifeboard/i18n'
import LifeboardMascot from './LifeboardMascot.vue'

withDefaults(defineProps<{
  compact?: boolean
  subtitle?: string
}>(), {
  compact: false,
  subtitle: '',
})

const { lang } = useLifeI18n()
const assembledCopy = computed(() => ({
  ru: 'СОБРАННАЯ ЖИЗНЬ',
  en: 'ASSEMBLED LIFE',
  de: 'ZUSAMMENGEFÜGTES LEBEN',
}[lang.value]))
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
      <small>{{ subtitle || assembledCopy }}</small>
    </span>
  </div>
</template>
