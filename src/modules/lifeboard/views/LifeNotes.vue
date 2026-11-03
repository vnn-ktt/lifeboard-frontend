<script setup lang="ts">
import { computed, ref } from 'vue';
import Select from 'primevue/select';
import { useLifeI18n } from '../i18n';
import { useLifeStore } from '../stores/useLifeStore';
import NoteCard from '../components/notes/NoteCard.vue';
import NoteEditor from '../components/notes/NoteEditor.vue';
import NoteGroupEditor from '../components/notes/NoteGroupEditor.vue';
import type { LifeNote, LifeNoteGroup } from '../types';

type NotePayload = Pick<LifeNote, 'title' | 'content' | 'groupId' | 'goalId' | 'imageDataUrl' | 'pinned'>;
const store = useLifeStore();
const { t, titleFor } = useLifeI18n();
const query = ref('');
const selectedGroup = ref('all');
const selectedGoal = ref<string | null>(null);
const editorVisible = ref(false);
const groupEditorVisible = ref(false);
const editNote = ref<LifeNote | null>(null);
const editGroup = ref<LifeNoteGroup | null>(null);
const initialGroupId = ref<string | null>(null);
const error = ref('');
const status = ref('');

const groupById = (id: string | null) => store.noteGroups.find(group => group.id === id) ?? null;
const goalOptions = computed(() => store.goals.map(goal => ({ label: titleFor(goal), value: goal.id })));
const cards = computed(() => store.notes
  .filter(note => {
    if (selectedGroup.value !== 'all') {
      if (selectedGroup.value === 'ungrouped' && note.groupId !== null) return false;
      if (selectedGroup.value !== 'ungrouped' && note.groupId !== selectedGroup.value) return false;
    }
    const group = groupById(note.groupId);
    if (selectedGoal.value && (note.goalId ?? group?.goalId) !== selectedGoal.value) return false;
    const needle = query.value.trim().toLocaleLowerCase();
    return !needle || [note.title, note.content, group?.name ?? ''].some(text => text.toLocaleLowerCase().includes(needle));
  })
  .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt)));
const pinnedCount = computed(() => store.notes.filter(note => note.pinned).length);
function openNewNote(groupId: string | null = null) {
  editNote.value = null;
  initialGroupId.value = groupId;
  error.value = ''; status.value = '';
  editorVisible.value = true;
}
function openEditNote(id: string) {
  editNote.value = store.notes.find(note => note.id === id) ?? null;
  initialGroupId.value = null;
  error.value = ''; status.value = '';
  editorVisible.value = Boolean(editNote.value);
}
function saveNote(payload: NotePayload) {
  const success = editNote.value ? store.updateNote(editNote.value.id, payload) : Boolean(store.addNote(payload));
  if (!success) { error.value = t('notesSaveError'); return; }
  editorVisible.value = false;
  error.value = '';
  query.value = ''; selectedGoal.value = null; selectedGroup.value = 'all';
  status.value = t('notesSaved');
}
function pinNote(id: string) {
  const note = store.notes.find(item => item.id === id);
  if (note) store.updateNote(id, { title: note.title, content: note.content, groupId: note.groupId, goalId: note.goalId, imageDataUrl: note.imageDataUrl, pinned: !note.pinned });
}
function deleteNote(id: string) {
  if (!window.confirm(t('notesDeleteConfirm'))) return;
  store.deleteNote(id);
  status.value = t('notesDeleted');
}
function openNewGroup() { editGroup.value = null; error.value = ''; groupEditorVisible.value = true; }
function openGroup(id: string) { editGroup.value = store.noteGroups.find(group => group.id === id) ?? null; error.value = ''; groupEditorVisible.value = Boolean(editGroup.value); }
function saveGroup(input: { name: string; goalId: string | null; color: string }) {
  const success = editGroup.value ? store.updateNoteGroup(editGroup.value.id, input) : Boolean(store.addNoteGroup(input));
  if (!success) { error.value = t('notesGroupDuplicate'); return; }
  groupEditorVisible.value = false;
  status.value = t('notesGroupSaved');
  error.value = '';
}
function deleteGroup(id: string) {
  if (!window.confirm(t('notesDeleteGroupConfirm'))) return;
  store.deleteNoteGroup(id);
  if (selectedGroup.value === id) selectedGroup.value = 'all';
  groupEditorVisible.value = false;
  status.value = t('notesGroupDeleted');
}
</script>

<template>
  <div class="lb-screen lb-notes-screen">
    <header class="lb-page-top lb-notes-page-top">
      <div>
        <p class="lb-overline">{{ t('notesOverline') }}</p>
        <h1>{{ t('notesTitlePage') }} <span class="lb-notes-title-asterisk">✳</span></h1>
        <p class="lb-muted">{{ t('notesSubtitle') }}</p>
      </div>
      <button type="button" class="lb-button lb-button-primary" @click="openNewNote()"><i class="bi bi-plus-lg" />{{ t('notesNew') }}</button>
    </header>

    <div class="lb-notes-intro">
      <div class="lb-notes-intro-copy"><span class="lb-notes-eyebrow"><i class="bi bi-pin-angle" />{{ t('notesWorkspace') }}</span><h2>{{ t('notesIntroTitle') }}</h2><p>{{ t('notesIntroText') }}</p><div class="lb-notes-intro-stats"><span><strong>{{ store.notes.length }}</strong>{{ t('notesCardsCount') }}</span><span><strong>{{ store.noteGroups.length }}</strong>{{ t('notesGroupsCount') }}</span><span><strong>{{ pinnedCount }}</strong>{{ t('notesPinnedCount') }}</span></div></div>
      <div class="lb-notes-intro-visual" aria-hidden="true"><span class="lb-notes-sample lb-notes-sample--one"><i class="bi bi-lightbulb" /></span><span class="lb-notes-sample lb-notes-sample--two"><i class="bi bi-journal-bookmark" /></span><span class="lb-notes-sample lb-notes-sample--three"><i class="bi bi-heart" /></span></div>
    </div>

    <div class="lb-notes-layout">
      <aside class="lb-notes-groups" :aria-label="t('notesGroups')">
        <div class="lb-notes-groups-header"><div><span class="lb-overline">{{ t('notesOrganization') }}</span><h3>{{ t('notesGroups') }}</h3></div><button type="button" class="lb-notes-round-action" :aria-label="t('notesNewGroup')" :title="t('notesNewGroup')" @click="openNewGroup"><i class="bi bi-plus-lg" /></button></div>
        <nav class="lb-notes-group-list" :aria-label="t('notesGroups')">
          <button type="button" :class="['lb-notes-group-nav', { 'is-active': selectedGroup === 'all' }]" :aria-pressed="selectedGroup === 'all'" @click="selectedGroup = 'all'"><i class="bi bi-grid-3x3-gap" /><span>{{ t('notesAll') }}</span><small>{{ store.notes.length }}</small></button>
          <button type="button" :class="['lb-notes-group-nav', { 'is-active': selectedGroup === 'ungrouped' }]" :aria-pressed="selectedGroup === 'ungrouped'" @click="selectedGroup = 'ungrouped'"><i class="bi bi-collection" /><span>{{ t('notesUngrouped') }}</span><small>{{ store.notes.filter(n => !n.groupId).length }}</small></button>
          <div v-for="group in store.noteGroups" :key="group.id" class="lb-notes-group-row" :class="{ 'is-active': selectedGroup === group.id }">
            <button type="button" class="lb-notes-group-nav" :aria-pressed="selectedGroup === group.id" @click="selectedGroup = group.id"><span class="lb-notes-group-color" :style="{ background: group.color }" /><span>{{ group.name }}</span><small>{{ store.notes.filter(n => n.groupId === group.id).length }}</small></button>
            <button type="button" class="lb-notes-group-options" :aria-label="`${t('notesEditGroup')}: ${group.name}`" :title="t('notesEditGroup')" @click="openGroup(group.id)"><i class="bi bi-three-dots" /></button>
          </div>
        </nav>
        <div class="lb-notes-groups-tip"><i class="bi bi-diagram-3" /><p>{{ t('notesGroupTip') }}</p></div>
      </aside>

      <section class="lb-notes-board" :aria-label="t('notesBoard')">
        <div class="lb-notes-board-head">
          <div><span class="lb-overline">{{ t('notesYourSpace') }}</span><h2>{{ selectedGroup === 'all' ? t('notesBoard') : selectedGroup === 'ungrouped' ? t('notesUngrouped') : groupById(selectedGroup)?.name ?? t('notesBoard') }}</h2></div>
          <div class="lb-notes-board-tools"><button type="button" class="lb-note-new-group-btn" @click="openNewGroup"><i class="bi bi-folder-plus" />{{ t('notesNewGroup') }}</button><button type="button" class="lb-note-add-mini" @click="openNewNote(selectedGroup !== 'all' && selectedGroup !== 'ungrouped' ? selectedGroup : null)"><i class="bi bi-plus-lg" />{{ t('notesNew') }}</button></div>
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
