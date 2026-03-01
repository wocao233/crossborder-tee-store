'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { locales, localeMetadata } from '@/src/i18n/locales';

interface LanguageSwitcherProps {
  currentLocale: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLocale }) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('language');
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (locale: string) => {
    // 获取当前路径（去掉当前语言前缀）
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
    
    // 构建新路径
    const newPath = `/${locale}${pathWithoutLocale}`;
    
    // 导航到新路径
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span>{localeMetadata[currentLocale as keyof typeof localeMetadata]?.flag || '🌐'}</span>
        <span className="hidden md:inline">
          {t(currentLocale === 'en' ? 'english' : 'chinese')}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 语言选择菜单 */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('select_language')}
              </div>
              
              {locales.map((locale) => {
                const metadata = localeMetadata[locale];
                const isCurrent = locale === currentLocale;
                
                return (
                  <button
                    key={locale}
                    onClick={() => switchLanguage(locale)}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                      isCurrent ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    <span className="mr-3">{metadata.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{metadata.nativeName}</div>
                      <div className="text-xs text-gray-500">{metadata.name}</div>
                    </div>
                    {isCurrent && (
                      <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;