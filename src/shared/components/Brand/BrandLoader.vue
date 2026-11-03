<script setup lang="ts">
import LifeboardMascot from './LifeboardMascot.vue'
import { useBrandLoaderStore } from '@/shared/stores/useBrandLoaderStore'
import { useLifeI18n } from '@/modules/lifeboard/i18n'

const loader = useBrandLoaderStore()
const { lang } = useLifeI18n()
const fallback = {
  ru: 'Собираем всё по местам…',
  en: 'Putting things together…',
  de: 'Wir bringen alles zusammen…',
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lb-overlay-transition">
      <div v-if="loader.active" class="lb-brand-loader" role="status" aria-live="polite" aria-busy="true">
        <div class="lb-brand-loader__card">
          <div class="lb-brand-loader__halo" aria-hidden="true"></div>
          <div class="lb-jakk-loader-scene" aria-hidden="true">
            <div class="lb-jakk-loader-water"><i class="bi bi-droplet-half" /></div>
            <div class="lb-jakk-loader-drops"><i></i><i></i><i></i></div>
            <LifeboardMascot size="lg" animated />
          </div>
          <strong>{{ loader.message || 'Lifeboard' }}</strong>
          <p>{{ loader.details || fallback[lang] }}</p>
          <div class="lb-brand-loader__dots" aria-hidden="true"><span></span><span></span><span></span></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
