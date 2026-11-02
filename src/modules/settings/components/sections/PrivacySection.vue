<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { RouteName } from '@/shared/constants/route-name';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/shared/stores/useAuthStore';

const { t } = useI18n();
const confirm = useConfirm();

const hideBalances = ref(false);

const router = useRouter();
const authStore = useAuthStore();

function confirmDeleteAccount() {
  confirm.require({
    message: t('settings.privacy.deleteConfirmMessage'),
    header: t('settings.privacy.deleteConfirmHeader'),
    icon: 'bi bi-exclamation-triangle',
    rejectLabel: t('settings.privacy.cancel'),
    acceptLabel: t('settings.privacy.deleteConfirm'),
    acceptClass: 'p-button-danger',
    accept: () => {
      // Will be implemented
    },
  });
}
function handleLogout(): void {
  authStore.logout();
  router.push({ name: RouteName.HOME });
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Privacy mode -->
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <span class="text-sm font-medium text-text">{{ t('settings.privacy.hideBalances') }}</span>
        <span class="text-xs text-text-muted">{{ t('settings.privacy.hideBalancesHint') }}</span>
      </div>
      <ToggleSwitch v-model="hideBalances" />
    </div>

    <hr class="border-border" />

    <!-- Delete account -->
    <section class="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
      <h3 class="m-0 text-sm font-semibold text-red-700 dark:text-red-400">
        {{ t('settings.privacy.deleteAccountTitle') }}
      </h3>
      <p class="m-0 text-xs text-red-600 dark:text-red-400">
        {{ t('settings.privacy.deleteAccountHint') }}
      </p>
      <Button
        :label="t('settings.privacy.deleteAccountButton')"
        icon="bi bi-trash"
        severity="danger"
        size="small"
        class="w-fit"
        @click="confirmDeleteAccount"
      />
    </section>
    <Button
      :label="t('layout.header.logout')"
      icon="bi bi-box-arrow-right"
      severity="secondary"
      class="w-full sm:w-auto"
      @click="handleLogout"
    />

    <ConfirmDialog />
  </div>
</template>
