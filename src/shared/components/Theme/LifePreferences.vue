<script setup lang="ts">
import { computed, ref, onBeforeUnmount, onMounted } from 'vue';
import { useThemeStore, type Theme } from '@/shared/stores/useThemeStore';
import { useLifeI18n } from '@/modules/lifeboard/i18n';
import type { Lang } from '@/shared/types/lang';
const themeStore = useThemeStore();
const { t, lang, setLanguage } = useLifeI18n();
const root = ref<HTMLElement|null>(null);
const opened = ref(false);
const themes = computed(() => [
  { value: 'forest' as Theme, label: t('themeForest'), icon: 'bi bi-flower1', color: '#4c9473' },
  { value: 'dark' as Theme, label: t('themeDark'), icon: 'bi bi-moon-stars', color: '#223b32' },
  { value: 'orange' as Theme, label: t('themeOrange'), icon: 'bi bi-sunrise', color: '#d68a5b' },
]);
const languages: { value: Lang; label: string }[] = [{value:'ru',label:'RU'},{value:'en',label:'EN'},{value:'de',label:'DE'}];
const outside=(event:PointerEvent)=>{ if(opened.value && !root.value?.contains(event.target as Node))opened.value=false; };
const escape=(event:KeyboardEvent)=>{ if(event.key==='Escape')opened.value=false; };
onMounted(()=>{document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);});
onBeforeUnmount(()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);});
</script>
<template>
  <div ref="root" class="lb-preferences">
    <button type="button" class="lb-preferences-trigger" :aria-expanded="opened" aria-haspopup="dialog" :aria-label="`${t('settings')}: ${t('theme')}, ${t('language')}`" @click="opened=!opened">
      <i class="bi bi-palette2" aria-hidden="true" /><span>{{ lang.toUpperCase() }}</span><i class="bi bi-chevron-down" aria-hidden="true" />
    </button>
    <div v-if="opened" class="lb-preferences-popover" role="dialog" :aria-label="t('settings')">
      <div class="lb-preferences-top"><strong>{{ t('settings') }}</strong><button type="button" :aria-label="t('close')" @click="opened=false"><i class="bi bi-x-lg" /></button></div>
      <p class="lb-preferences-label">{{ t('theme') }}</p>
      <div class="lb-theme-options">
        <button v-for="item in themes" :key="item.value" type="button" :class="['lb-theme-option',{ 'is-active': themeStore.theme===item.value }]" :aria-pressed="themeStore.theme===item.value" @click="themeStore.setTheme(item.value)">
          <span class="lb-theme-swatch" :style="{background:item.color}"><i :class="item.icon" aria-hidden="true" /></span><span>{{ item.label }}</span>
        </button>
      </div>
      <p class="lb-preferences-label">{{ t('language') }}</p>
      <div class="lb-language-options" role="group" :aria-label="t('language')">
        <button v-for="item in languages" :key="item.value" type="button" :class="{ 'is-active': lang === item.value }" :aria-pressed="lang===item.value" @click="setLanguage(item.value)">{{ item.label }}</button>
      </div>
    </div>
  </div>
</template>
