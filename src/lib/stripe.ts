import Stripe from 'stripe';

// 初始化Stripe实例
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // 使用最新稳定版本
  typescript: true,
});

// 支持的支付方式
export const PAYMENT_METHODS = {
  card: 'card',
  alipay: 'alipay',
  wechat_pay: 'wechat_pay',
  paypal: 'paypal',
  apple_pay: 'apple_pay',
  google_pay: 'google_pay',
} as const;

// 支持的货币
export const SUPPORTED_CURRENCIES = ['usd', 'cny', 'eur', 'gbp', 'jpy'] as const;

// 支付意图配置
export interface PaymentIntentConfig {
  amount: number; // 金额（最小单位，如美分）
  currency: string; // 货币代码
  customerId?: string; // 客户ID（如果已存在）
  metadata?: Record<string, string>; // 元数据
  paymentMethodTypes?: string[]; // 支付方式类型
  description?: string; // 描述
}

// 创建支付意图
export async function createPaymentIntent(config: PaymentIntentConfig) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: config.amount,
      currency: config.currency,
      customer: config.customerId,
      metadata: config.metadata,
      payment_method_types: config.paymentMethodTypes || [
        'card',
        'alipay',
        'wechat_pay',
        'paypal',
      ],
      description: config.description,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always',
      },
      capture_method: 'automatic',
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 验证Webhook签名
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      secret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
}

// 处理支付成功
export async function handlePaymentSuccess(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // 这里可以更新订单状态、发送确认邮件等
      return {
        success: true,
        paymentIntent,
      };
    }
    
    return {
      success: false,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error('Error handling payment success:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 创建客户
export async function createCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        created_at: new Date().toISOString(),
      },
    });
    
    return {
      success: true,
      customerId: customer.id,
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 获取支付方式
export async function getPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    
    return {
      success: true,
      paymentMethods: paymentMethods.data,
    };
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 退款处理
export async function createRefund(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    });
    
    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount,
    };
  } catch (error) {
    console.error('Error creating refund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 货币转换工具
export function convertToStripeAmount(amount: number, currency: string): number {
  // Stripe金额需要转换为最小单位
  const currencyMultipliers: Record<string, number> = {
    usd: 100, // 美元：1美元 = 100美分
    cny: 100, // 人民币：1元 = 100分
    eur: 100, // 欧元：1欧元 = 100欧分
    gbp: 100, // 英镑：1英镑 = 100便士
    jpy: 1,   // 日元：1日元 = 1日元（无小数）
  };
  
  const multiplier = currencyMultipliers[currency.toLowerCase()] || 100;
  return Math.round(amount * multiplier);
}

// 格式化金额显示
export function formatStripeAmount(amount: number, currency: string): string {
  const currencyMultipliers: Record<string, number> = {
    usd: 100,
    cny: 100,
    eur: 100,
    gbp: 100,
    jpy: 1,
  };
  
  const multiplier = currencyMultipliers[currency.toLowerCase()] || 100;
  const formattedAmount = (amount / multiplier).toFixed(2);
  
  const currencySymbols: Record<string, string> = {
    usd: '$',
    cny: '¥',
    eur: '€',
    gbp: '£',
    jpy: '¥',
  };
  
  const symbol = currencySymbols[currency.toLowerCase()] || currency.toUpperCase();
  
  return `${symbol}${formattedAmount}`;
}