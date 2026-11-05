<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLifeStore } from '../stores/useLifeStore'
import { useLifeI18n } from '../i18n'
import { isQuotePlacement } from '../utils/quotes'
import type { QuotePlacement } from '../types'

const store = useLifeStore()
const { lang } = useLifeI18n()

const copy = {
  ru: {
    overline: 'КОЛЛЕКЦИЯ МЫСЛЕЙ',
    title: 'Архив цитат',
    subtitle: 'Перетяни цитату на нужный экран или выбери её нажатием.',
    assign: 'Размещение цитат',
    hint: 'Перетащи карточку в область ниже. На телефоне нажми «Выбрать», затем на нужное место.',
    overview: 'Главная',
    review: 'Рефлексия',
    source: 'Источник',
    note: 'Цитаты приведены в адаптированном переводе; оригинальные формулировки могут отличаться.',
    placeholder: 'Перетащи цитату сюда',
    emptyHint: 'Или выбери цитату ниже и нажми здесь',
    choose: 'Выбрать',
    selected: 'Выбрана',
    remove: 'Убрать цитату',
    picked: 'Цитата выбрана. Теперь укажи место для неё.',
    move: 'Назначить цитату',
    grab: 'Перетащи или выбери',
  },
  en: {
    overline: 'THOUGHT COLLECTION',
    title: 'Quote archive',
    subtitle: 'Drag a quote into a section, or choose one with a tap.',
    assign: 'Quote placements',
    hint: 'Drag a card to a destination. On mobile, tap “Select”, then tap the destination.',
    overview: 'Overview',
    review: 'Reflection',
    source: 'Source',
    note: 'These are adapted translations; original wording may differ.',
    placeholder: 'Drag & Drop Quote',
    emptyHint: 'Or select a quote below and tap here',
    choose: 'Select',
    selected: 'Selected',
    remove: 'Remove quote',
    picked: 'Quote selected. Now choose its destination.',
    move: 'Assign quote',
    grab: 'Drag or select',
  },
  de: {
    overline: 'GEDANKENSAMMLUNG',
    title: 'Zitatarchiv',
    subtitle: 'Ziehe ein Zitat in einen Bereich oder wähle es durch Antippen.',
    assign: 'Zitate platzieren',
    hint: 'Ziehe eine Karte zum Ziel. Auf dem Handy: „Auswählen“ und dann den Zielbereich antippen.',
    overview: 'Übersicht',
    review: 'Reflexion',
    source: 'Quelle',
    note: 'Dies sind sinngemäße Übersetzungen; der Originalwortlaut kann abweichen.',
    placeholder: 'Zitat hierher ziehen',
    emptyHint: 'Oder unten Zitat wählen und hier tippen',
    choose: 'Auswählen',
    selected: 'Ausgewählt',
    remove: 'Zitat entfernen',
    picked: 'Zitat gewählt. Wähle jetzt den Zielbereich.',
    move: 'Zitat zuweisen',
    grab: 'Ziehen oder wählen',
  },
} as const

const t = computed(() => copy[lang.value])
const placements = computed<{ value: QuotePlacement; label: string }[]>(() => [
  { value: 'dashboard', label: t.value.overview },
  { value: 'review', label: t.value.review },
])

const selectedQuoteId = ref<string | null>(null)
const nativeDragId = ref<string | null>(null)
const hoveredPlacement = ref<QuotePlacement | null>(null)

interface PointerDrag {
  quoteId: string
  pointerId: number
  startX: number
  startY: number
  x: number
  y: number
  moved: boolean
}
const pointerDrag = ref<PointerDrag | null>(null)
let suppressPickupFor: string | null = null

const selectedQuote = computed(() => store.quotes.find(quote => quote.id === selectedQuoteId.value))
const touchGhostStyle = computed(() => ({
  left: `${pointerDrag.value?.x ?? 0}px`,
  top: `${pointerDrag.value?.y ?? 0}px`,
}))

function assignedQuote(placement: QuotePlacement) {
  return store.quoteFor(placement)
}

function selectQuote(quoteId: string): void {
  if (suppressPickupFor === quoteId) {
    suppressPickupFor = null
    return
  }
  selectedQuoteId.value = quoteId
}

function assignTo(placement: QuotePlacement, quoteId: string | null): void {
  if (store.assignQuote(placement, quoteId)) {
    selectedQuoteId.value = null
    hoveredPlacement.value = null
  }
}

function choosePlacement(placement: QuotePlacement): void {
  if (selectedQuoteId.value) assignTo(placement, selectedQuoteId.value)
}

function dragStart(event: DragEvent, quoteId: string): void {
  if (!event.dataTransfer) return
  nativeDragId.value = quoteId
  selectedQuoteId.value = quoteId
  event.dataTransfer.setData('application/x-lifeboard-quote', quoteId)
  event.dataTransfer.setData('text/plain', quoteId)
  event.dataTransfer.effectAllowed = 'copy'
}

function dragOver(event: DragEvent, placement: QuotePlacement): void {
  if (!nativeDragId.value) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
  hoveredPlacement.value = placement
}

function dragLeave(event: DragEvent, placement: QuotePlacement): void {
  const element = event.currentTarget as HTMLElement
  if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return
  if (hoveredPlacement.value === placement) hoveredPlacement.value = null
}

function dropQuote(event: DragEvent, placement: QuotePlacement): void {
  event.preventDefault()
  const fromTransfer = event.dataTransfer?.getData('application/x-lifeboard-quote')
  const quoteId = fromTransfer || nativeDragId.value
  if (nativeDragId.value && quoteId === nativeDragId.value && store.quotes.some(quote => quote.id === quoteId)) {
    assignTo(placement, quoteId)
  }
  nativeDragId.value = null
  hoveredPlacement.value = null
}

function dragEnd(): void {
  nativeDragId.value = null
  hoveredPlacement.value = null
}

/** A dedicated grip enables touch/pen drag without blocking normal page scrolling. */
function pointerDown(event: PointerEvent, quoteId: string): void {
  if (event.pointerType === 'mouse') return
  selectedQuoteId.value = quoteId
  pointerDrag.value = {
    quoteId,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    x: event.clientX,
    y: event.clientY,
    moved: false,
  }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function getPointerPlacement(x: number, y: number): QuotePlacement | null {
  const point = document.elementFromPoint(x, y)
  const value = point?.closest<HTMLElement>('[data-quote-placement]')?.dataset.quotePlacement
  return value && isQuotePlacement(value) ? value : null
}

function pointerMove(event: PointerEvent): void {
  const state = pointerDrag.value
  if (!state || state.pointerId !== event.pointerId) return
  state.x = event.clientX
  state.y = event.clientY
  if (Math.hypot(state.x - state.startX, state.y - state.startY) > 8) state.moved = true
  hoveredPlacement.value = state.moved ? getPointerPlacement(state.x, state.y) : null
}

function pointerUp(event: PointerEvent): void {
  const state = pointerDrag.value
  if (!state || state.pointerId !== event.pointerId) return
  if (state.moved) {
    const placement = getPointerPlacement(event.clientX, event.clientY)
    if (placement) {
      assignTo(placement, state.quoteId)
      suppressPickupFor = state.quoteId
      // Pointer-capture may synthesize a click on the pickup button after drop.
      window.setTimeout(() => {
        if (suppressPickupFor === state.quoteId) suppressPickupFor = null
      }, 0)
    }
  }
  pointerDrag.value = null
  hoveredPlacement.value = null
}

function pointerCancel(): void {
  pointerDrag.value = null
  hoveredPlacement.value = null
}
</script>

<template>
  <div class="lb-screen lb-quotes-screen">
    <header class="lb-page-top">
      <div>
        <p class="lb-overline">{{ t.overline }}</p>
        <h1>{{ t.title }}</h1>
        <p class="lb-muted">{{ t.subtitle }}</p>
      </div>
    </header>

    <section class="lb-panel lb-quotes-placements" :aria-label="t.assign">
      <div class="lb-quotes-placement-heading">
        <div>
          <h2>{{ t.assign }}</h2>
          <p>{{ t.hint }}</p>
        </div>
        <p v-if="selectedQuote" class="lb-quote-selection-status" role="status">
          <i class="bi bi-check-circle" aria-hidden="true" /> {{ t.picked }}
        </p>
      </div>

      <div class="lb-quotes-placement-grid">
        <section
          v-for="placement in placements"
          :key="placement.value"
          class="lb-quote-drop"
          :class="{
            'is-over': hoveredPlacement === placement.value,
            'is-ready': Boolean(selectedQuoteId),
            'has-quote': Boolean(assignedQuote(placement.value)),
          }"
          :data-quote-placement="placement.value"
          @dragover="dragOver($event, placement.value)"
          @dragleave="dragLeave($event, placement.value)"
          @drop="dropQuote($event, placement.value)"
        >
          <header class="lb-quote-drop-head">
            <span class="lb-quote-drop-heading"><i :class="['bi', placement.value === 'dashboard' ? 'bi-house' : 'bi-journal-text']" aria-hidden="true" />{{ placement.label }}</span>
            <button
              v-if="assignedQuote(placement.value)"
              type="button"
              class="lb-quote-drop-clear"
              :title="t.remove"
              :aria-label="`${t.remove}: ${placement.label}`"
              @click="assignTo(placement.value, null)"
            ><i class="bi bi-x-lg" aria-hidden="true" /></button>
          </header>
          <button
            type="button"
            class="lb-quote-drop-target"
            :aria-label="`${t.move}: ${placement.label}`"
            @click="choosePlacement(placement.value)"
          >
            <template v-if="assignedQuote(placement.value)">
              <i class="bi bi-quote lb-quote-drop-quote-icon" aria-hidden="true" />
              <span class="lb-quote-drop-excerpt">{{ assignedQuote(placement.value)?.text[lang] }}</span>
              <small>{{ assignedQuote(placement.value)?.author[lang] }}</small>
            </template>
            <template v-else>
              <i class="bi bi-box-arrow-in-down lb-quote-drop-placeholder-icon" aria-hidden="true" />
              <strong>{{ t.placeholder }}</strong>
              <small>{{ t.emptyHint }}</small>
            </template>
          </button>
        </section>
      </div>
    </section>

    <section class="lb-quotes-grid" :aria-label="t.title">
      <article
        v-for="quote in store.quotes"
        :key="quote.id"
        class="lb-panel lb-quote-card lb-quote-card--curated"
        :class="{
          'is-selected': selectedQuoteId === quote.id,
          'is-dragging': nativeDragId === quote.id,
        }"
        draggable="true"
        @dragstart="dragStart($event, quote.id)"
        @dragend="dragEnd"
      >
        <div class="lb-quote-card-dragbar">
          <span><i class="bi bi-grip-vertical" aria-hidden="true" /> {{ t.grab }}</span>
          <button
            type="button"
            class="lb-quote-card-pick"
            :aria-pressed="selectedQuoteId === quote.id"
            @click="selectQuote(quote.id)"
            @pointerdown="pointerDown($event, quote.id)"
            @pointermove="pointerMove"
            @pointerup="pointerUp"
            @pointercancel="pointerCancel"
          >
            <i :class="['bi', selectedQuoteId === quote.id ? 'bi-check2' : 'bi-hand-index-thumb']" aria-hidden="true" />
          </button>
        </div>
        <blockquote>{{ quote.text[lang] }}</blockquote>
        <div class="lb-quote-card__author">{{ quote.author[lang] }}</div>
        <a :href="quote.sourceUrl" class="lb-quote-card__source" target="_blank" rel="noopener noreferrer">
          <i class="bi bi-book" aria-hidden="true" /> {{ t.source }}: {{ quote.sourceTitle[lang] }}, {{ quote.reference }}
          <i class="bi bi-box-arrow-up-right" aria-hidden="true" />
        </a>
      </article>
    </section>

    <p class="lb-quote-translation-note"><i class="bi bi-info-circle" aria-hidden="true" />{{ t.note }}</p>

    <div
      v-if="pointerDrag?.moved"
      class="lb-quote-touch-ghost"
      :style="touchGhostStyle"
      aria-hidden="true"
    ><i class="bi bi-quote" /> {{ selectedQuote?.text[lang]?.slice(0, 48) }}</div>
  </div>
</template>
