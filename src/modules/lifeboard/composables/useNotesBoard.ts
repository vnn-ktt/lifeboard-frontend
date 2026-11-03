import { computed, ref } from 'vue';
import { useLifeI18n } from '../i18n';
import { useLifeStore } from '../stores/useLifeStore';
import type { LifeNote, LifeNoteGroup } from '../types';

type NotePayload = Pick<LifeNote, 'title' | 'content' | 'groupId' | 'goalId' | 'imageDataUrl' | 'pinned'>;

export function useNotesBoard() {
const store = useLifeStore();
const { t, titleFor } = useLifeI18n();
const query = ref('');
const sortBy = ref<'recent' | 'oldest' | 'title'>('recent');
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
const groupOptions = computed(() => [
  { label:t('notesAll'), value:'all' },
  { label:t('notesUngrouped'), value:'ungrouped' },
  ...store.noteGroups.map(group => ({ label:group.name, value:group.id })),
]);
const sortOptions = computed(() => [
  { label:t('notesSortRecent'), value:'recent' },
  { label:t('notesSortOldest'), value:'oldest' },
  { label:t('notesSortName'), value:'title' },
]);
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
  .sort((a, b) => Number(b.pinned) - Number(a.pinned) || (
    sortBy.value === 'oldest' ? a.updatedAt.localeCompare(b.updatedAt)
      : sortBy.value === 'title' ? a.title.localeCompare(b.title)
        : b.updatedAt.localeCompare(a.updatedAt)
  )));
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

  return { store, t, query, sortBy, selectedGroup, selectedGoal, editorVisible, groupEditorVisible,
  editNote, editGroup, initialGroupId, error, status, groupById, goalOptions, groupOptions, sortOptions,
  cards, pinnedCount, openNewNote, openEditNote, saveNote, pinNote, deleteNote, openNewGroup, openGroup,
  saveGroup, deleteGroup };
}
