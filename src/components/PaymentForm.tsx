'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/src/providers/CurrencyProvider';
import { useCart } from '@/src/providers/CartProvider';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  LinkAuthenticationElement,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';

// 初始化Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  orderId?: string;
  customerEmail?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// 支付表单组件
function CheckoutForm({ orderId, customerEmail, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const t = useTranslations('checkout');
  const { formatPrice } = useCurrency();
  const { getSubtotal, getTotal, clearCart } = useCart();
  
  const [email, setEmail] = useState(customerEmail || '');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');

  const subtotal = getSubtotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = getTotal();

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
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              email,
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
        
        // 清空购物车
        clearCart();
        
        // 重定向到成功页面
        setTimeout(() => {
          router.push('/checkout/success');
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
      {/* 支付方式选择 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">{t('payment_method')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['card', 'alipay', 'wechat_pay', 'paypal'].map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentMethod(method)}
              className={`p-3 border rounded-lg text-center transition-colors ${
                paymentMethod === method
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-1">
                  {method === 'card' && '💳'}
                  {method === 'alipay' && '📱'}
                  {method === 'wechat_pay' && '💬'}
                  {method === 'paypal' && '🔵'}
                </span>
                <span className="text-sm font-medium">
                  {method === 'card' && t('card')}
                  {method === 'alipay' && 'Alipay'}
                  {method === 'wechat_pay' && 'WeChat Pay'}
                  {method === 'paypal' && 'PayPal'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 邮箱输入 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t('email')}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>

      {/* Stripe支付元素 */}
      <div className="border border-gray-300 rounded-lg p-4">
        <PaymentElement />
      </div>

      {/* 订单摘要 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">{t('order_summary')}</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{t('subtotal')}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('shipping')}</span>
            <span>{shipping === 0 ? t('free') : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('tax')}</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>{t('total')}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
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
        {isLoading ? t('processing') : `${t('pay_now')} ${formatPrice(total)}`}
      </button>

      {/* 安全提示 */}
      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{t('secure_payment')}</span>
        </div>
        <p className="text-xs">
          {t('payment_encrypted')}
        </p>
      </div>
    </form>
  );
}

// 主支付组件
export default function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getTotal } = useCart();
  const { currency } = useCurrency();

  useEffect(() => {
    // 创建支付意图
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const total = getTotal();
        
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            currency: currency.toLowerCase(),
            orderId: props.orderId || `order_${Date.now()}`,
            customerEmail: props.customerEmail,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setError(error instanceof Error ? error.message : 'Payment setup failed');
        props.onError?.(error instanceof Error ? error.message : 'Payment setup failed');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [currency, getTotal, props]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 text-4xl mb-3">⚠️</div>
        <h3 className="text-lg font-semibold text-red-700 mb-2">Payment Setup Failed</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '0.5rem',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  );
}