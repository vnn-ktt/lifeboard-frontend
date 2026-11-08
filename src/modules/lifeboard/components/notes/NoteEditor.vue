<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import FileUpload from 'primevue/fileupload';
import { computed, reactive, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import { useLifeI18n } from '../../i18n';
import { useLifeStore } from '../../stores/useLifeStore';
import type { LifeNote } from '../../types';
import { compressNoteImage } from './useNoteImage';

const props = defineProps<{ visible: boolean; note: LifeNote | null; initialGroupId?: string | null; saveError?: string }>();
const emit = defineEmits<{ 'update:visible': [value: boolean]; save: [payload: Pick<LifeNote, 'title' | 'content' | 'groupId' | 'goalId' | 'imageDataUrl' | 'pinned'>] }>();
const store = useLifeStore();
const { t, titleFor } = useLifeI18n();
const draft = reactive({ title: '', content: '', groupId: null as string | null, goalId: null as string | null, imageDataUrl: null as string | null, pinned: false });
const error = ref('');
const working = ref(false);

const groupOptions = computed(() => store.noteGroups.map(group => ({ label: group.name, value: group.id })));
const goalOptions = computed(() => store.goals.map(goal => ({ label: titleFor(goal), value: goal.id })));

watch(() => [props.visible, props.note?.id, props.initialGroupId], () => {
  if (!props.visible) return;
  Object.assign(draft, {
    title: props.note?.title ?? '', content: props.note?.content ?? '',
    groupId: props.note?.groupId ?? props.initialGroupId ?? null,
    goalId: props.note?.goalId ?? null, imageDataUrl: props.note?.imageDataUrl ?? null,
    pinned: props.note?.pinned ?? false,
  });
  error.value = '';
}, { immediate: true });

function close() { if (!working.value) emit('update:visible', false); }
function submit() {
  if (working.value) return;
  if (!draft.title.trim() || draft.title.trim().length > 100) { error.value = t('notesErrorTitle'); return; }
  if (draft.content.length > 12000) { error.value = t('notesErrorContent'); return; }
  error.value = '';
  emit('save', { title: draft.title, content: draft.content, groupId: draft.groupId,
    goalId: draft.goalId, imageDataUrl: draft.imageDataUrl, pinned: draft.pinned });
}
async function chooseImage(event: { files: File[] }) {
  const file = event.files[0];
  if (!file) return;
  working.value = true;
  error.value = '';
  try { draft.imageDataUrl = await compressNoteImage(file); }
  catch { error.value = t('notesImageError'); }
  finally { working.value = false; }
}
</script>

<template>
  <Dialog :visible="visible" modal :header="note ? t('notesEdit') : t('notesNew')" :style="{ width: 'min(620px, calc(100vw - 16px))' }" class="lb-note-dialog" :block-scroll="false" @update:visible="emit('update:visible', $event)">
    <form class="lb-note-editor" @submit.prevent="submit">
      <label class="lb-note-field"><span>{{ t('notesTitle') }}<span class="lb-required-mark" aria-hidden="true">*</span></span><InputText v-model="draft.title" class="lb-input" maxlength="100" required :placeholder="t('notesTitlePlaceholder')" /></label>
      <label class="lb-note-field"><span>{{ t('notesContent') }}</span><Textarea v-model="draft.content" class="lb-input lb-textarea" rows="4" maxlength="12000" :placeholder="t('notesContentPlaceholder')" /></label>
      <div class="lb-note-editor-row">
        <label class="lb-note-field"><span>{{ t('notesGroup') }}</span>
          <Select v-model="draft.groupId" :options="groupOptions" option-label="label" option-value="value" filter show-clear :placeholder="t('notesUngrouped')" class="lb-note-select" />
        </label>
        <label class="lb-note-field"><span>{{ t('notesGoal') }}</span>
          <Select v-model="draft.goalId" :options="goalOptions" option-label="label" option-value="value" filter show-clear :placeholder="t('notesNoGoal')" class="lb-note-select" />
        </label>
      </div>
      <div class="lb-note-image-editor">
        <div v-if="draft.imageDataUrl" class="lb-note-image-preview"><img :src="draft.imageDataUrl" :alt="t('notesImage')" /><button type="button" :title="t('notesRemoveImage')" @click="draft.imageDataUrl = null"><i class="bi bi-x-lg" /></button></div>
        <FileUpload v-else mode="basic" custom-upload auto accept="image/jpeg,image/png,image/webp" :choose-label="t('notesAttach')" @select="chooseImage" />
        <small>{{ t('notesImageHint') }}</small>
      </div>
      <label class="lb-note-pin-control"><Checkbox v-model="draft.pinned" binary /> <i class="bi bi-pin-angle" />{{ t('notesPin') }}</label>
      <p v-if="error || saveError" class="lb-note-error" role="alert">{{ error || saveError }}</p>
      <div class="lb-note-editor-actions"><button type="button" class="lb-button lb-button-outline" @click="close">{{ t('close') }}</button><button type="submit" class="lb-button lb-button-primary" :disabled="working"><i class="bi bi-check2" />{{ working ? t('notesImageProcessing') : t('save') }}</button></div>
    </form>
  </Dialog>
</template>
