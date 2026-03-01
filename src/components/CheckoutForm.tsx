'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';

interface CheckoutFormProps {
  orderId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function CheckoutForm({ orderId, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const t = useTranslations('checkout');
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      // 确认支付
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?orderId=${orderId}`,
          payment_method_data: {
            billing_details: {
              email,
              name: name || undefined,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'An unexpected error occurred');
        onError?.(error.message || 'Payment failed');
      } else {
        setMessage('Payment successful!');
        onSuccess?.();
        
        // 重定向到成功页面
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${orderId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage('An unexpected error occurred');
      onError?.('Payment processing failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 联系信息 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('contact_information')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('email')} *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('full_name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t('full_name_placeholder')}
            />
          </div>
        </div>
      </div>

      {/* 支付信息 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('payment_details')}</h3>
        <div className="border border-gray-300 rounded-lg p-4">
          <PaymentElement />
        </div>
      </div>

      {/* 消息显示 */}
      {message && (
        <div className={`p-3 rounded-lg ${
          message.includes('success') 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? t('processing') : t('pay_now')}
      </button>

      {/* 条款和条件 */}
      <div className="text-sm text-gray-500">
        <p className="mb-2">
          {t('terms_agreement')}{' '}
          <a href="/terms" className="text-primary-600 hover:underline">
            {t('terms_of_service')}
          </a>{' '}
          {t('and')}{' '}
          <a href="/privacy" className="text-primary-600 hover:underline">
            {t('privacy_policy')}
          </a>.
        </p>
        <p>
          {t('refund_policy')}{' '}
          <a href="/refund" className="text-primary-600 hover:underline">
            {t('refund_policy_link')}
          </a>.
        </p>
      </div>
    </form>
  );
}