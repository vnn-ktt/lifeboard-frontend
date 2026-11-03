<script setup lang="ts">
import Select from 'primevue/select';
import NoteCard from '../components/notes/NoteCard.vue';
import NoteEditor from '../components/notes/NoteEditor.vue';
import NoteGroupEditor from '../components/notes/NoteGroupEditor.vue';
import { useNotesBoard } from '../composables/useNotesBoard';
import QuoteSpot from '../components/quotes/QuoteSpot.vue';
const { store, t, query, sortBy, selectedGroup, selectedGoal, editorVisible, groupEditorVisible,
  editNote, editGroup, initialGroupId, error, status, groupById, goalOptions, groupOptions, sortOptions,
  cards, openNewNote, openEditNote, saveNote, pinNote, deleteNote, openNewGroup, openGroup,
  saveGroup, deleteGroup } = useNotesBoard();
</script>

<template>
  <div class="lb-screen lb-notes-screen">
    <header class="lb-page-top lb-notes-page-top">
      <div>
        <p class="lb-overline">{{ t('notesOverline') }}</p>
        <h1>{{ t('notesTitlePage') }} <span class="lb-notes-title-asterisk">✳</span></h1>
        <p class="lb-muted">{{ t('notesSubtitle') }}</p>
      </div>
    </header>

    <QuoteSpot placement="notes" />

    <div class="lb-notes-layout">
      <section class="lb-notes-board" :aria-label="t('notesBoard')">
        <div class="lb-notes-board-head">
          <div><span class="lb-overline">{{ t('notesYourSpace') }}</span><h2>{{ selectedGroup === 'all' ? t('notesBoard') : selectedGroup === 'ungrouped' ? t('notesUngrouped') : groupById(selectedGroup)?.name ?? t('notesBoard') }}</h2></div>
          <div class="lb-notes-board-tools">
            <Select v-model="selectedGroup" :options="groupOptions" option-label="label" option-value="value" filter class="lb-notes-head-filter" :aria-label="t('notesGroups')" />
            <Select v-model="sortBy" :options="sortOptions" option-label="label" option-value="value" class="lb-notes-head-filter lb-notes-sort" :aria-label="t('notesSort')" />
            <button v-if="selectedGroup !== 'all' && selectedGroup !== 'ungrouped'" type="button" class="lb-notes-round-action" :title="t('notesEditGroup')" :aria-label="t('notesEditGroup')" @click="openGroup(selectedGroup)"><i class="bi bi-pencil" /></button>
            <button type="button" class="lb-note-new-group-btn" @click="openNewGroup"><i class="bi bi-folder-plus" />{{ t('notesNewGroup') }}</button><button type="button" class="lb-note-add-mini" @click="openNewNote(selectedGroup !== 'all' && selectedGroup !== 'ungrouped' ? selectedGroup : null)"><i class="bi bi-plus-lg" />{{ t('notesNew') }}</button></div>
        </div>
        <div class="lb-notes-filters">
          <label class="lb-notes-search"><i class="bi bi-search" /><input v-model="query" type="search" :placeholder="t('notesSearch')" :aria-label="t('notesSearch')" /></label>
          <Select v-model="selectedGoal" :options="goalOptions" option-label="label" option-value="value" filter show-clear :placeholder="t('notesAllGoals')" class="lb-note-goal-filter" />
        </div>
        <div v-if="cards.length" class="lb-notes-cards">
          <NoteCard v-for="(note, index) in cards" :key="note.id" :note="note" :group="groupById(note.groupId)" :index="index" @edit="openEditNote" @pin="pinNote" @remove="deleteNote" />
          <button type="button" class="lb-note-add-card" @click="openNewNote(selectedGroup !== 'all' && selectedGroup !== 'ungrouped' ? selectedGroup : null)"><i class="bi bi-plus-circle" /><span>{{ t('notesAnother') }}</span></button>
        </div>
        <div v-else class="lb-notes-empty"><div class="lb-notes-empty-icon"><i class="bi bi-sticky" /></div><strong>{{ store.notes.length ? t('notesNoResults') : t('notesEmptyTitle') }}</strong><p>{{ store.notes.length ? t('notesClearFilters') : t('notesEmptyDescription') }}</p><button v-if="!store.notes.length" type="button" class="lb-button lb-button-primary" @click="openNewNote()"><i class="bi bi-plus-lg" />{{ t('notesNew') }}</button><button v-else type="button" class="lb-button lb-button-outline" @click="query=''; selectedGroup='all'; selectedGoal=null">{{ t('notesResetFilters') }}</button></div>
        <div class="lb-notes-board-bottom"><i class="bi bi-shield-check" />{{ t('notesLocalOnly') }}</div>
      </section>
    </div>

    <p v-if="error" class="lb-note-error" role="alert">{{ error }}</p>
    <p v-if="status" class="lb-note-status" role="status">{{ status }}</p>

    <NoteEditor v-model:visible="editorVisible" :note="editNote" :initial-group-id="initialGroupId" :save-error="error" @save="saveNote" />
    <NoteGroupEditor v-model:visible="groupEditorVisible" :group="editGroup" :save-error="error" @save="saveGroup" @remove="deleteGroup" />
  </div>
</template>
