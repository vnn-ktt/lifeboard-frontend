<script setup lang="ts">
import { computed } from 'vue';
import Tag from 'primevue/tag';
import { useLifeI18n } from '@/modules/lifeboard/i18n';
const props = withDefaults(defineProps<{ feature?: string }>(), { feature: 'Jakk' });
const { lang } = useLifeI18n();
const copy = computed(() => ({
  ru: { badge: 'В разработке', title: 'Функция в разработке', text: 'Мы готовим интеллектуального помощника. Пока сосредоточься на своих целях — Jakk пока недоступен.' },
  en: { badge: 'In development', title: 'In development', text: 'We are preparing your intelligent assistant. For now, focus on your goals — Jakk is not available yet.' },
  de: { badge: 'In Entwicklung', title: 'In Entwicklung', text: 'Dein intelligenter Assistent ist in Vorbereitung. Konzentriere dich vorerst auf deine Ziele — Jakk ist noch nicht verfügbar.' },
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
