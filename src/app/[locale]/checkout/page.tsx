'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/src/providers/CurrencyProvider';
import { useCart } from '@/src/providers/CartProvider';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/src/components/CheckoutForm';
import ShippingCalculator from '@/src/components/ShippingCalculator';
import { useRouter } from 'next/navigation';

// 初始化Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const { formatPrice, currency } = useCurrency();
  const { items, getItemCount, getSubtotal, clearCart } = useCart();
  const router = useRouter();
  
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId] = useState(`order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [tariffAmount, setTariffAmount] = useState<number>(0);
  const [shippingAddress, setShippingAddress] = useState<any>(null);

  const subtotal = getSubtotal();
  const shipping = selectedShipping?.amount || (subtotal > 50 ? 0 : 9.99);
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax + tariffAmount;
  const itemCount = getItemCount();

  // 创建支付意图函数
  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: currency.toLowerCase(),
          orderId,
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 如果购物车为空，重定向到购物车页面
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    createPaymentIntent();
  }, [items.length, router]);

  // 处理物流选择
  const handleShippingSelect = (rate: any) => {
    setSelectedShipping(rate);
    // 重新计算支付意图
    createPaymentIntent();
  };

  // 处理地址更新
  const handleAddressUpdate = (address: any) => {
    setShippingAddress(address);
  };

  // 处理支付成功
  const handlePaymentSuccess = async () => {
    try {
      // 创建订单记录
      const orderData = {
        orderId,
        totalAmount: total,
        currency,
        shippingAddress,
        shippingRate: selectedShipping,
        tariffAmount,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.priceUSD,
          quantity: item.quantity,
          image: item.image,
        })),
      };

      // 发送订单确认邮件
      await fetch('/api/send-order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      // 清空购物车
      clearCart();
      
      // 重定向到成功页面
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (error) {
      console.error('Error processing order:', error);
      // 仍然重定向，但显示错误
      router.push(`/checkout/success?orderId=${orderId}&error=email_failed`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-2xl font-bold mb-4">{t('cart_empty')}</h1>
          <p className="text-gray-600 mb-8">{t('cart_empty_message')}</p>
          <Link
            href="/products"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            {t('continue_shopping')}
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-500 text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">{t('payment_error')}</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-3"
            >
              {t('try_again')}
            </button>
            <Link
              href="/cart"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('back_to_cart')}
            </Link>
          </div>
        </div>
      </div>
    );
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 面包屑导航 */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-primary-600">
                {t('home')}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/cart" className="hover:text-primary-600">
                {t('cart')}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{t('checkout')}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：支付表单 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold mb-6">{t('checkout')}</h1>
              
              {/* 订单摘要 */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">{t('order_summary')}</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.size && `${t('size')}: ${item.size}`}
                            {item.color && ` • ${t('color')}: ${item.color}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(item.priceUSD * item.quantity)}</p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.priceUSD)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 物流计算器 */}
              <div className="mb-8">
                <ShippingCalculator
                  subtotal={subtotal}
                  onShippingSelect={handleShippingSelect}
                  onTariffUpdate={setTariffAmount}
                  selectedRate={selectedShipping}
                  onAddressUpdate={handleAddressUpdate}
                />
              </div>

              {/* 支付表单 */}
              {clientSecret && (
                <Elements stripe={stripePromise} options={options}>
                  <CheckoutForm
                    orderId={orderId}
                    onSuccess={handlePaymentSuccess}
                    onError={(errorMsg) => {
                      setError(errorMsg);
                    }}
                  />
                </Elements>
              )}
            </div>

            {/* 安全保证 */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{t('secure_payment')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{t('encrypted_data')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{t('money_back')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：订单总计 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">{t('order_total')}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('shipping')}</span>
                  <span>
                    {selectedShipping 
                      ? formatPrice(selectedShipping.amount)
                      : shipping === 0 ? t('free') : formatPrice(shipping)
                    }
                  </span>
                </div>
                
                {tariffAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('estimated_tariff')}</span>
                    <span>{formatPrice(tariffAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('tax')}</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('total')}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('includes_tax')}
                    {tariffAmount > 0 && ` + ${t('estimated_tariff')}`}
                  </p>
                </div>
              </div>

              {/* 商品数量 */}
              <div className="mb-6">
                <p className="text-gray-600 mb-2">{t('items_in_cart', { count: itemCount })}</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{item.name}</span>
                      <span className="font-medium">{formatPrice(item.priceUSD)} × {item.quantity}</span>
                    </div>
                  ))}
                  {items.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{items.length - 5} {t('more_items')}
                    </p>
                  )}
                </div>
              </div>

              {/* 返回购物车 */}
              <Link
                href="/cart"
                className="block w-full text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-4"
              >
                {t('back_to_cart')}
              </Link>

              {/* 帮助信息 */}
              <div className="text-sm text-gray-500">
                <p className="mb-2">{t('need_help')}</p>
                <p>
                  {t('contact_us')}:{' '}
                  <a href="mailto:support@crossborder-tee-store.com" className="text-primary-600 hover:underline">
                    support@crossborder-tee-store.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}