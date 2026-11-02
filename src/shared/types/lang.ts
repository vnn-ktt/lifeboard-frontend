export const Lang = {
  ru: 'ru',
  en: 'en',
} as const;

export type Lang = (typeof Lang)[keyof typeof Lang];
