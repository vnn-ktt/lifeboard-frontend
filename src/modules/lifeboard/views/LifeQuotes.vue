<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import { useLifeStore } from '../stores/useLifeStore'
import { useLifeI18n } from '../i18n'
import type { QuotePlacement } from '../types'

const store = useLifeStore()
const { lang } = useLifeI18n()

const copy = {
  ru: {
    overline: 'АРХИВ ЦИТАТ', title: 'Мотивация и смыслы', sub: 'Сохраняй цитаты и назначай их на экраны приложения.',
    add: 'Добавить цитату', edit: 'Изменить', save: 'Сохранить', cancel: 'Отмена', text: 'Текст', author: 'Автор', place: 'Разместить',
    custom: 'Своя', preset: 'Базовая', delete: 'Удалить', removeConfirm: 'Удалить цитату?', empty: 'Цитат пока нет',
    dashboard: 'Обзор', today: 'Сегодня', goals: 'Цели', review: 'Рефлексия', notes: 'Заметки', profile: 'Профиль', auth: 'Вход',
  },
  en: {
    overline: 'QUOTE ARCHIVE', title: 'Motivation and meaning', sub: 'Save quotes and assign them to app sections.',
    add: 'Add quote', edit: 'Edit', save: 'Save', cancel: 'Cancel', text: 'Text', author: 'Author', place: 'Place in',
    custom: 'Custom', preset: 'Preset', delete: 'Delete', removeConfirm: 'Delete this quote?', empty: 'No quotes yet',
    dashboard: 'Overview', today: 'Today', goals: 'Goals', review: 'Reflection', notes: 'Notes', profile: 'Profile', auth: 'Login',
  },
  de: {
    overline: 'ZITATARCHIV', title: 'Motivation und Sinn', sub: 'Speichere Zitate und ordne sie Bereichen der App zu.',
    add: 'Zitat hinzufügen', edit: 'Bearbeiten', save: 'Speichern', cancel: 'Abbrechen', text: 'Text', author: 'Autor', place: 'Anzeigen in',
    custom: 'Eigenes', preset: 'Vorbelegt', delete: 'Löschen', removeConfirm: 'Dieses Zitat löschen?', empty: 'Noch keine Zitate',
    dashboard: 'Übersicht', today: 'Heute', goals: 'Ziele', review: 'Reflexion', notes: 'Notizen', profile: 'Profil', auth: 'Login',
  },
} as const

const t = computed(() => copy[lang.value])
const formVisible = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({ ru: '', en: '', de: '', author: '' })

const placements = computed<{ label: string; value: QuotePlacement }[]>(() => [
  'dashboard', 'today', 'goals', 'review', 'notes', 'profile', 'auth',
].map((key) => ({ value: key as QuotePlacement, label: t.value[key as keyof typeof copy.ru] })))

function openCreate() {
  editingId.value = null
  Object.assign(form, { ru: '', en: '', de: '', author: '' })
  formVisible.value = true
}

function openEdit(id: string) {
  const quote = store.quotes.find((item) => item.id === id)
  if (!quote) return
  editingId.value = id
  Object.assign(form, { ...quote.text, author: quote.author })
  formVisible.value = true
}

function saveQuote() {
  const payload = { text: { ru: form.ru.trim(), en: form.en.trim(), de: form.de.trim() }, author: form.author.trim() }
  if (editingId.value) store.updateQuote(editingId.value, payload)
  else store.addQuote(payload)
  formVisible.value = false
}

function removeQuote(id: string) {
  if (confirm(t.value.removeConfirm)) store.deleteQuote(id)
}
</script>

<template>
  <div class="lb-screen lb-quotes-screen">
    <div class="lb-page-top">
      <div>
        <p class="lb-overline">{{ t.overline }}</p>
        <h1>{{ t.title }}</h1>
        <p class="lb-muted">{{ t.sub }}</p>
      </div>
      <button class="lb-button lb-button-primary" type="button" @click="openCreate"><i class="bi bi-plus-lg" /> {{ t.add }}</button>
    </div>

    <section class="lb-panel lb-quotes-placements">
      <div class="lb-panel-heading"><div><h3>{{ t.place }}</h3></div></div>
      <div class="lb-quotes-placement-grid">
        <label v-for="placement in placements" :key="placement.value" class="lb-quotes-placement-item">
          <span>{{ placement.label }}</span>
          <Select :model-value="store.quoteAssignments[placement.value] ?? null" :options="store.quotes.map(q => ({ label: q.text[lang] || q.text.ru, value: q.id }))" option-label="label" option-value="value" filter show-clear @update:model-value="store.assignQuote(placement.value, $event ?? null)" />
        </label>
      </div>
    </section>

    <section class="lb-panel">
      <div class="lb-panel-heading"><div><h3>{{ t.title }}</h3></div></div>
      <div v-if="store.quotes.length" class="lb-quotes-grid">
        <article v-for="quote in store.quotes" :key="quote.id" class="lb-quote-card">
          <span class="lb-soft-badge">{{ quote.createdBy === 'seed' ? t.preset : t.custom }}</span>
          <blockquote>{{ quote.text[lang] || quote.text.ru }}</blockquote>
          <footer>
            <strong>{{ quote.author }}</strong>
            <div class="lb-inline-actions">
              <button type="button" class="lb-button lb-button-outline" @click="openEdit(quote.id)"><i class="bi bi-pencil" />{{ t.edit }}</button>
              <button v-if="quote.createdBy !== 'seed'" type="button" class="lb-button lb-button-outline" @click="removeQuote(quote.id)"><i class="bi bi-trash3" />{{ t.delete }}</button>
            </div>
          </footer>
        </article>
      </div>
      <div v-else class="lb-empty">{{ t.empty }}</div>
    </section>

    <Dialog v-model:visible="formVisible" modal :dismissable-mask="true" :block-scroll="false" :header="editingId ? t.edit : t.add" :style="{ width: 'min(620px, calc(100vw - 16px))' }">
      <div class="lb-quotes-form">
        <label><span>RU</span><textarea v-model="form.ru" class="lb-input lb-textarea" rows="3" /></label>
        <label><span>EN</span><textarea v-model="form.en" class="lb-input lb-textarea" rows="3" /></label>
        <label><span>DE</span><textarea v-model="form.de" class="lb-input lb-textarea" rows="3" /></label>
        <label><span>{{ t.author }}</span><input v-model="form.author" class="lb-input" maxlength="100" /></label>
        <div class="lb-inline-actions">
          <button type="button" class="lb-button lb-button-outline" @click="formVisible = false">{{ t.cancel }}</button>
          <button type="button" class="lb-button lb-button-primary" @click="saveQuote">{{ t.save }}</button>
        </div>
      </div>
    </Dialog>
  </div>
</template>
