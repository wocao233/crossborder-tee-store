import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: Request) {
  try {
    const { amount, currency = 'usd' } = await request.json();
    
    // 验证金额
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }
    
    // 验证货币
    const supportedCurrencies = ['usd', 'cny', 'eur', 'gbp', 'jpy'];
    if (!supportedCurrencies.includes(currency.toLowerCase())) {
      return NextResponse.json(
        { error: `Currency ${currency} is not supported` },
        { status: 400 }
      );
    }
    
    // 创建支付意图
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // 转换为分/美分
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        created_at: new Date().toISOString(),
      },
    });
    
    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
    
  } catch (err) {
    console.error('Error creating payment intent:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'usd';
    
    // 返回支持的支付方式
    const paymentMethodsByCurrency: Record<string, string[]> = {
      usd: ['card', 'paypal', 'apple_pay', 'google_pay'],
      cny: ['card', 'alipay', 'wechat_pay'],
      eur: ['card', 'paypal', 'apple_pay', 'google_pay'],
      gbp: ['card', 'paypal', 'apple_pay', 'google_pay'],
      jpy: ['card', 'paypal'],
    };
    
    const methods = paymentMethodsByCurrency[currency.toLowerCase()] || ['card', 'paypal'];
    
    return NextResponse.json({
      success: true,
      currency,
      paymentMethods: methods,
      supportedCurrencies: ['USD', 'CNY', 'EUR', 'GBP', 'JPY'],
    });
    
  } catch (err) {
    console.error('Error getting payment methods:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}