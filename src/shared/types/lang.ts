export const Lang = { ru: 'ru', en: 'en', de: 'de' } as const;
export type Lang = (typeof Lang)[keyof typeof Lang];
