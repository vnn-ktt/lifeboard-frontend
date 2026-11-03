<script setup lang="ts">
import { computed } from 'vue';
import Select from 'primevue/select';
import { useLifeStore } from '../stores/useLifeStore';
import { useLifeI18n } from '../i18n';
import type { QuotePlacement } from '../types';

const store = useLifeStore();
const { lang } = useLifeI18n();
const copy = {
  ru: { overline: 'КОЛЛЕКЦИЯ МЫСЛЕЙ', title: 'Архив цитат', subtitle: 'Проверяемые высказывания и их источники. Выбери цитату для главной или рефлексии.', assign: 'Размещение', overview: 'Главная', review: 'Рефлексия', source: 'Источник', note: 'Тексты представлены в адаптированном переводе — оригинальная формулировка может отличаться.', hide: 'Не показывать' },
  en: { overline: 'THOUGHT COLLECTION', title: 'Quote archive', subtitle: 'Sourced passages and their authors. Choose a quote for Overview or Reflection.', assign: 'Placement', overview: 'Overview', review: 'Reflection', source: 'Source', note: 'These are adapted translations; original wording may differ.', hide: 'Do not show' },
  de: { overline: 'GEDANKENSAMMLUNG', title: 'Zitatarchiv', subtitle: 'Belegte Aussagen mit Quellen. Wähle ein Zitat für Übersicht oder Reflexion.', assign: 'Platzierung', overview: 'Übersicht', review: 'Reflexion', source: 'Quelle', note: 'Dies sind sinngemäße Übersetzungen; der Originalwortlaut kann abweichen.', hide: 'Nicht anzeigen' },
} as const;
const t = computed(() => copy[lang.value]);
const placements = computed<{ value: QuotePlacement; label: string }[]>(() => [
  { value: 'dashboard', label: t.value.overview }, { value: 'review', label: t.value.review },
]);
const options = computed(() => store.quotes.map((quote) => ({
  label: `${quote.author[lang.value]} · ${quote.text[lang.value]}`,
  shortLabel: `${quote.author[lang.value]} · ${quote.text[lang.value].slice(0, 44)}…`,
  author: quote.author[lang.value],
  excerpt: quote.text[lang.value],
  value: quote.id,
})));
</script>

<template>
  <div class="lb-screen lb-quotes-screen">
    <header class="lb-page-top">
      <div><p class="lb-overline">{{ t.overline }}</p><h1>{{ t.title }}</h1><p class="lb-muted">{{ t.subtitle }}</p></div>
    </header>
    <section class="lb-panel lb-quotes-placements">
      <div class="lb-panel-heading"><h3>{{ t.assign }}</h3></div>
      <div class="lb-quotes-placement-grid">
        <label v-for="placement in placements" :key="placement.value" class="lb-quotes-placement-item">
          <span>{{ placement.label }}</span>
          <Select class="lb-quotes-select" :model-value="store.quoteAssignments[placement.value] ?? null" :options="options"
            option-label="label" option-value="value" filter show-clear :placeholder="t.hide"
            append-to="body" :overlay-style="{ width: 'min(440px, calc(100vw - 24px))' }"
            :pt="{ overlay: { class: 'lb-quotes-select-overlay' } }"
            @update:model-value="store.assignQuote(placement.value, $event ?? null)">
            <template #value="{ value, placeholder }"><span class="lb-quote-selected">{{ options.find(item => item.value === value)?.shortLabel ?? placeholder }}</span></template>
            <template #option="{ option }"><span class="lb-quote-option"><strong>{{ option.author }}</strong><small>{{ option.excerpt }}</small></span></template>
          </Select>
        </label>
      </div>
    </section>
    <section class="lb-quotes-grid" aria-label="Quotes">
      <article v-for="quote in store.quotes" :key="quote.id" class="lb-panel lb-quote-card lb-quote-card--curated">
        <blockquote>{{ quote.text[lang] }}</blockquote>
        <div class="lb-quote-card__author">{{ quote.author[lang] }}</div>
        <a :href="quote.sourceUrl" class="lb-quote-card__source" target="_blank" rel="noopener noreferrer">
          <i class="bi bi-book" aria-hidden="true" /> {{ t.source }}: {{ quote.sourceTitle[lang] }}, {{ quote.reference }}
          <i class="bi bi-box-arrow-up-right" aria-hidden="true" />
        </a>
      </article>
    </section>
    <p class="lb-quote-translation-note"><i class="bi bi-info-circle" aria-hidden="true" />{{ t.note }}</p>
  </div>
</template>
