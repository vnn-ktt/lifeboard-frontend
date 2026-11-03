<script setup lang="ts">
import { computed } from 'vue';
import LifeboardLogo from '@/shared/components/Brand/LifeboardLogo.vue';
import LifeboardMascot from '@/shared/components/Brand/LifeboardMascot.vue';
import AuthLanguageSelector from '@/shared/components/Theme/AuthLanguageSelector.vue';
import { useLifeI18n } from '@/modules/lifeboard/i18n';
const { t, lang } = useLifeI18n();
const assembledChip = computed(() => ({ ru: 'Собранная жизнь', en: 'Assembled life', de: 'Zusammengesetztes Leben' }[lang.value]));
</script>

<template>
  <div class="lb-auth-shell">
    <div class="lb-auth-topbar">
      <RouterLink class="lb-auth-brand" to="/">
        <LifeboardLogo />
      </RouterLink>
      <AuthLanguageSelector />
    </div>

    <div class="lb-auth-spotlight lb-auth-spotlight--compact">
      <div>
        <span class="lb-auth-tag">{{ assembledChip }}</span>
        <h1>{{ t('authHeading') }}</h1>
        <p>{{ t('authSub') }}</p>
      </div>
      <LifeboardMascot size="lg" />
    </div>

    <div class="lb-auth-content"><slot /></div>
    <p class="lb-auth-footnote">{{ t('authFoot') }}</p>
  </div>
</template>
