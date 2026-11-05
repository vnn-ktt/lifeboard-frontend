<script setup lang="ts">
withDefaults(defineProps<{ id: string; label: string; modelValue: string; type?: string; placeholder?: string; autocomplete?: string; required?: boolean; maxlength?: number }>(), { type: 'text', placeholder: '', autocomplete: 'off', required: false });
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div class="lb-auth-field">
    <label :for="id">{{ label }} <span v-if="required" class="lb-required-mark" aria-hidden="true">*</span></label>
    <input :id="id" class="lb-input" :type="type" :value="modelValue" :placeholder="placeholder" :autocomplete="autocomplete" :required="required" :maxlength="maxlength" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
  </div>
</template>
