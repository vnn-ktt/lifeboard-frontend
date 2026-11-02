<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { RouteName } from '@/shared/constants/route-name';
import Button from 'primevue/button';

const router = useRouter();
const { t } = useI18n();

function goHome() {
  router.push({ name: RouteName.HOME });
}
</script>

<template>
  <div class="flex min-h-100dvh flex-col items-center justify-center gap-4 px-4 text-center">
    <div
      class="animate-pop-bounce flex h-20 w-20 items-center justify-center rounded-full bg-primary-muted"
    >
      <span class="animate-float text-3xl font-bold text-primary">404</span>
    </div>
    <h2 class="animate-pop-bounce animate-stagger-2 text-xl font-bold text-text">
      {{ t('common.notFound.title') }}
    </h2>
    <p class="animate-pop-bounce animate-stagger-3 max-w-md text-text-muted">
      {{ t('common.notFound.description') }}
    </p>
    <Button class="animate-pop-bounce mt-2" :label="t('common.notFound.cta')" @click="goHome" />
  </div>
</template>
