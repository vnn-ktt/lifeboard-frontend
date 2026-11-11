<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
const error = ref('');
function onError(event: Event) { error.value = (event as CustomEvent<string>).detail || ''; }
onMounted(() => window.addEventListener('lifeboard:sync-error', onError));
onBeforeUnmount(() => window.removeEventListener('lifeboard:sync-error', onError));
function retry() { window.location.reload(); }
</script>
<template>
  <div v-if="error" class="lb-sync-alert" role="alert">
    <div><strong>Изменения не сохранены на сервере.</strong><p>{{ error }}</p></div>
    <button class="lb-button lb-button-outline" type="button" @click="retry">Повторить подключение</button>
  </div>
</template>
<style scoped>
.lb-sync-alert {
  position: fixed; z-index: 2500; top: 12px; left: 50%; transform: translateX(-50%);
  width: min(570px, calc(100vw - 24px)); box-sizing: border-box;
  padding: 14px; display: flex; gap: 12px; align-items: center;
  border: 1px solid #da8568; border-radius: 12px;
  background: var(--life-surface, #fff); color: var(--life-text, #23372c);
  box-shadow: 0 8px 30px rgb(0 0 0 / 16%);
}
.lb-sync-alert div { flex: 1; min-width: 0; }
.lb-sync-alert p { margin: 4px 0 0; overflow-wrap: anywhere; font-size: .85rem; }
@media(max-width:520px) { .lb-sync-alert { flex-direction: column; align-items: stretch; } }
</style>
