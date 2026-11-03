<script setup lang="ts">
import { useBrandLoaderStore } from '@/shared/stores/useBrandLoaderStore'

const loader = useBrandLoaderStore()
const pieces = ['tl', 'tr', 'bl', 'br']
</script>

<template>
  <Teleport to="body">
    <Transition name="lb-overlay-transition">
      <div v-if="loader.active" class="lb-brand-loader" role="status" aria-live="polite" aria-busy="true">
        <div class="lb-brand-loader__card">
          <div class="lb-brand-loader__halo" aria-hidden="true"></div>

          <div class="lb-brand-loader__assembly" aria-hidden="true">
            <span v-for="piece in pieces" :key="piece" :class="['lb-loader-piece', `lb-loader-piece--${piece}`]"></span>
            <span class="lb-loader-glow"></span>
          </div>

          <strong>{{ loader.message || 'Lifeboard' }}</strong>
          <p>{{ loader.details || 'Собираем модули в единую систему…' }}</p>
          <div class="lb-brand-loader__dots" aria-hidden="true"><span></span><span></span><span></span></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
