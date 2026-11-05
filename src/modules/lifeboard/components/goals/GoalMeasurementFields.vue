<script setup lang="ts">
import type { GoalDraft } from '../../composables/useGoalDraft';
import { useGoalMetricsI18n } from '../../goalMetricsI18n';

/** The same typed, mutable draft is shared by quick entry and the wizard. */
const props = defineProps<{ draft: GoalDraft; compact?: boolean }>();
const { mt } = useGoalMetricsI18n();
const options = [
  { kind: 'activity', icon: 'bi-check2-square', label: 'kindActivity', hint: 'kindActivityHelp' },
  { kind: 'increase', icon: 'bi-graph-up-arrow', label: 'kindIncrease', hint: 'kindIncreaseHelp' },
  { kind: 'decrease', icon: 'bi-graph-down-arrow', label: 'kindDecrease', hint: 'kindDecreaseHelp' },
  { kind: 'binary', icon: 'bi-toggle-on', label: 'kindBinary', hint: 'kindBinaryHelp' },
] as const;
</script>

<template>
  <div :class="['lb-metric-fields', { 'is-compact': compact }]">
    <div class="lb-metric-fields-heading"><strong>{{ mt('tracking') }}</strong><p>{{ mt('trackingHint') }}</p></div>
    <div class="lb-metric-kind-options" role="group" :aria-label="mt('tracking')">
      <button v-for="option in options" :key="option.kind" type="button"
        :class="['lb-metric-kind', { 'is-active': props.draft.measurementKind === option.kind }]"
        :aria-pressed="props.draft.measurementKind === option.kind"
        @click="props.draft.measurementKind = option.kind">
        <i :class="['bi', option.icon]" aria-hidden="true" /><span>{{ mt(option.label) }}</span>
      </button>
    </div>
    <p class="lb-metric-kind-help">{{ mt(options.find(option => option.kind === props.draft.measurementKind)?.hint ?? 'kindActivityHelp') }}</p>

    <div v-if="draft.measurementKind === 'increase' || draft.measurementKind === 'decrease'" class="lb-metric-fields-numeric">
      <label class="lb-goal-field"><span>{{ mt('startingValue') }} <span class="lb-required-mark" aria-hidden="true">*</span></span>
        <input v-model.number="draft.startValue" type="number" step="any" class="lb-input" required />
      </label>
      <label class="lb-goal-field"><span>{{ mt('targetValue') }} <span class="lb-required-mark" aria-hidden="true">*</span></span>
        <input v-model.number="draft.resultTarget" type="number" step="any" class="lb-input" required />
      </label>
      <label class="lb-goal-field"><span>{{ mt('unit') }} <span class="lb-required-mark" aria-hidden="true">*</span></span>
        <input v-model="draft.unit" type="text" maxlength="20" class="lb-input" :placeholder="mt('unitPlaceholder')" required />
      </label>
    </div>

    <label class="lb-goal-field lb-metric-action-target"><span>{{ mt('activityTarget') }} <span class="lb-required-mark" aria-hidden="true">*</span></span>
      <input v-model.number="draft.target" class="lb-input" type="number" min="1" max="10000" step="1" required />
      <small v-if="draft.measurementKind !== 'activity'">{{ mt('activityHelp') }}</small>
    </label>

    <div class="lb-metric-fields-heading lb-metric-date-heading"><strong>{{ mt('dates') }}</strong><span>{{ mt('optional') }}</span></div>
    <div class="lb-metric-dates">
      <label class="lb-goal-field"><span>{{ mt('startDate') }}</span><input v-model="draft.startDate" type="date" class="lb-input" /></label>
      <label class="lb-goal-field"><span>{{ mt('dueDate') }}</span><input v-model="draft.dueDate" type="date" :min="draft.startDate || undefined" class="lb-input" /></label>
    </div>
  </div>
</template>
