<script setup lang="ts">
import LifeboardMascot from './LifeboardMascot.vue'
import { useBrandLoaderStore } from '@/shared/stores/useBrandLoaderStore'
import { useLifeI18n } from '@/modules/lifeboard/i18n'

const loader = useBrandLoaderStore()
const { lang } = useLifeI18n()
const fallback = {
  ru: 'Поддерживаем рост твоих планов…',
  en: 'Nurturing your plans…',
  de: 'Wir lassen deine Pläne wachsen…',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lb-overlay-transition">
      <div v-if="loader.active" class="lb-brand-loader" role="status" aria-live="polite" aria-busy="true">
        <div class="lb-brand-loader__card">
          <div class="lb-brand-loader__halo" aria-hidden="true" />
          <div class="lb-cactus-loader-scene" aria-hidden="true">
            <LifeboardMascot size="lg" animated />
            <svg class="lb-cactus-loader-can" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path d="M12 29H43L39 52H17L12 29Z" fill="#87B9A7" stroke="#476F63" stroke-width="2.8" stroke-linejoin="round"/>
              <path d="M42 31L54 26L58 31L43 41" stroke="#476F63" stroke-width="4" stroke-linejoin="round"/>
              <path d="M13 29C13 19 20 15 26 15" stroke="#476F63" stroke-width="3.6" stroke-linecap="round"/>
              <path d="M20 27V42" stroke="#D4E9DF" stroke-width="3.2" opacity=".55" stroke-linecap="round"/>
            </svg>
            <span class="lb-cactus-loader-drop lb-cactus-loader-drop--1" />
            <span class="lb-cactus-loader-drop lb-cactus-loader-drop--2" />
            <span class="lb-cactus-loader-drop lb-cactus-loader-drop--3" />
          </div>
          <strong>{{ loader.message || 'Lifeboard' }}</strong>
          <p>{{ loader.details || fallback[lang] }}</p>
          <div class="lb-brand-loader__dots" aria-hidden="true"><span /><span /><span /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
