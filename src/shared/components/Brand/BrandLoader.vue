<script setup lang="ts">
import LifeboardMascot from './LifeboardMascot.vue';
import { useBrandLoaderStore } from '@/shared/stores/useBrandLoaderStore';

const loader = useBrandLoaderStore();
</script>

<template>
  <Teleport to="body">
    <Transition name="lb-overlay-transition">
      <div v-if="loader.active" class="lb-brand-loader" role="status" aria-live="polite" aria-busy="true">
        <div class="lb-brand-loader__card">
          <div class="lb-brand-loader__halo" aria-hidden="true"></div>

          <div class="lb-brand-loader__scene" aria-hidden="true">
            <div class="lb-brand-loader__watering-can">
              <i class="bi bi-droplet-half" />
            </div>

            <div class="lb-brand-loader__rain">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div class="lb-brand-loader__grow-wrap">
              <div class="lb-brand-loader__grow-mask">
                <div class="lb-brand-loader__grow-cactus">
                  <LifeboardMascot size="lg" />
                </div>
              </div>
            </div>
          </div>

          <strong>{{ loader.message || 'Lifeboard' }}</strong>
          <p>{{ loader.details || 'Поливаем идеи и собираем всё по местам…' }}</p>
          <div class="lb-brand-loader__dots" aria-hidden="true"><span></span><span></span><span></span></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
