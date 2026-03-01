import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {locales} from './locales';

// 支持的语言
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

// 默认语言
export const defaultLocale: Locale = 'en';

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文'
};

// 语言方向
export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  zh: 'ltr'
};

// 货币配置
export const localeCurrencies: Record<Locale, string> = {
  en: 'USD',
  zh: 'CNY'
};

// 验证语言
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 获取请求配置
export default getRequestConfig(async ({locale}) => {
  // 验证语言
  if (!isValidLocale(locale)) notFound();

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'UTC',
    now: new Date(),
    locale,
    defaultTranslationValues: {
      globalString: '',
      important: (chunks) => <strong>{chunks}</strong>
    }
  };
});