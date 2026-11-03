<script setup lang="ts">
import LifeboardLogo from '@/shared/components/Brand/LifeboardLogo.vue';
import LifeboardMascot from '@/shared/components/Brand/LifeboardMascot.vue';
import LifeThemeSwitcher from '@/shared/components/Theme/LifeThemeSwitcher.vue';
import { useLifeI18n } from '@/modules/lifeboard/i18n';
const {t}=useLifeI18n();
</script>

<template>
  <div class="lb-auth-shell">
    <div class="lb-auth-topbar">
      <RouterLink class="lb-auth-brand" to="/">
        <LifeboardLogo />
      </RouterLink>
      <LifeThemeSwitcher />
    </div>

    <div class="lb-auth-spotlight">
      <div>
        <span class="lb-auth-tag">ASSEMBLED LIFE</span>
        <h1>{{ t('authHeading') }}</h1>
        <p>{{ t('authSub') }}</p>
      </div>
      <LifeboardMascot size="lg" />
    </div>

    <div class="lb-auth-content"><slot /></div>
    <p class="lb-auth-footnote">{{ t('authFoot') }}</p>
  </div>
</template>
