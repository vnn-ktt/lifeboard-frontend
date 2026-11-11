<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSettingsStore } from '@/shared/stores/useSettingsStore';

const KEY = 'lifeboard:cookie-notice:v1';
const dismissed = ref(false);
try { dismissed.value = localStorage.getItem(KEY) === 'seen'; } catch { /* private mode */ }
const settings = useSettingsStore();
const copy = computed(() => ({
  ru: {
    heading: 'Lifeboard использует cookie',
    text: 'Для безопасного входа мы используем обязательный HttpOnly-cookie сессии. Cookie настроек помогают запоминать оформление приложения. Без сессионного cookie авторизация не работает.',
    action: 'Понятно',
  },
  en: {
    heading: 'Lifeboard uses cookies',
    text: 'We use a necessary HttpOnly session cookie for secure sign-in. Preference cookies remember appearance settings. Signing in requires the session cookie.',
    action: 'Got it',
  },
  de: {
    heading: 'Lifeboard verwendet Cookies',
    text: 'Ein notwendiges HttpOnly-Sitzungs-Cookie ermöglicht die sichere Anmeldung. Einstellungs-Cookies speichern die Darstellung. Ohne Sitzungs-Cookie ist keine Anmeldung möglich.',
    action: 'Verstanden',
  },
})[settings.currentLang] ?? {
  heading: 'Lifeboard uses cookies',
  text: 'We use a necessary HttpOnly session cookie for secure sign-in.',
  action: 'Got it',
});
function dismiss() {
  dismissed.value = true;
  try { localStorage.setItem(KEY, 'seen'); } catch { /* private mode */ }
}
</script>
<template>
  <aside v-if="!dismissed" class="lb-cookie-notice" role="region" :aria-label="copy.heading">
    <div class="lb-cookie-copy">
      <strong><i class="bi bi-shield-check" aria-hidden="true" /> {{ copy.heading }}</strong>
      <p>{{ copy.text }}</p>
    </div>
    <button type="button" class="lb-button lb-button-primary" @click="dismiss">{{ copy.action }}</button>
  </aside>
</template>
<style scoped>
.lb-cookie-notice {
  position: fixed; z-index: 2100; bottom: max(1rem, env(safe-area-inset-bottom));
  left: 50%; transform: translateX(-50%); width: min(640px, calc(100vw - 24px));
  box-sizing: border-box; display: flex; gap: 16px; align-items: center;
  padding: 16px 18px; border-radius: 16px;
  border: 1px solid var(--life-border, #d9e6dc);
  background: var(--life-surface, #fff); color: var(--life-text, #23372c);
  box-shadow: 0 12px 40px rgb(0 0 0 / 16%);
}
.lb-cookie-copy { flex: 1; min-width: 0; }
.lb-cookie-copy strong { font-weight: 700; }
.lb-cookie-copy p { margin: 6px 0 0; font-size: 0.82rem; line-height: 1.5; }
.lb-cookie-notice button { flex: 0 0 auto; white-space: nowrap; }
@media(max-width: 560px) {
  .lb-cookie-notice { flex-direction: column; align-items: stretch; bottom: max(12px, env(safe-area-inset-bottom)); }
  .lb-cookie-notice button { width: 100%; }
}
</style>
