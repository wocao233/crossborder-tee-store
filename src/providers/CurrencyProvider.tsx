'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 支持的货币
export type Currency = 'USD' | 'CNY' | 'EUR' | 'GBP' | 'JPY';

// 汇率数据
interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  updatedAt: Date;
}

// 上下文类型
interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: ExchangeRate[];
  convertPrice: (priceUSD: number, targetCurrency?: Currency) => number;
  formatPrice: (priceUSD: number, targetCurrency?: Currency) => string;
  isLoading: boolean;
}

// 创建上下文
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// 默认汇率（模拟数据，实际应从API获取）
const defaultExchangeRates: ExchangeRate[] = [
  { from: 'USD', to: 'CNY', rate: 7.2, updatedAt: new Date() },
  { from: 'USD', to: 'EUR', rate: 0.92, updatedAt: new Date() },
  { from: 'USD', to: 'GBP', rate: 0.79, updatedAt: new Date() },
  { from: 'USD', to: 'JPY', rate: 150, updatedAt: new Date() },
  { from: 'CNY', to: 'USD', rate: 0.14, updatedAt: new Date() },
  { from: 'EUR', to: 'USD', rate: 1.09, updatedAt: new Date() },
  { from: 'GBP', to: 'USD', rate: 1.27, updatedAt: new Date() },
  { from: 'JPY', to: 'USD', rate: 0.0067, updatedAt: new Date() },
];

// 货币符号
const currencySymbols: Record<Currency, string> = {
  USD: '$',
  CNY: '¥',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

// 货币名称
const currencyNames: Record<Currency, string> = {
  USD: 'US Dollar',
  CNY: 'Chinese Yuan',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  // 从localStorage获取保存的货币偏好
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred-currency');
      if (saved && Object.keys(currencySymbols).includes(saved)) {
        return saved as Currency;
      }
    }
    return 'USD'; // 默认货币
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(defaultExchangeRates);
  const [isLoading, setIsLoading] = useState(false);

  // 保存货币偏好到localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-currency', currency);
    }
  }, [currency]);

  // 获取实时汇率（模拟）
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setIsLoading(true);
      try {
        // 这里应该调用真实的汇率API
        // 例如：https://api.exchangerate-api.com/v4/latest/USD
        // 暂时使用模拟数据
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模拟API响应
        const mockRates = [
          { from: 'USD', to: 'CNY', rate: 7.18 + Math.random() * 0.1, updatedAt: new Date() },
          { from: 'USD', to: 'EUR', rate: 0.91 + Math.random() * 0.02, updatedAt: new Date() },
          { from: 'USD', to: 'GBP', rate: 0.78 + Math.random() * 0.02, updatedAt: new Date() },
          { from: 'USD', to: 'JPY', rate: 149 + Math.random() * 2, updatedAt: new Date() },
        ];
        
        setExchangeRates(prev => [
          ...prev.filter(rate => !mockRates.some(mr => mr.from === rate.from && mr.to === rate.to)),
          ...mockRates,
        ]);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // 初始获取
    fetchExchangeRates();
    
    // 每5分钟更新一次汇率
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // 价格转换函数
  const convertPrice = (priceUSD: number, targetCurrency?: Currency): number => {
    const target = targetCurrency || currency;
    
    if (target === 'USD') {
      return priceUSD;
    }
    
    const rate = exchangeRates.find(
      r => r.from === 'USD' && r.to === target
    );
    
    if (!rate) {
      console.warn(`Exchange rate not found for USD to ${target}`);
      return priceUSD;
    }
    
    return priceUSD * rate.rate;
  };

  // 价格格式化函数
  const formatPrice = (priceUSD: number, targetCurrency?: Currency): string => {
    const target = targetCurrency || currency;
    const convertedPrice = convertPrice(priceUSD, target);
    const symbol = currencySymbols[target];
    
    // 根据货币进行四舍五入
    let formattedPrice: string;
    switch (target) {
      case 'JPY':
        formattedPrice = Math.round(convertedPrice).toString();
        break;
      case 'CNY':
      case 'USD':
      case 'EUR':
      case 'GBP':
      default:
        formattedPrice = convertedPrice.toFixed(2);
        break;
    }
    
    // 添加货币符号
    if (target === 'CNY' || target === 'JPY') {
      return `${symbol}${formattedPrice}`;
    } else {
      return `${symbol}${formattedPrice}`;
    }
  };

  // 上下文值
  const contextValue: CurrencyContextType = {
    currency,
    setCurrency,
    exchangeRates,
    convertPrice,
    formatPrice,
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

// 自定义hook
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// 货币工具函数
export const currencyUtils = {
  getCurrencySymbol: (currency: Currency): string => currencySymbols[currency],
  getCurrencyName: (currency: Currency): string => currencyNames[currency],
  getAllCurrencies: (): Currency[] => Object.keys(currencySymbols) as Currency[],
  isValidCurrency: (currency: string): currency is Currency => 
    Object.keys(currencySymbols).includes(currency),
};