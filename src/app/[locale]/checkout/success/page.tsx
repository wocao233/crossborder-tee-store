'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const t = useTranslations('checkout');
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟获取订单详情
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        // 这里应该从API获取订单详情
        // const response = await fetch(`/api/orders/${orderId}`);
        // const data = await response.json();
        
        // 模拟数据
        setTimeout(() => {
          setOrderDetails({
            id: orderId || 'ORD-2026-001',
            date: new Date().toLocaleDateString(),
            total: 129.97,
            items: [
              { name: 'Premium Cotton T-Shirt', quantity: 2, price: 29.99 },
              { name: 'Graphic Design T-Shirt', quantity: 1, price: 34.99 },
            ],
            shippingAddress: {
              name: 'John Doe',
              street: '123 Main St',
              city: 'San Francisco',
              state: 'CA',
              postalCode: '94105',
              country: 'United States',
            },
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading_order')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* 成功图标 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('order_confirmed')}</h1>
          <p className="text-gray-600">
            {t('order_confirmed_message')}
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">
              {t('order_id')}: <span className="font-mono">{orderId}</span>
            </p>
          )}
        </div>

        {/* 订单摘要 */}
        {orderDetails && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">{t('order_summary')}</h2>
            
            <div className="space-y-4">
              {/* 订单信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('order_number')}</p>
                  <p className="font-medium">{orderDetails.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('order_date')}</p>
                  <p className="font-medium">{orderDetails.date}</p>
                </div>
              </div>

              {/* 商品列表 */}
              <div>
                <p className="text-sm text-gray-500 mb-2">{t('items_ordered')}</p>
                <div className="space-y-2">
                  {orderDetails.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 总计 */}
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('total')}</span>
                  <span>${orderDetails.total.toFixed(2)}</span>
                </div>
              </div>

              {/* 配送地址 */}
              <div>
                <p className="text-sm text-gray-500 mb-2">{t('shipping_address')}</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium">{orderDetails.shippingAddress.name}</p>
                  <p>{orderDetails.shippingAddress.street}</p>
                  <p>
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postalCode}
                  </p>
                  <p>{orderDetails.shippingAddress.country}</p>
                </div>
              </div>

              {/* 预计送达 */}
              <div>
                <p className="text-sm text-gray-500 mb-2">{t('estimated_delivery')}</p>
                <p className="font-medium">{orderDetails.estimatedDelivery}</p>
              </div>
            </div>
          </div>
        )}

        {/* 下一步操作 */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">{t('whats_next')}</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-primary-600 text-sm">1</span>
              </div>
              <div>
                <p className="font-medium">{t('order_confirmation_email')}</p>
                <p className="text-sm text-gray-600">{t('order_confirmation_email_desc')}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-primary-600 text-sm">2</span>
              </div>
              <div>
                <p className="font-medium">{t('tracking_information')}</p>
                <p className="text-sm text-gray-600">{t('tracking_information_desc')}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-primary-600 text-sm">3</span>
              </div>
              <div>
                <p className="font-medium">{t('order_preparation')}</p>
                <p className="text-sm text-gray-600">{t('order_preparation_desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/products"
            className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
          >
            {t('continue_shopping')}
          </Link>
          <Link
            href="/orders"
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
          >
            {t('view_orders')}
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            {t('print_receipt')}
          </button>
        </div>

        {/* 帮助信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">{t('need_help_question')}</p>
          <p>
            {t('contact_us')}:{' '}
            <a href="mailto:support@crossborder-tee-store.com" className="text-primary-600 hover:underline">
              support@crossborder-tee-store.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}