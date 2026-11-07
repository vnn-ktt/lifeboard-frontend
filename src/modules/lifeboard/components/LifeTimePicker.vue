<script setup lang="ts">
import { computed } from 'vue';
import DatePicker from 'primevue/datepicker';

/** Time-only DatePicker with the existing HH:mm persistence contract. */
const props = defineProps<{ modelValue: string; required?: boolean; inputId?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
const selected = computed<Date | null>({
  get: () => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(props.modelValue)) return null;
    const date = new Date(2026, 0, 1, Number(props.modelValue.slice(0, 2)), Number(props.modelValue.slice(3)));
    return date;
  },
  set: value => emit('update:modelValue', value instanceof Date && !Number.isNaN(value.getTime())
    ? `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}` : ''),
});
</script>

<template>
  <DatePicker v-model="selected" class="lb-prime-time" :input-id="inputId" time-only hour-format="24"
    show-icon icon-display="input" :step-minute="5" :required="required" />
</template>
