<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import Button from 'primevue/button';
import BudgeeButton from '@/shared/components/BudgeeButton/BudgeeButton.vue';
import { type LayoutNavigationItem } from '@/shared/components/Layout/config';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { calcActiveClass } from '@/shared/components/Layout/utils';

interface Props {
  navigationItems: LayoutNavigationItem[];
}

const props = defineProps<Props>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const currentYear = computed(() => new Date().getFullYear());

function tapButton(item: LayoutNavigationItem): void {
  router.push(item.to);
}

function getNavigationLabel(item: LayoutNavigationItem): string {
  return item.label ?? (item.labelKey ? t(item.labelKey) : item.key);
}

function isActive(item: LayoutNavigationItem): boolean {
  return route.name === item.key;
}
</script>

<template>
  <footer
    class="hidden border-t border-border bg-surface/85 text-text shadow-soft backdrop-blur md:flex md:justify-center"
  >
    <div class="flex w-full max-w-[1600px] justify-between gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div class="max-w-md">
        <BudgeeButton />

        <p class="mb-0 mt-4 text-sm leading-6 text-text-muted">
          {{ t('layout.footer.description') }}
        </p>
      </div>

      <nav v-if="authStore.isAuthenticated" :aria-label="t('layout.navigation.footerLabel')">
        <p class="m-0 text-sm font-bold text-text">
          {{ t('layout.footer.navigationTitle') }}
        </p>

        <ul class="m-0 mt-3 list-none p-0">
          <li v-for="item in props.navigationItems" :key="item.key">
            <Button
              :label="getNavigationLabel(item)"
              variant="link"
              type="button"
              :class="calcActiveClass(route, item)"
              :disabled="item.disabled"
              :pt="{
                label: {
                  style: {
                    fontWeight: 'inherit',
                  },
                },
              }"
              @click="tapButton(item)"
            />
          </li>
        </ul>
      </nav>

      <div>
        <p class="m-0 text-sm font-bold text-text">
          {{ t('layout.footer.legalTitle') }}
        </p>
        <p class="mb-0 mt-3 text-sm leading-6 text-text-muted">
          {{ t('layout.footer.copyright', { year: currentYear }) }}
        </p>
      </div>
    </div>
  </footer>

  <footer
    v-if="authStore.isAuthenticated"
    class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/85 shadow-soft backdrop-blur md:hidden"
  >
    <nav class="flex justify-center" :aria-label="t('layout.navigation.mobileLabel')">
      <div
        class="flex w-full max-w-[1600px] items-center justify-around gap-1 px-4 py-2 sm:px-6 lg:px-8"
      >
        <button
          v-for="item in props.navigationItems"
          :key="item.key"
          type="button"
          class="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors md:max-w-36"
          :class="[isActive(item) ? 'text-primary' : 'text-text-muted hover:text-text']"
          :disabled="item.disabled"
          @click="tapButton(item)"
        >
          <i
            :class="[item.icon, 'text-xl', isActive(item) ? 'opacity-100' : 'opacity-70']"
            aria-hidden="true"
          />
          <span class="text-[10px] font-medium leading-tight truncate max-w-full">
            {{ getNavigationLabel(item) }}
          </span>
        </button>
      </div>
    </nav>
  </footer>
</template>
