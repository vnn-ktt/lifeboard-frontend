<script setup lang="ts">
import { computed } from 'vue';
import DatePicker from 'primevue/datepicker';
import { dateKey, parseDate } from '../date';

/** Keep the domain date as YYYY-MM-DD (without UTC conversion). */
const props = defineProps<{ modelValue?: string | null; min?: string; max?: string; required?: boolean; inputId?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const selected = computed<Date | null>({
  get: () => props.modelValue ? parseDate(props.modelValue) : null,
  set: value => emit('update:modelValue', value instanceof Date && !Number.isNaN(value.getTime()) ? dateKey(value) : ''),
});
const minimum = computed(() => props.min ? parseDate(props.min) : undefined);
const maximum = computed(() => props.max ? parseDate(props.max) : undefined);
</script>

<template>
  <DatePicker v-model="selected" class="lb-prime-date" :input-id="inputId" :min-date="minimum" :max-date="maximum"
    date-format="yy-mm-dd" show-icon icon-display="input" show-button-bar :required="required" />
</template>
