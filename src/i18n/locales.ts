export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// 语言元数据
export const localeMetadata = {
  en: {
    name: 'English',
    nativeName: 'English',
    direction: 'ltr' as const,
    currency: 'USD',
    country: 'US',
    flag: '🇺🇸'
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    direction: 'ltr' as const,
    currency: 'CNY',
    country: 'CN',
    flag: '🇨🇳'
  }
} as const;

// 验证语言
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 获取语言显示名称
export function getLocaleName(locale: Locale): string {
  return localeMetadata[locale].name;
}

// 获取本地化名称
export function getLocaleNativeName(locale: Locale): string {
  return localeMetadata[locale].nativeName;
}

// 获取货币代码
export function getLocaleCurrency(locale: Locale): string {
  return localeMetadata[locale].currency;
}