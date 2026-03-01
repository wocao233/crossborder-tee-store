'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCurrency } from '@/src/providers/CurrencyProvider';

// 模拟购物车数据
const mockCartItems = [
  { id: '1', name: 'Premium Cotton T-Shirt', priceUSD: 29.99, quantity: 2, image: 'https://via.placeholder.com/80x80' },
  { id: '2', name: 'Graphic Design T-Shirt', priceUSD: 34.99, quantity: 1, image: 'https://via.placeholder.com/80x80' },
];

const CartButton: React.FC = () => {
  const t = useTranslations('cart');
  const { formatPrice } = useCurrency();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems] = useState(mockCartItems);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + (item.priceUSD * item.quantity), 0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className="relative p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {isCartOpen && (
        <>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* 购物车下拉菜单 */}
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('title')} ({itemCount})
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500 mb-4">{t('empty')}</p>
                  <Link
                    href="/products"
                    className="btn-primary inline-block"
                    onClick={() => setIsCartOpen(false)}
                  >
                    {t('continue_shopping')}
                  </Link>
                </div>
              ) : (
                <>
                  {/* 购物车商品列表 */}
                  <div className="max-h-80 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center py-3 border-b border-gray-100 last:border-0">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-sm text-gray-500">
                              {formatPrice(item.priceUSD)} × {item.quantity}
                            </div>
                            <div className="font-medium">
                              {formatPrice(item.priceUSD * item.quantity)}
                            </div>
                          </div>
                        </div>
                        
                        <button className="ml-2 text-gray-400 hover:text-red-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 购物车总计 */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('subtotal')}</span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('shipping')}</span>
                        <span className="font-medium text-green-600">{t('free')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('tax')}</span>
                        <span className="font-medium">{formatPrice(subtotal * 0.08)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                        <span>{t('grand_total')}</span>
                        <span>{formatPrice(subtotal * 1.08)}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="mt-6 space-y-2">
                      <Link
                        href="/cart"
                        className="btn-secondary w-full text-center"
                        onClick={() => setIsCartOpen(false)}
                      >
                        {t('view_cart') || 'View Cart'}
                      </Link>
                      <Link
                        href="/checkout"
                        className="btn-primary w-full text-center"
                        onClick={() => setIsCartOpen(false)}
                      >
                        {t('checkout')}
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartButton;