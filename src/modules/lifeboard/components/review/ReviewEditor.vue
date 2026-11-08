<script setup lang="ts">
import Textarea from 'primevue/textarea';
import SelectButton from 'primevue/selectbutton';
import { useLifeI18n } from '../../i18n';
import type { WeeklyReview } from '../../types';

type ReviewDraft = Pick<WeeklyReview, 'wins' | 'obstacles' | 'nextStep' | 'mood'>;

/** An explicitly shared, mutable draft. Persist only after the save event. */
defineProps<{ draft: ReviewDraft; saved: boolean }>();
const emit = defineEmits<{ save: [] }>();
const { t } = useLifeI18n();
</script>

<template>
  <form class="lb-review-editor" @submit.prevent="emit('save')">
    <label class="lb-review-field">
      <span>{{ t('wins') }}</span>
      <Textarea v-model="draft.wins" class="lb-input lb-textarea" rows="2" maxlength="1000" :placeholder="t('reviewWinPlaceholder')" />
    </label>
    <label class="lb-review-field">
      <span>{{ t('obstacles') }}</span>
      <Textarea v-model="draft.obstacles" class="lb-input lb-textarea" rows="2" maxlength="1000" :placeholder="t('reviewObstaclePlaceholder')" />
    </label>
    <label class="lb-review-field">
      <span>{{ t('nextStep') }}</span>
      <Textarea v-model="draft.nextStep" class="lb-input lb-textarea" rows="2" maxlength="1000" :placeholder="t('reviewNextPlaceholder')" />
    </label>
    <div class="lb-mood-row">
      <span>{{ t('mood') }}</span>
      <SelectButton v-model="draft.mood" :options="Array.from({ length: 10 }, (_, index) => index + 1)" :allow-empty="false" class="lb-mood-values lb-prime-mood" :aria-label="t('mood')" />
    </div>
    <div class="lb-form-actions">
      <button class="lb-button lb-button-primary" type="submit"><i class="bi bi-check2" /> {{ t('saveReview') }}</button>
      <span v-if="saved" class="lb-save-message" role="status"><i class="bi bi-check-circle" /> {{ t('saved') }}</span>
    </div>
  </form>
</template>
