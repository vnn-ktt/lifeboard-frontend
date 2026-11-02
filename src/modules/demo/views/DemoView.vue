<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import DemoPreview from '@/modules/demo/components/DemoPreview.vue';
import FeatureCard from '@/modules/demo/components/FeatureCard.vue';
import {
  features,
  previewCategories,
  previewStats,
  previewTransactions,
} from '@/modules/demo/config';
import { RouteName } from '@/shared/constants/route-name';

const { t } = useI18n();
</script>

<template>
  <main class="overflow-hidden">
    <section class="flex justify-center  py-10 lg:py-16">
      <div class="grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div class="max-w-2xl">
          <p
            class="animate-appear-invisible-bottom text-sm font-bold uppercase tracking-[0.18em] text-primary"
          >
            {{ t('demo.hero.eyebrow') }}
          </p>
          <h1
            class="animate-appear-invisible-bottom mt-4 text-4xl font-bold leading-tight text-text sm:text-5xl lg:text-6xl"
            style="animation-delay: 100ms"
          >
            {{ t('demo.hero.title') }}
          </h1>
          <p
            class="animate-appear-invisible-bottom mt-5 max-w-xl text-lg leading-8 text-text-muted"
            style="animation-delay: 200ms"
          >
            {{ t('demo.hero.description') }}
          </p>

          <div
            class="animate-appear-invisible-bottom mt-8 flex flex-col gap-3 sm:flex-row"
            style="animation-delay: 300ms"
          >
            <RouterLink :to="{ name: RouteName.LOGIN }">
              <Button
                :label="t('demo.hero.getStarted')"
                icon="bi bi-arrow-right"
                icon-pos="right"
                class="w-full sm:w-auto"
              />
            </RouterLink>
            <a href="#features">
              <Button
                :label="t('demo.hero.learnMore')"
                icon="bi bi-stars"
                severity="secondary"
                class="w-full sm:w-auto border-border!"
              />
            </a>
          </div>
        </div>

        <DemoPreview
          class="animate-appear-invisible-bottom"
          style="animation-delay: 400ms"
          :preview-categories="previewCategories"
          :preview-stats="previewStats"
          :preview-transactions="previewTransactions"
        />
      </div>
    </section>

    <section id="features" class="flex justify-center border-y border-border py-14 lg:py-20">
      <div class="max-w-7xl">
        <div class="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.18em] text-primary">
              {{ t('demo.features.eyebrow') }}
            </p>
            <h2 class="mt-4 text-3xl font-bold leading-tight text-text sm:text-4xl">
              {{ t('demo.features.title') }}
            </h2>
          </div>
          <p class="m-0 max-w-2xl text-lg leading-8 text-text-muted lg:justify-self-end">
            {{ t('demo.clarity.description') }}
          </p>
        </div>

        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            v-for="(feature, index) in features"
            :key="feature.key"
            :accent-class="feature.accentClass"
            :animation-delay="`${index * 120}ms`"
            :description="t(`demo.features.items.${feature.key}.description`)"
            :icon="feature.icon"
            :title="t(`demo.features.items.${feature.key}.title`)"
          />
        </div>
      </div>
    </section>

    <section class="flex justify-center bg-bg py-14 lg:py-20">
      <div class="grid max-w-7xl gap-6 pt-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p
            class="animate-appear-invisible-bottom text-sm font-bold uppercase tracking-[0.18em] text-primary"
          >
            {{ t('demo.cta.eyebrow') }}
          </p>
          <h2
            class="animate-appear-invisible-bottom mt-3 max-w-3xl text-3xl font-bold leading-tight text-text sm:text-4xl"
            style="animation-delay: 100ms"
          >
            {{ t('demo.cta.title') }}
          </h2>
        </div>
        <RouterLink
          :to="{ name: RouteName.LOGIN }"
          class="animate-appear-invisible-bottom"
          style="animation-delay: 200ms"
        >
          <Button
            :label="t('demo.cta.getStarted')"
            icon="bi bi-arrow-right"
            icon-pos="right"
            class="w-full lg:w-auto"
          />
        </RouterLink>
      </div>
    </section>
  </main>
</template>
