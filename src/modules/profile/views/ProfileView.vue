<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useLifeStore } from '@/modules/lifeboard/stores/useLifeStore';
import { usePrivacyStore } from '@/shared/stores/usePrivacyStore';
import { useLifeI18n } from '@/modules/lifeboard/i18n';
import AuthField from '@/shared/components/Auth/AuthField.vue';
import UserAvatar from '@/shared/components/User/UserAvatar.vue';
const auth=useAuthStore(), life=useLifeStore(), privacy=usePrivacyStore();
const { t } = useLifeI18n();
const form=reactive({name:auth.profile?.name??'',email:auth.profile?.email??'',about:auth.profile?.about??''});
const status=ref(''), error=ref('');
const photoInput=ref<HTMLInputElement|null>(null), backupInput=ref<HTMLInputElement|null>(null);
watch(()=>auth.profile,profile=>{if(profile)Object.assign(form,{name:profile.name,email:profile.email,about:profile.about});});
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
function exportData(){
  const blob=new Blob([life.exportState()],{type:'application/json'}),url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');anchor.href=url;anchor.download=`lifeboard-backup-${new Date().toISOString().slice(0,10)}.json`;
  anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importData(event:Event){
  const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file)return;input.value='';
  if(file.size>5_000_000){error.value='Backup exceeds 5 MB';return;}
  if(!confirm('Replace existing goals and reports with this backup?'))return;
  try{status.value=life.importState(await file.text())?t('saved'):'Invalid Lifeboard backup';}
  catch{error.value='Could not read the backup';}
}
function clearData(){
  if(confirm('Delete local goals, checkmarks, categories and reviews? Export a backup first.')){
    life.resetState();status.value=t('done');
  }
}
</script>
<template>
  <div class="lb-screen lb-profile-screen">
    <div class="lb-page-top"><div><p class="lb-overline">{{ t('account') }}</p><h1>{{ t('profileTitle') }}</h1><p class="lb-muted">{{ t('profileSub') }}</p></div></div>
    <section class="lb-panel lb-profile-head"><UserAvatar :name="auth.profile?.name" size="lg" /><div><h2>{{ auth.profile?.name }}</h2><p>{{ auth.profile?.email }}</p><span>{{ t('localProfile') }}</span></div></section>
    <section class="lb-panel lb-profile-card"><div class="lb-panel-heading"><div><p class="lb-overline">{{ t('about') }}</p><h3>{{ t('about') }}</h3></div></div>
      <form class="lb-profile-form" @submit.prevent="save">
        <AuthField id="profile-name" v-model="form.name" :label="t('name')" autocomplete="name" required :maxlength="60" />
        <AuthField id="profile-email" v-model="form.email" :label="t('email')" type="email" autocomplete="email" required :maxlength="254" />
        <div class="lb-auth-field lb-profile-wide"><label for="profile-about">{{ t('bio') }}</label><textarea id="profile-about" v-model="form.about" class="lb-input lb-textarea" maxlength="400" rows="3" /><small>{{ form.about.length }} / 400</small></div>
        <button type="submit" class="lb-button lb-button-primary lb-profile-save"><i class="bi bi-check2" /> {{ t('saveProfile') }}</button>
      </form>
    </section>
    <section class="lb-panel"><div class="lb-panel-heading"><div><p class="lb-overline">{{ t('photo') }}</p><h3>{{ t('photo') }}</h3></div></div>
      <div class="lb-profile-photo-row"><UserAvatar :name="auth.profile?.name" size="lg" /><div><div class="lb-inline-actions"><button class="lb-button lb-button-outline" type="button" @click="photoInput?.click()"><i class="bi bi-camera" />{{ t('uploadPhoto') }}</button><button v-if="auth.profile?.avatar" type="button" class="lb-button lb-button-outline" @click="auth.setAvatar(undefined)">{{ t('removePhoto') }}</button></div><p class="lb-muted">{{ t('photoInfo') }}</p></div></div>
      <input ref="photoInput" hidden type="file" accept="image/jpeg,image/png,image/webp" @change="uploadPhoto" />
    </section>
    <section class="lb-panel"><div class="lb-panel-heading"><div><p class="lb-overline">OAuth</p><h3>{{ t('connected') }}</h3></div></div>
      <p class="lb-muted">{{ t('comingSoon') }} — {{ t('privacyNote') }}</p>
      <div class="lb-social-providers"><div class="lb-provider"><i class="bi bi-google" /><strong>Google</strong><span>{{ t('connectSoon') }}</span><button class="lb-button lb-button-outline" disabled>{{ t('connectSoon') }}</button></div><div class="lb-provider"><i class="bi bi-github" /><strong>GitHub</strong><span>{{ t('connectSoon') }}</span><button class="lb-button lb-button-outline" disabled>{{ t('connectSoon') }}</button></div></div>
    </section>
    <section class="lb-panel"><div class="lb-panel-heading"><div><p class="lb-overline">{{ t('privacy') }}</p><h3>{{ t('privacy') }}</h3></div></div>
      <label class="lb-privacy-row"><span><strong>{{ t('showAvatar') }}</strong><small>{{ t('showAvatarSub') }}</small></span><input v-model="privacy.showAvatar" type="checkbox" role="switch" /></label>
      <label class="lb-privacy-row"><span><strong>{{ t('maskStats') }}</strong><small>{{ t('maskStatsSub') }}</small></span><input v-model="privacy.maskStats" type="checkbox" role="switch" /></label>
      <p class="lb-muted lb-privacy-note"><i class="bi bi-info-circle" /> {{ t('privacyNote') }}</p>
    </section>
    <section class="lb-panel lb-backup"><div class="lb-panel-heading"><div><p class="lb-overline">{{ t('backups') }}</p><h3>{{ t('backups') }}</h3></div></div><p class="lb-muted">{{ t('backupSub') }}</p>
      <div class="lb-backup-buttons"><button type="button" class="lb-button lb-button-outline" @click="exportData"><i class="bi bi-download" /> {{ t('export') }}</button><button type="button" class="lb-button lb-button-outline" @click="backupInput?.click()"><i class="bi bi-upload" /> {{ t('import') }}</button><input ref="backupInput" hidden type="file" accept=".json,application/json" @change="importData" /></div>
      <button type="button" class="lb-button lb-destructive" @click="clearData"><i class="bi bi-trash3" /> {{ t('deleteData') }}</button>
    </section>
    <p v-if="error" role="alert" class="lb-auth-error">{{ error }}</p><p v-if="status" role="status" class="lb-profile-success">{{ status }}</p>
  </div>
</template>
