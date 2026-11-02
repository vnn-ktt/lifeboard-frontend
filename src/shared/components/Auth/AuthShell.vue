<script setup lang="ts">
import LifeboardLogo from '@/shared/components/Brand/LifeboardLogo.vue';
import LifeboardMascot from '@/shared/components/Brand/LifeboardMascot.vue';
import LifeThemeSwitcher from '@/shared/components/Theme/LifeThemeSwitcher.vue';
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
        <h1>Собери свою жизнь в одном спокойном пространстве.</h1>
        <p>Цели, ритм, привычки и маленькие шаги, которые действительно двигают тебя вперёд.</p>
      </div>
      <LifeboardMascot size="lg" />
    </div>

    <div class="lb-auth-content"><slot /></div>
    <p class="lb-auth-footnote">Локальный прототип · Данные пока живут в этом браузере</p>
  </div>
</template>
