<script setup lang="ts">
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import LifeDatePicker from '../LifeDatePicker.vue';
import type { GoalDraft } from '../../composables/useGoalDraft';
import { useGoalMetricsI18n } from '../../goalMetricsI18n';
import { useGoalCheckinI18n } from '../../goalCheckinI18n';

/** The same typed, mutable draft is shared by quick entry and the wizard. */
const props = defineProps<{ draft: GoalDraft; compact?: boolean }>();
const { mt } = useGoalMetricsI18n();
const { ct, weekdays } = useGoalCheckinI18n();
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
        <InputNumber :model-value="draft.startValue" @update:model-value="draft.startValue = $event ?? 0" class="lb-input" :max-fraction-digits="6" required />
      </label>
      <label class="lb-goal-field"><span>{{ mt('targetValue') }} <span class="lb-required-mark" aria-hidden="true">*</span></span>
        <InputNumber :model-value="draft.resultTarget" @update:model-value="draft.resultTarget = $event ?? 0" class="lb-input" :max-fraction-digits="6" required />
      </label>
      <label class="lb-goal-field"><span>{{ mt('unit') }} <span class="lb-required-mark" aria-hidden="true">*</span></span>
        <InputText v-model="draft.unit" maxlength="20" class="lb-input" :placeholder="mt('unitPlaceholder')" required />
      </label>
    </div>

    <label class="lb-goal-field lb-metric-action-target"><span>{{ mt('activityTarget') }} <span class="lb-required-mark" aria-hidden="true">*</span></span>
      <InputNumber :model-value="draft.target" @update:model-value="draft.target = $event ?? 1" class="lb-input" :min="1" :max="10000" :min-fraction-digits="0" :max-fraction-digits="0" required />
      <small v-if="draft.measurementKind !== 'activity'">{{ mt('activityHelp') }}</small>
    </label>

    <div class="lb-metric-fields-heading lb-metric-date-heading"><strong>{{ mt('dates') }}</strong><span>{{ mt('optional') }}</span></div>
    <div class="lb-metric-dates">
      <label class="lb-goal-field"><span>{{ mt('startDate') }}</span><LifeDatePicker v-model="draft.startDate" /></label>
      <label class="lb-goal-field"><span>{{ mt('dueDate') }}</span><LifeDatePicker v-model="draft.dueDate" :min="draft.startDate || undefined" /></label>
    </div>

    <div v-if="draft.measurementKind !== 'activity'" class="lb-checkin-schedule">
      <div class="lb-metric-fields-heading"><strong>{{ ct('scheduleTitle') }}</strong><p>{{ ct('scheduleHint') }}</p></div>
      <div class="lb-checkin-schedule-controls">
        <label class="lb-goal-field"><span>{{ ct('frequency') }}</span>
          <Select v-model="draft.checkinFrequency" :options="['weekly', 'daily', 'manual', 'off'].map(value => ({ label: ct(value as 'weekly' | 'daily' | 'manual' | 'off'), value }))" option-label="label" option-value="value" class="lb-goal-prime-select" />
        </label>
        <label v-if="draft.checkinFrequency === 'weekly'" class="lb-goal-field"><span>{{ ct('weekday') }}</span>
          <Select v-model="draft.checkinWeekday" :options="weekdays().map((day, index) => ({ label: day, value: index + 1 }))" option-label="label" option-value="value" class="lb-goal-prime-select" />
        </label>
      </div>
    </div>
  </div>
</template>
