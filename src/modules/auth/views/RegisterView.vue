<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useAuthStore } from '@/shared/stores/useAuthStore';
const auth = useAuthStore(); const router = useRouter();
const name = ref(''), email = ref(''), error = ref('');
function submit() { try { auth.createProfile({ name:name.value, email:email.value }); void router.push('/dashboard'); } catch(e) { error.value = e instanceof Error ? e.message : String(e); } }
</script>
<template>
  <main class="budgee-auth"><form class="budgee-auth-card" @submit.prevent="submit">
    <h1>Budgee</h1><p>Локальный финансовый профиль (без сервера)</p>
    <label for="budgee-register-name">Имя *</label><InputText id="budgee-register-name" v-model="name" autocomplete="name" required minlength="2" maxlength="60" />
    <label for="budgee-register-email">Email *</label><InputText id="budgee-register-email" v-model="email" type="email" autocomplete="email" required />
    <p v-if="error" role="alert">{{ error }}</p><Button type="submit" label="Создать профиль" />
    <RouterLink to="/login">Уже есть профиль</RouterLink>
  </form></main>
</template>
