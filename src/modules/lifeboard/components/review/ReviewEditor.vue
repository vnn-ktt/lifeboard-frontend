<script setup lang="ts">
import Textarea from 'primevue/textarea';
import Slider from 'primevue/slider';
import { computed } from 'vue';
import { useLifeI18n } from '../../i18n';
import type { WeeklyReview } from '../../types';

type ReviewDraft = Pick<WeeklyReview, 'wins' | 'obstacles' | 'nextStep' | 'mood'>;

/** An explicitly shared, mutable draft. Persist only after the save event. */
const props = defineProps<{ draft: ReviewDraft; saved: boolean }>();
const emit = defineEmits<{ save: [] }>();
const { t, lang } = useLifeI18n();
const moodText = computed(() => {
  const tone = props.draft.mood <= 3 ? 0 : props.draft.mood <= 6 ? 1 : props.draft.mood <= 8 ? 2 : 3;
  const descriptions = {
    ru: ['Тяжёлая', 'Непростая', 'Хорошая', 'Отличная'],
    en: ['Tough', 'So-so', 'Good', 'Great'],
    de: ['Schwer', 'Durchwachsen', 'Gut', 'Großartig'],
  } as const;
  return descriptions[lang.value][tone];
});
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
    <div class="lb-mood-row lb-mood-card" role="group" :aria-label="t('mood')">
      <div class="lb-mood-heading" style="display: flex; gap: 1rem; justify-content: space-between;">
        <span>{{ t('mood') }}</span>
        <span class="lb-mood-selected" role="status" aria-live="polite"><strong>{{ draft.mood }}</strong><span>/ 10</span> · {{ moodText }}</span>
      </div>
      <Slider v-model="draft.mood" :min="1" :max="10" :step="1" class="lb-mood-slider" :aria-label="t('mood')" />
      <div class="lb-mood-scale" aria-hidden="true"><span>1</span><span>5</span><span>10</span></div>
    </div>
    <div class="lb-form-actions">
      <button class="lb-button lb-button-primary" type="submit"><i class="bi bi-check2" /> {{ t('saveReview') }}</button>
      <span v-if="saved" class="lb-save-message" role="status"><i class="bi bi-check-circle" /> {{ t('saved') }}</span>
    </div>
  </form>
</template>
