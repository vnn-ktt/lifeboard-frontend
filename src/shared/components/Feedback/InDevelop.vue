<script setup lang="ts">
import { computed } from 'vue';
import Tag from 'primevue/tag';
import { useLifeI18n } from '@/modules/lifeboard/i18n';
const props = withDefaults(defineProps<{ feature?: string }>(), { feature: 'Helper' });
const { lang } = useLifeI18n();
const copy = computed(() => ({
  ru: { badge: 'После версии 1.0.0', title: 'Функция в разработке', text: 'Мы готовим интеллектуального помощника. Пока сосредоточься на своих целях — к Helper вернёмся после релиза 1.0.0.' },
  en: { badge: 'After version 1.0.0', title: 'In development', text: 'We are preparing your intelligent assistant. For now, focus on your goals — Helper will return after 1.0.0.' },
  de: { badge: 'Nach Version 1.0.0', title: 'In Entwicklung', text: 'Dein intelligenter Assistent ist in Vorbereitung. Konzentriere dich vorerst auf deine Ziele — Helper kommt nach 1.0.0 zurück.' },
}[lang.value]));
</script>

<template>
  <section class="lb-in-develop" role="status" :aria-label="copy.title">
    <div class="lb-in-develop-mark" aria-hidden="true"><i class="bi bi-stars" /></div>
    <Tag severity="secondary" :value="copy.badge" rounded />
    <h2>{{ props.feature }} · {{ copy.title }}</h2>
    <p>{{ copy.text }}</p>
    <div class="lb-in-develop-track" aria-hidden="true"><span /><span /><span /></div>
  </section>
</template>
