/**
 * Every language this app has a message file for
 * (`src/i18n/messages/{code}.ts`). Only the codes in `locales` are served.
 */
export const availableLocales = [
  'en',
  'hi',
  'es',
  'fr',
  'de',
  'ja',
  'zh',
  'ar',
] as const;
export type AvailableLocale = (typeof availableLocales)[number];

// The languages the store serves. English only for now: the other message
// files still hold the starter's demo copy. To bring a language back,
// translate its file, then add its code here (see DEPLOY_CLOUDFLARE.md).
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// Display names for language switcher
export const localeNames: Record<AvailableLocale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
  ar: 'العربية',
};

// OpenGraph locale format (for social sharing metadata)
export const ogLocales: Record<AvailableLocale, string> = {
  en: 'en_US',
  hi: 'hi_IN',
  es: 'es_ES',
  fr: 'fr_FR',
  de: 'de_DE',
  ja: 'ja_JP',
  zh: 'zh_CN',
  ar: 'ar_SA',
};

// RTL languages
export const rtlLocales: AvailableLocale[] = ['ar'];

export function isRtlLocale(locale: AvailableLocale): boolean {
  return rtlLocales.includes(locale);
}

// Get OpenGraph locale format
export function getOgLocale(locale: AvailableLocale): string {
  return ogLocales[locale] || 'en_US';
}

// Get alternate OpenGraph locales (for og:locale:alternate): served ones only.
export function getAlternateOgLocales(currentLocale: Locale): string[] {
  return locales.filter((l) => l !== currentLocale).map((l) => ogLocales[l]);
}
