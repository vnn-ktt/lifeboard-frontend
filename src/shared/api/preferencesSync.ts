import { watch, type WatchStopHandle } from 'vue';
import type { Pinia } from 'pinia';
import { api } from '@/shared/api/client';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { useSettingsStore } from '@/shared/stores/useSettingsStore';
import { useThemeStore } from '@/shared/stores/useThemeStore';
import { usePrivacyStore } from '@/shared/stores/usePrivacyStore';
import { useUiPreferencesStore } from '@/shared/stores/useUiPreferencesStore';
import type { Theme } from '@/shared/stores/useThemeStore';
import type { Lang } from '@/shared/types/lang';

type Preferences = {
  theme: 'default' | 'dark' | 'orange';
  language: Lang;
  goalEntryMode: 'wizard' | 'quick';
  showHelper: boolean;
  privacy: { showAvatar: boolean; maskStats: boolean };
};

let currentUser: string | null = null;
let stop: WatchStopHandle[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let revision = 0;

/** Initialize from the account and persist subsequent appearance/privacy changes. */
export async function loadPreferences(pinia: Pinia, userId: string): Promise<void> {
  if (currentUser === userId) return;
  resetPreferences();
  const settings = useSettingsStore(pinia);
  const theme = useThemeStore(pinia);
  const ui = useUiPreferencesStore(pinia);
  const privacy = usePrivacyStore(pinia);
  const auth = useAuthStore(pinia);
  const response = await api.get<Preferences>('/users/me/preferences');

  theme.setTheme((response.theme === 'default' ? 'forest' : response.theme) as Theme);
  settings.setLanguage(response.language);
  if (auth.profile?.timezone) settings.setTimezone(auth.profile.timezone);
  ui.setGoalEntryMode(response.goalEntryMode);
  ui.setShowJakk(response.showHelper);
  privacy.showAvatar = response.privacy.showAvatar;
  privacy.maskStats = response.privacy.maskStats;
  currentUser = userId;

  const persist = () => {
    if (timer) clearTimeout(timer);
    const generation = ++revision;
    timer = setTimeout(() => {
      if (generation !== revision || currentUser !== userId) return;
      void api.put<Preferences>('/users/me/preferences', {
        theme: theme.theme === 'forest' ? 'default' : theme.theme,
        language: settings.currentLang,
        goalEntryMode: ui.goalEntryMode,
        showHelper: ui.showJakk,
        privacy: { showAvatar: privacy.showAvatar, maskStats: privacy.maskStats },
      }).catch(error => {
        window.dispatchEvent(new CustomEvent('lifeboard:sync-error', {
          detail: error instanceof Error ? error.message : String(error),
        }));
      });
    }, 350);
  };

  stop.push(watch(
    () => [theme.theme, settings.currentLang, ui.goalEntryMode, ui.showJakk, privacy.showAvatar, privacy.maskStats],
    persist,
  ));
  stop.push(watch(() => settings.timezone, tz => {
    if (!tz || currentUser !== userId) return;
    void api.patch('/users/me/timezone', { timezone: tz }).catch(error => {
      window.dispatchEvent(new CustomEvent('lifeboard:sync-error', {
        detail: error instanceof Error ? error.message : String(error),
      }));
    });
  }));
}

export function resetPreferences(): void {
  stop.forEach(dispose => dispose());
  stop = [];
  currentUser = null;
  revision++;
  if (timer) clearTimeout(timer);
}
