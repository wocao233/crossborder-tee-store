'use client';

import React, { useState } from 'react';
import { useCurrency, currencyUtils } from '@/src/providers/CurrencyProvider';
import { useTranslations } from 'next-intl';

const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency, exchangeRates, isLoading } = useCurrency();
  const t = useTranslations('currency');
  const [isOpen, setIsOpen] = useState(false);

  const allCurrencies = currencyUtils.getAllCurrencies();

  // 获取汇率显示文本
  const getExchangeRateText = (targetCurrency: string) => {
    if (targetCurrency === 'USD') return '';
    
    const rate = exchangeRates.find(
      r => r.from === 'USD' && r.to === targetCurrency
    );
    
    if (!rate) return '';
    
    return `1 USD = ${rate.rate.toFixed(2)} ${targetCurrency}`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <span className="font-medium">{currencyUtils.getCurrencySymbol(currency)}</span>
        <span className="hidden md:inline">{currency}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {isLoading && (
          <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 货币选择菜单 */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('select_currency')}
              </div>
              
              {allCurrencies.map((curr) => {
                const isCurrent = curr === currency;
                const rateText = getExchangeRateText(curr);
                
                return (
                  <button
                    key={curr}
                    onClick={() => {
                      setCurrency(curr);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col w-full px-4 py-3 text-sm text-left hover:bg-gray-50 ${
                      isCurrent ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-3 text-lg">{currencyUtils.getCurrencySymbol(curr)}</span>
                        <div className="text-left">
                          <div className="font-medium">{curr}</div>
                          <div className="text-xs text-gray-500">
                            {currencyUtils.getCurrencyName(curr)}
                          </div>
                        </div>
                      </div>
                      {isCurrent && (
                        <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    {rateText && (
                      <div className="mt-1 text-xs text-gray-500 text-left">
                        {rateText}
                      </div>
                    )}
                  </button>
                );
              })}
              
              {/* 汇率更新信息 */}
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {isLoading ? (
                    <span>Updating exchange rates...</span>
                  ) : (
                    <span>
                      Rates updated {exchangeRates[0]?.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySwitcher;