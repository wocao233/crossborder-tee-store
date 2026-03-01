import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: ReadableStream) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  const buf = await buffer(req.body as ReadableStream);
  const sig = req.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook Error' },
      { status: 400 }
    );
  }
  
  console.log(`Received Stripe webhook event: ${event.type}`);
  
  // 处理不同的事件类型
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object);
      break;
      
    case 'payment_intent.canceled':
      await handlePaymentIntentCanceled(event.data.object);
      break;
      
    case 'charge.succeeded':
      await handleChargeSucceeded(event.data.object);
      break;
      
    case 'charge.refunded':
      await handleChargeRefunded(event.data.object);
      break;
      
    case 'customer.created':
      await handleCustomerCreated(event.data.object);
      break;
      
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return NextResponse.json({ received: true });
}

// 支付意图成功
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    console.log('PaymentIntent succeeded:', paymentIntent.id);
    
    const { id, amount, currency, metadata } = paymentIntent;
    
    console.log('Payment details:', {
      paymentIntentId: id,
      amount: amount / 100,
      currency: currency.toUpperCase(),
      orderId: metadata.orderId,
      customerEmail: metadata.customerEmail,
    });
    
    // TODO: 更新数据库订单状态为"paid"
    // await prisma.order.update({
    //   where: { id: metadata.orderId },
    //   data: { 
    //     status: 'PAID',
    //     paymentStatus: 'SUCCEEDED',
    //     updatedAt: new Date(),
    //   },
    // });
    
    // TODO: 发送订单确认邮件
    // await sendOrderConfirmationEmail(metadata.orderId, metadata.customerEmail);
    
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

// 支付意图失败
async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    console.log('PaymentIntent failed:', paymentIntent.id);
    
    const { id, last_payment_error, metadata } = paymentIntent;
    
    console.log('Payment failed details:', {
      paymentIntentId: id,
      error: last_payment_error?.message,
      orderId: metadata.orderId,
    });
    
    // TODO: 更新订单状态为"payment_failed"
    // await prisma.order.update({
    //   where: { id: metadata.orderId },
    //   data: { 
    //     paymentStatus: 'FAILED',
    //     updatedAt: new Date(),
    //   },
    // });
    
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

// 支付意图取消
async function handlePaymentIntentCanceled(paymentIntent: any) {
  try {
    console.log('PaymentIntent canceled:', paymentIntent.id);
    
    const { id, metadata } = paymentIntent;
    
    console.log('Payment canceled:', {
      paymentIntentId: id,
      orderId: metadata.orderId,
    });
    
    // TODO: 更新订单状态为"canceled"
    
  } catch (error) {
    console.error('Error handling payment intent canceled:', error);
  }
}

// 扣款成功
async function handleChargeSucceeded(charge: any) {
  try {
    console.log('Charge succeeded:', charge.id);
    
    const { id, amount, currency, billing_details } = charge;
    
    console.log('Charge details:', {
      chargeId: id,
      amount: amount / 100,
      currency: currency.toUpperCase(),
      customerEmail: billing_details.email,
    });
    
  } catch (error) {
    console.error('Error handling charge succeeded:', error);
  }
}

// 退款成功
async function handleChargeRefunded(charge: any) {
  try {
    console.log('Charge refunded:', charge.id);
    
    const { id, amount_refunded } = charge;
    
    console.log('Refund details:', {
      chargeId: id,
      refundAmount: amount_refunded / 100,
    });
    
    // TODO: 更新订单状态为"refunded"
    
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
}

// 客户创建
async function handleCustomerCreated(customer: any) {
  try {
    console.log('Customer created:', customer.id);
    
    const { id, email, name } = customer;
    
    console.log('Customer details:', {
      customerId: id,
      email,
      name,
    });
    
    // TODO: 将Stripe客户ID保存到用户记录中
    
  } catch (error) {
    console.error('Error handling customer created:', error);
  }
}

// 结账会话完成
async function handleCheckoutSessionCompleted(session: any) {
  try {
    console.log('Checkout session completed:', session.id);
    
    const { id, customer, customer_details } = session;
    
    console.log('Checkout session details:', {
      sessionId: id,
      customerId: customer,
      customerEmail: customer_details?.email,
    });
    
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}