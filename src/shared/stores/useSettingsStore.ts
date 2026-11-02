import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { i18n } from '@/core/i18n';
import type { Lang } from '@/shared/types';

export type NumberFormatStyle = 'dot' | 'comma';
export type DateFormatStyle = 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export const useSettingsStore = defineStore('settings', () => {
  // ─── Localization ──────────────────────────────────────
  const primaryCurrency = useStorage('settings:currency', 'USD');
  const numberFormat = useStorage<NumberFormatStyle>('settings:numberFormat', 'dot');
  const dateFormat = useStorage<DateFormatStyle>('settings:dateFormat', 'DD.MM.YYYY');
  const timezone = useStorage('settings:timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
  const currentLang = useStorage<Lang>('settings:lang', 'ru');

  // ─── Actions ───────────────────────────────────────────
  function setLanguage(lang: Lang) {
    currentLang.value = lang;
    i18n.global.locale.value = lang;
  }

  function toggleLanguage(): Lang {
    const next = currentLang.value === 'ru' ? 'en' : 'ru';
    setLanguage(next);
    return next;
  }

  function setCurrency(currency: string) {
    primaryCurrency.value = currency;
  }

  function setNumberFormat(format: NumberFormatStyle) {
    numberFormat.value = format;
  }

  function setDateFormat(format: DateFormatStyle) {
    dateFormat.value = format;
  }

  function setTimezone(tz: string) {
    timezone.value = tz;
  }

  return {
    // state
    primaryCurrency,
    numberFormat,
    dateFormat,
    timezone,
    currentLang,
    // actions
    setLanguage,
    toggleLanguage,
    setCurrency,
    setNumberFormat,
    setDateFormat,
    setTimezone,
  };
});
