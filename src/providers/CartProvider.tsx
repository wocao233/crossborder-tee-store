'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCurrency } from './CurrencyProvider';

// 购物车项类型
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  priceUSD: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
  sku: string;
}

// 购物车上下文类型
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  isLoading: boolean;
}

// 创建上下文
const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { convertPrice } = useCurrency();

  // 从localStorage加载购物车
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedCart = localStorage.getItem('crossborder-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // 验证数据格式
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 保存购物车到localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('crossborder-cart', JSON.stringify(items));
    }
  }, [items, isLoading]);

  // 添加商品到购物车
  const addItem = (itemData: Omit<CartItem, 'id'>) => {
    setItems(prevItems => {
      // 检查是否已存在相同SKU和属性的商品
      const existingItemIndex = prevItems.findIndex(
        item => 
          item.productId === itemData.productId &&
          item.size === itemData.size &&
          item.color === itemData.color
      );

      if (existingItemIndex !== -1) {
        // 更新数量
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + itemData.quantity
        };
        return updatedItems;
      } else {
        // 添加新商品
        const newItem: CartItem = {
          ...itemData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        };
        return [...prevItems, newItem];
      }
    });
  };

  // 从购物车移除商品
  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // 更新商品数量
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // 清空购物车
  const clearCart = () => {
    setItems([]);
  };

  // 获取商品总数
  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // 获取小计（美元）
  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.priceUSD * item.quantity), 0);
  };

  // 获取总计（包含运费和税费）
  const getTotal = () => {
    const subtotal = getSubtotal();
    const shipping = subtotal > 50 ? 0 : 9.99; // 满$50免运费
    const tax = subtotal * 0.08; // 8%税费
    return subtotal + shipping + tax;
  };

  // 上下文值
  const contextValue: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotal,
    isLoading,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// 自定义hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// 购物车工具函数
export const cartUtils = {
  // 格式化购物车显示
  formatCartDisplay: (items: CartItem[]) => {
    return items.map(item => ({
      ...item,
      displayPrice: `$${item.priceUSD.toFixed(2)}`,
      displayTotal: `$${(item.priceUSD * item.quantity).toFixed(2)}`
    }));
  },

  // 验证购物车项
  validateCartItem: (item: Omit<CartItem, 'id'>): boolean => {
    return (
      !!item.productId &&
      !!item.name &&
      item.priceUSD > 0 &&
      item.quantity > 0 &&
      item.quantity <= 99 && // 最大数量限制
      !!item.image &&
      !!item.sku
    );
  },

  // 计算节省金额
  calculateSavings: (items: CartItem[]): number => {
    // 这里可以添加折扣逻辑
    return 0;
  },

  // 获取推荐商品
  getRecommendedItems: (currentItems: CartItem[]): CartItem[] => {
    // 这里可以添加推荐逻辑
    return [];
  }
};