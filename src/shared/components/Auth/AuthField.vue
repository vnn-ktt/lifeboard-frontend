<script setup lang="ts">
import InputText from 'primevue/inputtext';
withDefaults(defineProps<{ id: string; label: string; modelValue: string; type?: string; placeholder?: string; autocomplete?: string; required?: boolean; maxlength?: number }>(), { type: 'text', placeholder: '', autocomplete: 'off', required: false });
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div class="lb-auth-field">
    <label :for="id">{{ label }} <span v-if="required" class="lb-required-mark" aria-hidden="true">*</span></label>
    <InputText :id="id" class="lb-input lb-prime-field" :type="type" :model-value="modelValue" :placeholder="placeholder" :autocomplete="autocomplete" :required="required" :maxlength="maxlength" @update:model-value="emit('update:modelValue', String($event ?? ''))" />
  </div>
</template>
