<script lang="ts" setup>
import { computed, ref, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import ProfileSection from '@/modules/settings/components/sections/ProfileSection.vue';
import SecuritySection from '@/modules/settings/components/sections/SecuritySection.vue';
import LocalizationSection from '@/modules/settings/components/sections/LocalizationSection.vue';
import AccountsSection from '@/modules/settings/components/sections/AccountsSection.vue';
import BudgetsSection from '@/modules/settings/components/sections/BudgetsSection.vue';
import NotificationsSection from '@/modules/settings/components/sections/NotificationsSection.vue';
import RecurringSection from '@/modules/settings/components/sections/RecurringSection.vue';
import AppearanceSection from '@/modules/settings/components/sections/AppearanceSection.vue';
import ImportExportSection from '@/modules/settings/components/sections/ImportExportSection.vue';
import PrivacySection from '@/modules/settings/components/sections/PrivacySection.vue';

const { t } = useI18n();

interface SettingsTab {
  key: string;
  icon: string;
  label: string;
  component: Component;
}

const tabs = computed<SettingsTab[]>(() => [
  {
    key: 'profile',
    icon: 'bi bi-person',
    label: t('settings.tabs.profile'),
    component: ProfileSection,
  },
  {
    key: 'security',
    icon: 'bi bi-shield-check',
    label: t('settings.tabs.security'),
    component: SecuritySection,
  },
  {
    key: 'localization',
    icon: 'bi bi-globe',
    label: t('settings.tabs.localization'),
    component: LocalizationSection,
  },
  {
    key: 'accounts',
    icon: 'bi bi-wallet',
    label: t('settings.tabs.accounts'),
    component: AccountsSection,
  },
  {
    key: 'budgets',
    icon: 'bi bi-pie-chart',
    label: t('settings.tabs.budgets'),
    component: BudgetsSection,
  },
  {
    key: 'notifications',
    icon: 'bi bi-bell',
    label: t('settings.tabs.notifications'),
    component: NotificationsSection,
  },
  {
    key: 'recurring',
    icon: 'bi bi-arrow-repeat',
    label: t('settings.tabs.recurring'),
    component: RecurringSection,
  },
  {
    key: 'appearance',
    icon: 'bi bi-palette',
    label: t('settings.tabs.appearance'),
    component: AppearanceSection,
  },
  {
    key: 'import-export',
    icon: 'bi bi-box-arrow-in-down',
    label: t('settings.tabs.importExport'),
    component: ImportExportSection,
  },
  {
    key: 'privacy',
    icon: 'bi bi-eye-slash',
    label: t('settings.tabs.privacy'),
    component: PrivacySection,
  },
]);

const activeTab = ref('profile');

const activeTabConfig = computed(
  () => tabs.value.find((tab) => tab.key === activeTab.value) ?? tabs.value[0],
);
</script>

<template>
  <div class="flex min-h-[calc(100dvh-8rem)] w-full flex-1 flex-col gap-8">
    <div class="-mx-4 -mt-6 sm:-mx-6 md:hidden">
      <Tabs v-model:value="activeTab" class="settings-mobile-tabs">
        <TabList class="settings-mobile-tablist">
          <Tab v-for="tab in tabs" :key="tab.key" :value="tab.key" class="shrink-0">
            <span class="flex items-center gap-2 whitespace-nowrap text-sm">
              <i :class="tab.icon" aria-hidden="true" />
              <span>{{ tab.label }}</span>
            </span>
          </Tab>
        </TabList>

        <TabPanels class="settings-mobile-panels">
          <TabPanel v-for="tab in tabs" :key="tab.key" :value="tab.key">
            <div class="rounded-xl border border-border bg-surface p-4">
              <h2 class="m-0 mb-5 text-lg font-semibold text-text">
                {{ tab.label }}
              </h2>

              <component :is="tab.component" />
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <div class="hidden gap-10 md:flex">
      <!-- Sidebar navigation -->
      <nav class="flex w-56 shrink-0 flex-col gap-1" aria-label="Settings navigation">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex cursor-pointer items-center gap-3 rounded-lg border-none px-3 py-2.5 text-left text-sm font-medium transition-colors"
          :class="
            activeTab === tab.key
              ? 'bg-primary text-primary-contrast'
              : 'bg-transparent text-text hover:bg-surface-alt'
          "
          @click="activeTab = tab.key"
        >
          <i :class="tab.icon" aria-hidden="true" />
          {{ tab.label }}
        </button>
      </nav>

      <!-- Active section content -->
      <div class="min-w-0 flex-1">
        <div class="rounded-xl border border-border bg-surface p-6">
          <h2 class="m-0 mb-6 text-lg font-semibold text-text">
            {{ activeTabConfig.label }}
          </h2>

          <component :is="activeTabConfig.component" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-mobile-tabs :deep(.p-tablist) {
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
}

.settings-mobile-tabs :deep(.p-tablist-tab-list) {
  overflow-x: auto;
  padding-inline: 1rem;
  background: transparent;
}

.settings-mobile-tabs :deep(.p-tabpanels) {
  background: transparent;
  padding: 1.5rem 1rem 0;
}
</style>
