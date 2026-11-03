<script setup lang="ts">
import { computed } from 'vue';
import type { LifeNote, LifeNoteGroup } from '../../types';
import { useLifeI18n } from '../../i18n';
import { useLifeStore } from '../../stores/useLifeStore';

const props = defineProps<{ note: LifeNote; group?: LifeNoteGroup | null; index: number }>();
const emit = defineEmits<{ edit: [id: string]; pin: [id: string]; remove: [id: string] }>();
const { t, titleFor, locale } = useLifeI18n();
const store = useLifeStore();
const relatedGoal = computed(() => store.goals.find(goal => goal.id === (props.note.goalId || props.group?.goalId)));
const preview = computed(() => props.note.content.trim().slice(0, 300));
const updated = computed(() => {
  try { return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' }).format(new Date(props.note.updatedAt)); }
  catch { return ''; }
});
</script>

<template>
  <article class="lb-note-card" :class="['lb-note-card--' + (index % 4), { 'is-pinned': note.pinned }]" :style="{ '--note-group-color': group?.color ?? 'var(--life-primary-2)', '--note-order': Math.min(index, 8) }">
    <div class="lb-note-card-toolbar">
      <span v-if="group" class="lb-note-group-badge"><span />{{ group.name }}</span>
      <span v-else class="lb-note-group-badge"><i class="bi bi-grid" />{{ t('notesUngrouped') }}</span>
      <div class="lb-note-card-actions">
        <button type="button" :title="note.pinned ? t('notesUnpin') : t('notesPin')" :aria-label="note.pinned ? t('notesUnpin') : t('notesPin')" :aria-pressed="note.pinned" @click.stop="emit('pin', note.id)"><i :class="note.pinned ? 'bi bi-pin-fill' : 'bi bi-pin-angle'" /></button>
        <button type="button" :title="t('notesEdit')" :aria-label="t('notesEdit')" @click.stop="emit('edit', note.id)"><i class="bi bi-pencil-square" /></button>
      </div>
    </div>
    <button type="button" class="lb-note-card-content" @click="emit('edit', note.id)">
      <img v-if="note.imageDataUrl" class="lb-note-card-photo" :src="note.imageDataUrl" :alt="note.title" loading="lazy" />
      <span v-else class="lb-note-card-illustration" aria-hidden="true"><i :class="index % 4 === 0 ? 'bi bi-lightbulb' : index % 4 === 1 ? 'bi bi-bookmark-heart' : index % 4 === 2 ? 'bi bi-journal-text' : 'bi bi-compass'" /></span>
      <strong>{{ note.title }}</strong>
      <span v-if="preview" class="lb-note-card-preview">{{ preview }}</span>
      <span v-else class="lb-note-card-preview is-placeholder">{{ t('notesEmptyContent') }}</span>
    </button>
    <footer class="lb-note-card-footer">
      <span v-if="relatedGoal" class="lb-note-linked-goal" :title="titleFor(relatedGoal)"><i class="bi bi-bullseye" />{{ titleFor(relatedGoal) }}</span>
      <span v-else class="lb-note-card-date"><i class="bi bi-clock-history" />{{ updated }}</span>
      <button type="button" class="lb-note-delete" :title="t('notesDelete')" :aria-label="t('notesDelete')" @click="emit('remove', note.id)"><i class="bi bi-trash3" /></button>
    </footer>
  </article>
</template>
