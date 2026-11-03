<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useLifeStore } from '@/modules/lifeboard/stores/useLifeStore';
import { usePrivacyStore } from '@/shared/stores/usePrivacyStore';
import { useLifeI18n } from '@/modules/lifeboard/i18n';
import { useUiPreferencesStore } from '@/shared/stores/useUiPreferencesStore';
import { useLifeBackup } from '@/modules/lifeboard/composables/useLifeBackup';
import AuthField from '@/shared/components/Auth/AuthField.vue';
import UserAvatar from '@/shared/components/User/UserAvatar.vue';
import { useThemeStore, type Theme } from '@/shared/stores/useThemeStore';
import type { Lang } from '@/shared/types/lang';
const auth=useAuthStore(), life=useLifeStore(), privacy=usePrivacyStore(), ui=useUiPreferencesStore(), backup=useLifeBackup();
const { t, lang, setLanguage } = useLifeI18n();
const themeStore = useThemeStore();
const interfaceCopy = {
  ru: { heading: 'Оформление и язык', nick: 'Никнейм', nickHelp: 'Показывается вместо ФИО в шапке. Можно оставить пустым.', theme: 'Тема', language: 'Язык', jakk: 'Показывать Jakk', jakkHelp: 'Плавающая кнопка чата во всех разделах. Можно отключить полностью.' },
  en: { heading: 'Appearance & language', nick: 'Nickname', nickHelp: 'Shown in the header instead of your full name. Optional.', theme: 'Theme', language: 'Language', jakk: 'Show Jakk', jakkHelp: 'Display the floating chat button on all pages.' },
  de: { heading: 'Darstellung und Sprache', nick: 'Nickname', nickHelp: 'Wird statt des vollen Namens im Header angezeigt. Optional.', theme: 'Design', language: 'Sprache', jakk: 'Jakk anzeigen', jakkHelp: 'Die schwebende Chat-Schaltfläche auf allen Seiten anzeigen.' },
} as const;
const label = computed(() => interfaceCopy[lang.value]);
const themes = computed<{ value: Theme; label: string; icon: string }[]>(() => [
  { value: 'forest', label: t('themeForest'), icon: 'bi bi-tree' },
  { value: 'dark', label: t('themeDark'), icon: 'bi bi-moon-stars' },
  { value: 'orange', label: t('themeOrange'), icon: 'bi bi-sunrise' },
]);
const languages: { value: Lang; label: string }[] = [
  { value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }, { value: 'de', label: 'Deutsch' },
];
const form=reactive({name:auth.profile?.name??'',nickname:auth.profile?.nickname??'',email:auth.profile?.email??'',about:auth.profile?.about??''});
const status=ref(''), error=ref('');
const photoInput=ref<HTMLInputElement|null>(null), backupInput=ref<HTMLInputElement|null>(null);
watch(()=>auth.profile,profile=>{if(profile)Object.assign(form,{name:profile.name,nickname:profile.nickname??'',email:profile.email,about:profile.about});});
function save(){error.value='';status.value='';try{auth.updateProfile(form);status.value=t('saved');}catch(e){error.value=e instanceof Error?e.message:String(e);}}
async function uploadPhoto(event:Event){
  const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;
  input.value=''; error.value='';
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3_000_000){error.value='JPG, PNG or WebP, max 3 MB';return;}
  try{
    const bitmap=await createImageBitmap(file);
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
    const side=Math.min(bitmap.width,bitmap.height),sx=(bitmap.width-side)/2,sy=(bitmap.height-side)/2;
    ctx.drawImage(bitmap,sx,sy,side,side,0,0,256,256);bitmap.close();
    auth.setAvatar(canvas.toDataURL('image/jpeg',.78));status.value=t('saved');
  }catch{error.value='Could not process this photo.';}
}
function exportData() { backup.downloadBackup(); }
async function importData(event:Event) {
  const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;input.value='';
  error.value=''; status.value='';
  if(!confirm('Заменить текущие цели, действия, заметки и группы данными из JSON?'))return;
  try { status.value=await backup.restoreBackup(file)?t('saved'):'Invalid Lifeboard backup'; }
  catch(e) { error.value=e instanceof Error?e.message:'Could not read backup'; }
}
function addExamples() {
  const result = life.addDemoContent();
  if (!result) { error.value = 'Не удалось сохранить примеры: проверь свободное место в браузере.'; return; }
  status.value = `${t('examplesAdded')}: ${result.goals} / ${result.notes}`;
}
function clearData(){
  if(confirm('Удалить все локальные цели, отметки, категории, заметки и фотографии в заметках? Сначала сделай резервную копию.')){
    life.resetState();status.value=t('done');
  }
}
</script>
<template>
  <div class="lb-screen lb-profile-screen">
    <div class="lb-page-top"><div><h1>{{ t('profileTitle') }}</h1><p class="lb-muted">{{ t('profileSub') }}</p></div></div>
    <section class="lb-panel lb-profile-head"><UserAvatar :name="auth.profile?.nickname || auth.profile?.name" size="lg" /><div><h2>{{ auth.profile?.nickname || auth.profile?.name }}</h2><p v-if="auth.profile?.nickname" class="lb-profile-fullname">{{ auth.profile?.name }}</p><p>{{ auth.profile?.email }}</p><span>{{ t('localProfile') }}</span></div></section>
    <section class="lb-panel lb-profile-card"><div class="lb-panel-heading"><div><h3>{{ t('about') }}</h3></div></div>
      <form class="lb-profile-form" @submit.prevent="save">
        <AuthField id="profile-name" v-model="form.name" :label="t('name')" autocomplete="name" required :maxlength="60" />
        <div class="lb-auth-field lb-profile-nickname"><label for="profile-nickname">{{ label.nick }}</label><input id="profile-nickname" v-model="form.nickname" class="lb-input" maxlength="24" autocomplete="nickname"/></div>
        <AuthField id="profile-email" v-model="form.email" :label="t('email')" type="email" autocomplete="email" required :maxlength="254" />
        <div class="lb-auth-field lb-profile-wide"><label for="profile-about">{{ t('bio') }}</label><textarea id="profile-about" v-model="form.about" class="lb-input lb-textarea" maxlength="400" rows="3" /><small>{{ form.about.length }} / 400</small></div>
        <button type="submit" class="lb-button lb-button-primary lb-profile-save"><i class="bi bi-check2" /> {{ t('saveProfile') }}</button>
      </form>
    </section>
    <section class="lb-panel"><div class="lb-panel-heading"><div><h3>{{ t('photo') }}</h3></div></div>
      <div class="lb-profile-photo-row"><UserAvatar :name="auth.profile?.name" size="lg" /><div><div class="lb-inline-actions"><button class="lb-button lb-button-outline" type="button" @click="photoInput?.click()"><i class="bi bi-camera" />{{ t('uploadPhoto') }}</button><button v-if="auth.profile?.avatar" type="button" class="lb-button lb-button-outline" @click="auth.setAvatar(undefined)">{{ t('removePhoto') }}</button></div><p class="lb-muted">{{ t('photoInfo') }}</p></div></div>
      <input ref="photoInput" hidden type="file" accept="image/jpeg,image/png,image/webp" @change="uploadPhoto" />
    </section>
    <section class="lb-panel"><div class="lb-panel-heading"><div><h3>{{ t('connected') }}</h3></div></div>
      <p class="lb-muted">{{ t('comingSoon') }} — {{ t('privacyNote') }}</p>
      <div class="lb-social-providers"><div class="lb-provider"><i class="bi bi-google" /><strong>Google</strong><span>{{ t('connectSoon') }}</span><button class="lb-button lb-button-outline" disabled>{{ t('connectSoon') }}</button></div><div class="lb-provider"><i class="bi bi-github" /><strong>GitHub</strong><span>{{ t('connectSoon') }}</span><button class="lb-button lb-button-outline" disabled>{{ t('connectSoon') }}</button></div></div>
    </section>
    <section class="lb-panel"><div class="lb-panel-heading"><div><h3>{{ t('privacy') }}</h3></div></div>
      <label class="lb-privacy-row"><span><strong>{{ t('showAvatar') }}</strong><small>{{ t('showAvatarSub') }}</small></span><input v-model="privacy.showAvatar" type="checkbox" role="switch" /></label>
      <label class="lb-privacy-row"><span><strong>{{ t('maskStats') }}</strong><small>{{ t('maskStatsSub') }}</small></span><input v-model="privacy.maskStats" type="checkbox" role="switch" /></label>
      <label class="lb-privacy-row"><span><strong>{{ label.jakk }}</strong><small>{{ label.jakkHelp }}</small></span><input v-model="ui.showJakk" type="checkbox" role="switch" /></label>
      <p class="lb-muted lb-privacy-note"><i class="bi bi-info-circle" /> {{ t('privacyNote') }}</p>
    </section>
    <section class="lb-panel lb-profile-appearance">
      <div class="lb-panel-heading"><h3>{{ label.heading }}</h3></div>
      <fieldset class="lb-appearance-fieldset">
        <legend>{{ label.theme }}</legend>
        <div class="lb-appearance-choices lb-appearance-choices--themes">
          <label v-for="option in themes" :key="option.value" :class="['lb-radio-card',{ 'is-active': themeStore.theme===option.value }]">
            <input type="radio" name="lifeboard-theme" :value="option.value" :checked="themeStore.theme === option.value" @change="themeStore.setTheme(option.value)" />
            <i :class="option.icon" aria-hidden="true" /><span>{{ option.label }}</span>
          </label>
        </div>
      </fieldset>
      <fieldset class="lb-appearance-fieldset">
        <legend>{{ label.language }}</legend>
        <div class="lb-appearance-choices">
          <label v-for="option in languages" :key="option.value" :class="['lb-radio-card',{ 'is-active': lang===option.value }]">
            <input type="radio" name="lifeboard-language" :value="option.value" :checked="lang===option.value" @change="setLanguage(option.value)" />
            <span>{{ option.label }}</span>
          </label>
        </div>
      </fieldset>
    </section>
    <section class="lb-panel lb-profile-preferences">
      <div class="lb-panel-heading"><div><h3>{{ t('goalModeTitle') }}</h3></div></div>
      <p class="lb-muted">{{ t('goalModeHelp') }}</p>
      <div class="lb-entry-mode-options" role="group" aria-label="Режим создания целей">
        <button type="button" :aria-pressed="ui.goalEntryMode === 'wizard'" :class="['lb-entry-mode',{'is-active':ui.goalEntryMode === 'wizard'}]" @click="ui.setGoalEntryMode('wizard')"><i class="bi bi-stars" /><span><strong>{{ t('goalModeWizard') }}</strong><small>{{ t('goalModeWizardHelp') }}</small></span></button>
        <button type="button" :aria-pressed="ui.goalEntryMode === 'quick'" :class="['lb-entry-mode',{'is-active':ui.goalEntryMode === 'quick'}]" @click="ui.setGoalEntryMode('quick')"><i class="bi bi-lightning-charge" /><span><strong>{{ t('goalModeQuick') }}</strong><small>{{ t('goalModeQuickHelp') }}</small></span></button>
      </div>
    </section>
    <section class="lb-panel lb-backup"><div class="lb-panel-heading"><div><h3>{{ t('backups') }}</h3></div></div><p class="lb-muted">{{ t('backupSub') }}</p>
      <div class="lb-backup-buttons"><button type="button" class="lb-button lb-button-outline" @click="exportData"><i class="bi bi-download" /> {{ t('export') }}</button><button type="button" class="lb-button lb-button-outline" @click="backupInput?.click()"><i class="bi bi-upload" /> {{ t('import') }}</button><input ref="backupInput" hidden type="file" accept=".json,application/json" @change="importData" /></div>
      <div class="lb-profile-example-row"><span>{{ t('examplesInfo') }}</span><button type="button" class="lb-button lb-button-outline" @click="addExamples"><i class="bi bi-stars" /> {{ t('examplesAdd') }}</button></div>
      <button type="button" class="lb-button lb-destructive" @click="clearData"><i class="bi bi-trash3" /> {{ t('deleteData') }}</button>
    </section>
    <p v-if="error" role="alert" class="lb-auth-error">{{ error }}</p><p v-if="status" role="status" class="lb-profile-success">{{ status }}</p>
  </div>
</template>
