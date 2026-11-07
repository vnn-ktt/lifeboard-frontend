<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useAuthStore } from '@/shared/stores/useAuthStore';
const auth = useAuthStore();
const router = useRouter();
const email = ref('');
const error = ref('');
function submit() { try { auth.loginLocal(email.value); void router.push('/dashboard'); } catch(e) { error.value = e instanceof Error ? e.message : String(e); } }
</script>
<template>
  <main class="budgee-auth"><form class="budgee-auth-card" @submit.prevent="submit">
    <h1>Budgee</h1><p>Вход в финансовый дневник</p>
    <label for="budgee-login-email">Email *</label><InputText id="budgee-login-email" v-model="email" type="email" autocomplete="email" required />
    <p v-if="error" role="alert">{{ error }}</p><Button type="submit" label="Войти" />
    <RouterLink to="/register">Создать профиль</RouterLink>
  </form></main>
</template>
