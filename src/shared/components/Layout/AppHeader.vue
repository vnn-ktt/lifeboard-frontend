<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import Button from 'primevue/button';
import { RouteName } from '@/shared/constants/route-name';
import { type LayoutNavigationItem } from '@/shared/components/Layout/config';
import BudgeeButton from '@/shared/components/BudgeeButton/BudgeeButton.vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { calcActiveClass } from '@/shared/components/Layout/utils';

interface Props {
  navigationItems: LayoutNavigationItem[];
}

const props = defineProps<Props>();

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

function tapButton(item: LayoutNavigationItem): void {
  router.push(item.to);
}

function getNavigationLabel(item: LayoutNavigationItem): string {
  return item.label ?? (item.labelKey ? t(item.labelKey) : item.key);
}

const currentSectionTitle = computed(() => {
  const activeItem = props.navigationItems.find((item) => route.name === item.key);

  if (activeItem) {
    return getNavigationLabel(activeItem);
  }

  switch (route.name) {
    case RouteName.LOGIN:
      return t('auth.login.title');
    case RouteName.REGISTER:
      return t('auth.register.title');
    case RouteName.DEMO:
    case RouteName.HOME:
      return t('app.title');
    default:
      return t('app.title');
  }
});

const showMobileSectionTitle = computed(
  () => route.name !== RouteName.DEMO && route.name !== RouteName.HOME,
);

function goToLogin(): void {
  router.push({ name: RouteName.LOGIN });
}

function goToRegister(): void {
  router.push({ name: RouteName.REGISTER });
}

function goToSettings(): void {
  router.push({ name: RouteName.SETTINGS });
}

function handleLogout(): void {
  authStore.logout();
  router.push({ name: RouteName.HOME });
}
</script>

<template>
  <header
    class="sticky top-0 z-40 flex min-h-16 w-full items-center justify-center border-b border-border bg-surface/85 p-2 backdrop-blur"
  >
    <div
      class="flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 md:hidden"
    >
      <BudgeeButton />
      <h1 v-if="showMobileSectionTitle" class="mobile-page-title">
        {{ currentSectionTitle }}
      </h1>
    </div>

    <div
      class="hidden w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 md:flex"
    >
      <!-- Logo -->
      <div class="flex items-center gap-2 shrink-0">
        <BudgeeButton />
      </div>

      <!-- Desktop Navigation -->
      <nav
        class="hidden min-w-0 items-center gap-2 overflow-x-auto md:flex"
        :aria-label="t('layout.navigation.mainLabel')"
      >
        <Button
          v-for="item in props.navigationItems"
          :key="item.key"
          text
          type="button"
          class="shrink-0 whitespace-nowrap"
          :class="calcActiveClass(route, item)"
          :disabled="item.disabled"
          @click="tapButton(item)"
        >
          {{ getNavigationLabel(item) }}
        </Button>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-2 shrink-0">
        <template v-if="!authStore.isAuthenticated">
          <Button :label="t('layout.header.login')" text type="button" @click="goToLogin" />
          <Button :label="t('layout.header.register')" type="button" @click="goToRegister" />
        </template>
        <template v-else>
          <!-- Settings gear icon -->
          <Button
            icon="bi bi-gear"
            text
            rounded
            type="button"
            :class="route.name === RouteName.SETTINGS ? 'text-primary' : 'text-text-muted'"
            :title="t('common.settings')"
            @click="goToSettings"
          />
          <!-- Logout -->
          <Button
            icon="bi bi-box-arrow-right"
            text
            rounded
            severity="secondary"
            type="button"
            :title="t('layout.header.logout')"
            @click="handleLogout"
          />
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.mobile-page-title {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: color-mix(in srgb, var(--color-primary) 82%, var(--color-text));
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.2;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
