<script setup lang="ts">
import { computed } from 'vue';
import LifeboardLogo from '@/shared/components/Brand/LifeboardLogo.vue';
import LifeboardMascot from '@/shared/components/Brand/LifeboardMascot.vue';
import AuthLanguageSelector from '@/shared/components/Theme/AuthLanguageSelector.vue';
import { useLifeI18n } from '@/modules/lifeboard/i18n';
const { lang } = useLifeI18n();
const copy = computed(() => ({
  ru: {
    eyebrow: 'ТВОЯ ЖИЗНЬ. ТВОЙ ПУТЬ.', lead: 'Большие цели начинаются с одного шага.',
    description: 'Объедини планы, привычки и маленькие победы в одном спокойном пространстве.',
    words: ['Планируй', 'Действуй', 'Замечай прогресс'], path: 'Твоя дорожная карта',
    journey: ['Определи направление', 'Выбери следующий шаг', 'Отслеживай результат'],
    private: 'Демонстрационная версия: данные сохраняются локально в браузере.',
  },
  en: {
    eyebrow: 'YOUR LIFE. YOUR PATH.', lead: 'Big goals start with a single step.',
    description: 'Bring your plans, habits and small wins together in one calm workspace.',
    words: ['Plan', 'Act', 'See progress'], path: 'Your journey',
    journey: ['Find your direction', 'Choose the next step', 'Track the outcome'],
    private: 'Demo version: data is stored locally in this browser.',
  },
  de: {
    eyebrow: 'DEIN LEBEN. DEIN WEG.', lead: 'Große Ziele beginnen mit einem Schritt.',
    description: 'Vereine Pläne, Gewohnheiten und kleine Erfolge an einem ruhigen Ort.',
    words: ['Planen', 'Handeln', 'Fortschritt sehen'], path: 'Dein Weg',
    journey: ['Richtung bestimmen', 'Nächsten Schritt wählen', 'Ergebnis verfolgen'],
    private: 'Demoversion: Daten bleiben lokal in diesem Browser.',
  },
}[lang.value]));
</script>

<template>
  <div class="lb-auth-shell lb-auth-landing">
    <header class="lb-auth-topbar lb-auth-landing-header">
      <RouterLink class="lb-auth-brand" to="/" aria-label="Lifeboard"><LifeboardLogo /></RouterLink>
      <AuthLanguageSelector />
    </header>

    <main class="lb-auth-landing-body">
      <section class="lb-auth-story" aria-labelledby="lb-auth-story-title">
        <p class="lb-auth-story-eyebrow"><span class="lb-auth-story-sparkle">✳</span> {{ copy.eyebrow }}</p>
        <h1 id="lb-auth-story-title">{{ copy.lead }}</h1>
        <p class="lb-auth-story-lead">{{ copy.description }}</p>
        <div class="lb-auth-features" aria-label="Lifeboard features">
          <span v-for="(word, index) in copy.words" :key="word"><i :class="['bi', index === 0 ? 'bi-compass' : index === 1 ? 'bi-check-circle' : 'bi-graph-up-arrow']" />{{ word }}</span>
        </div>
        <div class="lb-auth-journey">
          <div class="lb-auth-journey-head"><span>{{ copy.path }}</span></div>
          <div class="lb-auth-journey-stage"><span class="lb-auth-journey-line" aria-hidden="true" />
            <div v-for="(label, index) in copy.journey" :key="label" class="lb-auth-journey-step" :style="{ '--stage-index': index }">
              <span class="lb-auth-journey-number">0{{ index + 1 }}</span><strong>{{ label }}</strong>
            </div>
          </div>
          <LifeboardMascot size="lg" class="lb-auth-journey-mascot" />
        </div>
      </section>
      <section class="lb-auth-form-panel" aria-label="Lifeboard account">
        <slot />
      </section>
    </main>
    <footer class="lb-auth-landing-footer"><span>© Lifeboard</span><span>{{ copy.private }}</span></footer>
  </div>
</template>
