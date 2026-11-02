<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import UserAvatar from './UserAvatar.vue';

const store = useAuthStore();
const router = useRouter();
const opened = ref(false);
const root = ref<HTMLElement | null>(null);
const userName = computed(() => store.profile?.name ?? 'Мой профиль');
function outside(event: PointerEvent) { if (opened.value && !root.value?.contains(event.target as Node)) opened.value = false; }
function escape(event: KeyboardEvent) { if (event.key === 'Escape') opened.value = false; }
function logout() { opened.value = false; store.logout(); void router.replace({ path: '/login' }); }
onMounted(() => { document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape); });
onBeforeUnmount(() => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); });
</script>

<template>
  <div ref="root" class="lb-user-menu">
    <button class="lb-user-trigger" type="button" aria-label="Меню пользователя" aria-haspopup="menu" :aria-expanded="opened" @click="opened = !opened"><UserAvatar :name="userName" /><i class="bi bi-chevron-down" aria-hidden="true" /></button>
    <div v-if="opened" class="lb-user-popover" role="menu">
      <div class="lb-user-summary"><strong>{{ userName }}</strong><small>{{ store.profile?.email }}</small></div>
      <RouterLink class="lb-user-action" to="/profile" role="menuitem" @click="opened = false"><i class="bi bi-person" /> Личный кабинет</RouterLink>
      <button class="lb-user-action lb-user-logout" role="menuitem" type="button" @click="logout"><i class="bi bi-box-arrow-right" /> Выйти</button>
    </div>
  </div>
</template>
