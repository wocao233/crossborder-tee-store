'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  createdAt: string;
}

interface Order {
  id: string;
  orderId: string;
  totalAmount: number;
  currency: string;
  status: string;
  customerEmail?: string;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // 模拟数据
  useEffect(() => {
    setIsLoading(true);
    
    // 模拟API调用延迟
    setTimeout(() => {
      // 模拟商品数据
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Premium Cotton T-Shirt',
          description: '100% organic cotton, comfortable fit',
          price: 29.99,
          currency: 'USD',
          stock: 50,
          createdAt: '2026-02-28',
        },
        {
          id: '2',
          name: 'Graphic Design T-Shirt',
          description: 'Unique graphic print, limited edition',
          price: 34.99,
          currency: 'USD',
          stock: 25,
          createdAt: '2026-02-27',
        },
        {
          id: '3',
          name: 'Performance Sport T-Shirt',
          description: 'Moisture-wicking fabric, perfect for workouts',
          price: 39.99,
          currency: 'USD',
          stock: 75,
          createdAt: '2026-02-26',
        },
        {
          id: '4',
          name: 'Oversized Comfort T-Shirt',
          description: 'Relaxed fit, soft fabric, perfect for lounging',
          price: 32.99,
          currency: 'USD',
          stock: 40,
          createdAt: '2026-02-25',
        },
      ];

      // 模拟订单数据
      const mockOrders: Order[] = [
        {
          id: '1',
          orderId: 'ORD-2026-001',
          totalAmount: 129.97,
          currency: 'USD',
          status: 'shipped',
          customerEmail: 'customer1@example.com',
          trackingNumber: '9405503699300091234567',
          carrier: 'USPS',
          createdAt: '2026-02-28',
        },
        {
          id: '2',
          orderId: 'ORD-2026-002',
          totalAmount: 34.99,
          currency: 'USD',
          status: 'processing',
          customerEmail: 'customer2@example.com',
          createdAt: '2026-02-27',
        },
        {
          id: '3',
          orderId: 'ORD-2026-003',
          totalAmount: 79.98,
          currency: 'USD',
          status: 'delivered',
          customerEmail: 'customer3@example.com',
          trackingNumber: '1Z999AA1234567890',
          carrier: 'UPS',
          createdAt: '2026-02-26',
        },
        {
          id: '4',
          orderId: 'ORD-2026-004',
          totalAmount: 64.98,
          currency: 'CNY',
          status: 'pending',
          customerEmail: 'customer4@example.com',
          createdAt: '2026-02-25',
        },
      ];

      setProducts(mockProducts);
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  }, []);

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 格式化货币
  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'CNY': '¥',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };
    
    const symbol = symbols[currency.toUpperCase()] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 标题和统计 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your cross-border e-commerce store</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-primary-600 mb-2">{products.length}</div>
            <div className="text-gray-600">Total Products</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">{orders.length}</div>
            <div className="text-gray-600">Total Orders</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {formatCurrency(
                orders.reduce((sum, order) => sum + order.totalAmount, 0),
                'USD'
              )}
            </div>
            <div className="text-gray-600">Total Revenue</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-gray-600">Pending Orders</div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orders
            </button>
          </nav>
        </div>
      </div>

      {/* 商品管理 */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Product Management</h2>
            <Link
              href="/admin/products/new"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Add New Product
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">
                        {formatCurrency(product.price, product.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 订单管理 */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Order Management</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.orderId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.trackingNumber ? (
                        <div className="text-sm">
                          <div className="font-medium">{order.carrier}</div>
                          <div className="text-gray-500">{order.trackingNumber}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not shipped</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 快速操作 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="block w-full text-center bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Add New Product
            </Link>
            <Link
              href="/admin/orders"
              className="block w-full text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View All Orders
            </Link>
            <Link
              href="/admin/analytics"
              className="block w-full text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View Analytics
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <p className="font-medium">Order #ORD-2026-001 shipped</p>
                <p className="text-sm text-gray-500">2 hours ago • Tracking: 9405503699300091234567</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm">$</span>
              </div>
              <div>
                <p className="font-medium">New order received</p>
                <p className="text-sm text-gray-500">4 hours ago • Amount: $129.97</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-sm">!</span>
              </div>
              <div>
                <p className="font-medium">Low stock alert</p>
                <p className="text-sm text-gray-500">6 hours ago • Graphic Design T-Shirt: 5 left</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 跨境功能提示 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Cross-Border Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-blue-700 mb-2">✅ Real-time shipping rates with Shippo</p>
            <p className="text-blue-700 mb-2">✅ Multi-currency support (USD, CNY, EUR, GBP, JPY)</p>
            <p className="text-blue-700 mb-2">✅ Automated tariff estimation</p>
          </div>
          <div>
            <p className="text-blue-700 mb-2">✅ International payment gateways</p>
            <p className="text-blue-700 mb-2">✅ Multi-language storefront</p>
            <p className="text-blue-700 mb-2">✅ Customs documentation generation</p>
          </div>
        </div>
      </div>
    </div>
  );
}