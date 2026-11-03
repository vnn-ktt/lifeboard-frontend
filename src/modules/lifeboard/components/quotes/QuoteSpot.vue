<script setup lang="ts">
import { computed } from 'vue'
import { useLifeStore } from '../../stores/useLifeStore'
import { useLifeI18n } from '../../i18n'
import type { QuotePlacement } from '../../types'

const props = defineProps<{
  placement: QuotePlacement
  compact?: boolean
}>()

const store = useLifeStore()
const { lang } = useLifeI18n()

const labels = {
  ru: { eyebrow: 'ЦИТАТА ДЛЯ ФОКУСА', archive: 'Архив цитат' },
  en: { eyebrow: 'QUOTE FOR FOCUS', archive: 'Quote archive' },
  de: { eyebrow: 'ZITAT FÜR DEN FOKUS', archive: 'Zitatarchiv' },
} as const

const quote = computed(() => store.quoteFor(props.placement))
const text = computed(() => quote.value?.text[lang.value] ?? quote.value?.text.ru ?? '')
const eyebrow = computed(() => labels[lang.value].eyebrow)
const archiveLabel = computed(() => labels[lang.value].archive)
</script>

<template>
  <aside v-if="quote" :class="['lb-quote-spot', { 'is-compact': compact }]">
    <div class="lb-quote-spot__content">
      <span class="lb-overline">{{ eyebrow }}</span>
      <blockquote>{{ text }}</blockquote>
      <footer>
        <strong>{{ quote.author[lang] }}</strong>
        <RouterLink to="/quotes">{{ archiveLabel }}</RouterLink>
      </footer>
    </div>
  </aside>
</template>
