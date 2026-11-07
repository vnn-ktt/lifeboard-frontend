<script setup lang="ts">
import InputText from 'primevue/inputtext';
import { computed, reactive, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import type { LifeNoteGroup } from '../../types';
import { useLifeI18n } from '../../i18n';
import { useLifeStore } from '../../stores/useLifeStore';

const props = defineProps<{ visible: boolean; group: LifeNoteGroup | null; saveError?: string }>();
const emit = defineEmits<{ 'update:visible': [value: boolean]; save: [input: { name: string; goalId: string | null; color: string }]; remove: [id: string] }>();
const { t, titleFor } = useLifeI18n();
const store = useLifeStore();
const draft = reactive({ name: '', goalId: null as string | null, color: '#9CBFA3' });
const goalOptions = computed(() => store.goals.map(goal => ({ label: titleFor(goal), value: goal.id })));
const colors = ['#9CBFA3', '#E4AC71', '#B6A1D2', '#88B7CE', '#E4A0AA', '#D8BF79'];
const error = ref('');
watch(() => [props.visible, props.group?.id], () => {
  if (!props.visible) return;
  Object.assign(draft, { name: props.group?.name ?? '', goalId: props.group?.goalId ?? null, color: props.group?.color ?? colors[0] });
  error.value = '';
}, { immediate: true });
function save() {
  if (draft.name.trim().length < 2 || draft.name.trim().length > 55) { error.value = t('notesGroupError'); return; }
  emit('save', { ...draft });
}
</script>

<template>
  <Dialog :visible="visible" modal :header="group ? t('notesEditGroup') : t('notesNewGroup')" :style="{ width: 'min(460px, calc(100vw - 20px))' }" class="lb-note-dialog" :block-scroll="false" @update:visible="emit('update:visible', $event)">
    <form class="lb-note-editor" @submit.prevent="save">
      <label class="lb-note-field"><span>{{ t('notesGroupName') }}<span class="lb-required-mark" aria-hidden="true">*</span></span><InputText v-model="draft.name" class="lb-input" maxlength="55" required :placeholder="t('notesGroupPlaceholder')" /></label>
      <label class="lb-note-field"><span>{{ t('notesGroupGoal') }}</span><Select v-model="draft.goalId" :options="goalOptions" option-label="label" option-value="value" filter show-clear :placeholder="t('notesNoGoal')" class="lb-note-select" /></label>
      <div class="lb-note-field"><span>{{ t('notesGroupColor') }}</span><div class="lb-note-color-choices"><button v-for="color in colors" :key="color" type="button" :style="{ background: color }" :class="{ 'is-current': draft.color === color }" :aria-label="color" :aria-pressed="draft.color === color" @click="draft.color = color"><i v-if="draft.color === color" class="bi bi-check-lg" /></button></div></div>
      <p v-if="error || saveError" class="lb-note-error" role="alert">{{ error || saveError }}</p>
      <div class="lb-note-editor-actions"><button v-if="group" type="button" class="lb-button lb-note-destructive" @click="emit('remove', group.id)"><i class="bi bi-trash3" />{{ t('notesDeleteGroup') }}</button><button type="button" class="lb-button lb-button-outline" @click="emit('update:visible', false)">{{ t('close') }}</button><button class="lb-button lb-button-primary" type="submit">{{ t('save') }}</button></div>
    </form>
  </Dialog>
</template>
