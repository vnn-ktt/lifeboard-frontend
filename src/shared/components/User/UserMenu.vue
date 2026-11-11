<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import UserAvatar from './UserAvatar.vue';
import { useLifeI18n } from '@/modules/lifeboard/i18n';

const store = useAuthStore();
const {t}=useLifeI18n();
const router = useRouter();
const opened = ref(false);
const root = ref<HTMLElement | null>(null);
const userName = computed(() => store.profile?.nickname?.trim() || store.profile?.name || t('account'));
const fullName = computed(() => store.profile?.name || '');
function outside(event: PointerEvent) { if (opened.value && !root.value?.contains(event.target as Node)) opened.value = false; }
function escape(event: KeyboardEvent) { if (event.key === 'Escape') opened.value = false; }
async function logout() {
  opened.value = false;
  try {
    await store.logout();
    await router.replace({ path: '/login' });
  } catch (error) {
    window.alert(error instanceof Error ? error.message : 'Не удалось выйти из аккаунта.');
  }
}
onMounted(() => { document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape); });
onBeforeUnmount(() => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); });
</script>

<template>
  <div ref="root" class="lb-user-menu">
    <button class="lb-user-trigger" type="button" :aria-label="`${t('account')}: ${userName}`" aria-haspopup="menu" :aria-expanded="opened" @click="opened = !opened"><UserAvatar :name="userName" /><span class="lb-user-trigger-name">{{ userName }}</span><i class="bi bi-chevron-down" aria-hidden="true" /></button>
    <div v-if="opened" class="lb-user-popover" role="menu">
      <div class="lb-user-summary"><strong>{{ userName }}</strong><small v-if="store.profile?.nickname">{{ fullName }}</small><small>{{ store.profile?.email }}</small></div>
      <RouterLink class="lb-user-action" to="/profile" role="menuitem" @click="opened = false"><i class="bi bi-person" /> {{ t('account') }}</RouterLink>
      <button class="lb-user-action lb-user-logout" role="menuitem" type="button" @click="logout"><i class="bi bi-box-arrow-right" /> {{ t('logout') }}</button>
    </div>
  </div>
</template>
