<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import { useLifeStore } from '../stores/useLifeStore';
import { useLifeI18n } from '../i18n';

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });
const visible = ref(false);
const store = useLifeStore();
const { t, titleFor, locale } = useLifeI18n();
</script>

<template>
  <button
    type="button"
    :class="compact ? 'lb-focus-edit' : 'lb-button lb-button-outline'"
    :aria-label="t('editFocus')"
    :title="t('editFocus')"
    @click="visible = true"
  >
    <i class="bi bi-pencil-square" aria-hidden="true" />
    <span v-if="!compact">{{ t('editFocus') }}</span>
  </button>
  <Dialog v-model:visible="visible" modal :header="t('editFocus')" :style="{ width: 'min(440px, calc(100vw - 24px))' }" class="lb-focus-dialog">
    <p class="lb-focus-help">{{ t('focusHelp') }}</p>
    <div class="lb-focus-picker" role="group" :aria-label="t('focus')">
      <button
        v-for="goal in store.goals" :key="goal.id" type="button"
        :class="['lb-focus-pick', { 'is-active': store.isFocus(goal.id) }]"
        :disabled="!store.isFocus(goal.id) && store.focusGoals.length >= 3"
        :aria-pressed="store.isFocus(goal.id)"
        @click="store.toggleFocus(goal.id)"
      >
        <span class="lb-focus-mark"><i :class="store.isFocus(goal.id) ? 'bi bi-star-fill' : 'bi bi-star'" /></span>
        <span class="lb-focus-pick-copy"><strong>{{ titleFor(goal) }}</strong><small>{{ store.getAreaName(goal.areaId, locale) }}</small></span>
        <span v-if="store.isFocus(goal.id)" class="lb-focus-selected"><i class="bi bi-check2" /></span>
      </button>
    </div>
    <div class="lb-focus-dialog-foot"><span>{{ store.focusGoals.length }} / 3</span><button class="lb-button lb-button-primary" type="button" @click="visible = false">{{ t('done') }}</button></div>
  </Dialog>
</template>
