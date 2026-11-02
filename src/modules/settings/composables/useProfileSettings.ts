import { ref, computed } from 'vue';

export function useProfileSettings() {
  const displayName = ref('');
  const avatarPreview = ref<string | null>(null);
  const avatarFile = ref<File | null>(null);
  const isSaving = ref(false);
  const isUploading = ref(false);

  const canSave = computed(() => displayName.value.trim().length > 0);

  function handleAvatarUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    avatarFile.value = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    avatarPreview.value = null;
    avatarFile.value = null;
  }

  async function saveProfile(): Promise<boolean> {
    if (!canSave.value) return false;

    isSaving.value = true;

    // Simulate API call — will be replaced with real Supabase/API integration
    await new Promise((resolve) => { setTimeout(resolve, 600); });

    isSaving.value = false;
    return true;
  }

  return {
    displayName,
    avatarPreview,
    avatarFile,
    isSaving,
    isUploading,
    canSave,
    handleAvatarUpload,
    removeAvatar,
    saveProfile,
  };
}
