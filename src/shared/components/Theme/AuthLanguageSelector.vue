<script setup lang="ts">
import RadioButton from 'primevue/radiobutton';
import { useLifeI18n } from '@/modules/lifeboard/i18n';
import type { Lang } from '@/shared/types/lang';
const { lang, setLanguage } = useLifeI18n();
const options: { value: Lang; label: string }[] = [
  { value: 'ru', label: 'RU' }, { value: 'en', label: 'EN' }, { value: 'de', label: 'DE' },
];
</script>

<template>
  <fieldset class="lb-auth-lang-switch" aria-label="Language / Язык / Sprache">
    <legend class="sr-only">Language / Язык / Sprache</legend>
    <label v-for="option in options" :key="option.value" :class="{ 'is-active': lang === option.value }">
      <RadioButton name="auth-lang" :value="option.value" :model-value="lang" @update:model-value="setLanguage(option.value)" />
      <span>{{ option.label }}</span>
    </label>
  </fieldset>
</template>
