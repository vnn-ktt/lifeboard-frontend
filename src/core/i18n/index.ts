import { createI18n } from 'vue-i18n';
import { en } from '@/core/i18n/locales/en';
import { ru } from '@/core/i18n/locales/ru';

export const DEFAULT_LOCALE = 'ru';

export const messages = {
  en,
  ru,
} as const;

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages,
});
