<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import AuthField from '@/shared/components/Auth/AuthField.vue';
import UserAvatar from '@/shared/components/User/UserAvatar.vue';

const auth = useAuthStore();
const form = reactive({ name: auth.profile?.name ?? '', email: auth.profile?.email ?? '', about: auth.profile?.about ?? '' });
const status = ref('');
const error = ref('');
watch(() => auth.profile, (profile) => {
  if (profile) Object.assign(form, { name: profile.name, email: profile.email, about: profile.about });
});
function save() {
  error.value = ''; status.value = '';
  try { auth.updateProfile(form); status.value = 'Изменения сохранены в этом браузере.'; }
  catch (e) { error.value = e instanceof Error ? e.message : 'Не удалось сохранить профиль.'; }
}
</script>

<template>
  <div class="lb-screen lb-profile-screen">
    <div class="lb-page-top"><div><p class="lb-overline">МОЁ ПРОСТРАНСТВО</p><h1>Личный кабинет</h1><p class="lb-muted">Основная информация о тебе и текущем профиле.</p></div></div>
    <section class="lb-panel lb-profile-head"><UserAvatar :name="auth.profile?.name" size="lg" /><div><h2>{{ auth.profile?.name }}</h2><p>{{ auth.profile?.email }}</p><span>Локальный профиль</span></div></section>
    <section class="lb-panel lb-profile-card"><div class="lb-panel-heading"><div><p class="lb-overline">НАСТРОЙКИ ПРОФИЛЯ</p><h3>О себе</h3></div></div>
      <form class="lb-profile-form" @submit.prevent="save">
        <AuthField id="profile-name" v-model="form.name" label="Имя" autocomplete="name" required :maxlength="60" />
        <AuthField id="profile-email" v-model="form.email" label="Email" type="email" autocomplete="email" required :maxlength="254" />
        <div class="lb-auth-field lb-profile-wide"><label for="profile-about">Немного о себе</label><textarea id="profile-about" v-model="form.about" class="lb-input lb-textarea" maxlength="400" rows="4" placeholder="Кто ты и что для тебя важно" /><small>{{ form.about.length }} / 400</small></div>
        <p v-if="error" class="lb-auth-error" role="alert">{{ error }}</p><p v-if="status" class="lb-profile-success" role="status">{{ status }}</p>
        <button type="submit" class="lb-button lb-button-primary lb-profile-save"><i class="bi bi-check2" /> Сохранить изменения</button>
      </form>
    </section>
    <section class="lb-profile-info" role="note"><i class="bi bi-shield-exclamation" aria-hidden="true" /><div><strong>Пока это локальный кабинет</strong><p>Регистрации на сервере, пароля, разделения данных между пользователями и синхронизации нет. Вход лишь переключает отображение этого браузера. Без HTTPS и API не храни здесь конфиденциальную информацию.</p></div></section>
  </div>
</template>
