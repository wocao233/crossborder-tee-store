'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/src/providers/CurrencyProvider';

interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  amount: number;
  currency: string;
  estimated_days: number;
  attributes: string[];
  description: string;
}

interface TariffEstimate {
  country: string;
  value: number;
  currency: string;
  total_tariff: number;
  total_with_tariff: number;
  is_duty_free: boolean;
  notes: string;
  formatted: {
    total_tariff: string;
    total_with_tariff: string;
  };
}

interface ShippingCalculatorProps {
  subtotal: number;
  onShippingSelect: (rate: ShippingRate) => void;
  onTariffUpdate: (tariff: number) => void;
  selectedRate?: ShippingRate;
}

export default function ShippingCalculator({
  subtotal,
  onShippingSelect,
  onTariffUpdate,
  selectedRate,
}: ShippingCalculatorProps) {
  const t = useTranslations('checkout');
  const { formatPrice, currency } = useCurrency();
  
  const [address, setAddress] = useState<ShippingAddress>({
    name: '',
    street1: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });
  
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [tariff, setTariff] = useState<TariffEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // 国家选项
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CN', name: 'China' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' },
    { code: 'MX', name: 'Mexico' },
    { code: 'BR', name: 'Brazil' },
  ];

  // 计算运费
  const calculateShipping = async () => {
    if (!address.country || !address.zip) {
      setError('Please enter country and postal code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 获取运费报价
      const shippingResponse = await fetch('/api/shipping-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toAddress: address,
          currency: currency.toLowerCase(),
        }),
      });

      const shippingData = await shippingResponse.json();

      if (!shippingData.success) {
        throw new Error(shippingData.error || 'Failed to get shipping rates');
      }

      setRates(shippingData.rates);
      setExpanded(true);

      // 获取关税估算
      const tariffResponse = await fetch('/api/estimate-tariff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: address.country,
          value: subtotal,
          currency: currency,
          category: 'clothing',
        }),
      });

      const tariffData = await tariffResponse.json();

      if (tariffData.success) {
        setTariff(tariffData.estimate);
        onTariffUpdate(tariffData.estimate.total_tariff);
      }

    } catch (error) {
      console.error('Error calculating shipping:', error);
      setError(error instanceof Error ? error.message : 'Failed to calculate shipping');
    } finally {
      setIsLoading(false);
    }
  };

  // 选择运费
  const handleSelectRate = (rate: ShippingRate) => {
    onShippingSelect(rate);
  };

  // 处理地址变更
  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setAddress(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4">{t('shipping')}</h2>
      
      {/* 地址表单 */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('full_name')} *
            </label>
            <input
              type="text"
              value={address.name}
              onChange={(e) => handleAddressChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('full_name_placeholder')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('country')} *
            </label>
            <select
              value={address.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t('address')} *
          </label>
          <input
            type="text"
            value={address.street1}
            onChange={(e) => handleAddressChange('street1', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('city')} *
            </label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="New York"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('state')} *
            </label>
            <input
              type="text"
              value={address.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="NY"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('postal_code')} *
            </label>
            <input
              type="text"
              value={address.zip}
              onChange={(e) => handleAddressChange('zip', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="10001"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('phone')}
            </label>
            <input
              type="tel"
              value={address.phone || ''}
              onChange={(e) => handleAddressChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('email')}
            </label>
            <input
              type="email"
              value={address.email || ''}
              onChange={(e) => handleAddressChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="your@email.com"
            />
          </div>
        </div>
      </div>

      {/* 计算按钮 */}
      <button
        onClick={calculateShipping}
        disabled={isLoading || !address.country || !address.zip}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
      >
        {isLoading ? t('calculating') : t('calculate_shipping')}
      </button>

      {/* 错误显示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 运费选项 */}
      {expanded && rates.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3">{t('shipping_options')}</h3>
          <div className="space-y-3">
            {rates.map((rate) => (
              <div
                key={rate.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedRate?.id === rate.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleSelectRate(rate)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{rate.carrier}</div>
                    <div className="text-sm text-gray-600">{rate.description}</div>
                    <div className="text-sm text-gray-500">
                      {t('estimated_delivery')}: {rate.estimated_days} {t('days')}
                    </div>
                  </div>
                  <div className="font-bold">
                    {formatPrice(rate.amount)}
                  </div>
                </div>
                {rate.attributes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rate.attributes.map((attr, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 关税信息 */}
      {tariff && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-md font-semibold mb-2">{t('tariff_estimate')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('order_value')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('estimated_tariff')}</span>
              <span>{tariff.formatted.total_tariff}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>{t('total_with_tariff')}</span>
              <span>{tariff.formatted.total_with_tariff}</span>
            </div>
            {tariff.is_duty_free && (
              <div className="text-sm text-green-600 mt-2">
                ✅ {t('duty_free_message')}
              </div>
            )}
            <div className="text-sm text-gray-500 mt-2">
              {tariff.notes}
            </div>
          </div>
        </div>
      )}

      {/* 说明 */}
      <div className="text-sm text-gray-500 mt-4">
        <p className="mb-1">• {t('shipping_note_1')}</p>
        <p className="mb-1">• {t('shipping_note_2')}</p>
        <p>• {t('shipping_note_3')}</p>
      </div>
    </div>
  );
}