import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

interface OrderConfirmationRequest {
  orderId: string;
  totalAmount: number;
  currency: string;
  shippingAddress: any;
  shippingRate: any;
  tariffAmount: number;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  customerEmail?: string;
}

export async function POST(request: Request) {
  try {
    const body: OrderConfirmationRequest = await request.json();
    const {
      orderId,
      totalAmount,
      currency,
      shippingAddress,
      shippingRate,
      tariffAmount,
      items,
      customerEmail = 'customer@example.com', // 实际应该从用户信息获取
    } = body;

    // 验证必填字段
    if (!orderId || !totalAmount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 计算小计
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = shippingRate?.amount || 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax + tariffAmount;

    // 获取货币符号
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'CNY': '¥',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };

    const currencySymbol = currencySymbols[currency.toUpperCase()] || currency;

    // 创建HTML邮件内容
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation #${orderId}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9fafb;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 10px 0 0;
              opacity: 0.9;
            }
            .content {
              padding: 30px;
            }
            .section {
              margin-bottom: 30px;
              padding: 20px;
              background-color: #f8fafc;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 15px;
              color: #2d3748;
            }
            .order-summary {
              width: 100%;
              border-collapse: collapse;
            }
            .order-summary th,
            .order-summary td {
              padding: 12px 16px;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
            }
            .order-summary th {
              background-color: #edf2f7;
              font-weight: 600;
              color: #4a5568;
            }
            .order-summary tr:last-child td {
              border-bottom: none;
            }
            .total-row {
              font-weight: bold;
              background-color: #f7fafc;
            }
            .product-item {
              display: flex;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 15px;
              border-bottom: 1px solid #e2e8f0;
            }
            .product-item:last-child {
              border-bottom: none;
              margin-bottom: 0;
              padding-bottom: 0;
            }
            .product-image {
              width: 60px;
              height: 60px;
              border-radius: 8px;
              overflow: hidden;
              margin-right: 15px;
              background-color: #f1f5f9;
            }
            .product-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .product-info {
              flex: 1;
            }
            .product-name {
              font-weight: 600;
              margin-bottom: 5px;
              color: #2d3748;
            }
            .product-price {
              color: #4a5568;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              background-color: #c6f6d5;
              color: #22543d;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #718096;
              font-size: 14px;
              border-top: 1px solid #e2e8f0;
              margin-top: 30px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4299e1;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin-top: 20px;
            }
            @media (max-width: 600px) {
              .container {
                padding: 10px;
              }
              .content {
                padding: 15px;
              }
              .section {
                padding: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
              <p>Thank you for your purchase</p>
            </div>
            
            <div class="content">
              <div class="section">
                <div class="section-title">Order Details</div>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="status-badge">Processing</span></p>
              </div>
              
              <div class="section">
                <div class="section-title">Items Ordered</div>
                ${items.map(item => `
                  <div class="product-item">
                    <div class="product-image">
                      <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="product-info">
                      <div class="product-name">${item.name}</div>
                      <div class="product-price">
                        ${currencySymbol}${item.price.toFixed(2)} × ${item.quantity} = ${currencySymbol}${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="section">
                <div class="section-title">Order Summary</div>
                <table class="order-summary">
                  <tbody>
                    <tr>
                      <td>Subtotal</td>
                      <td>${currencySymbol}${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Shipping</td>
                      <td>${shipping === 0 ? 'FREE' : `${currencySymbol}${shipping.toFixed(2)}`}</td>
                    </tr>
                    ${tariffAmount > 0 ? `
                    <tr>
                      <td>Import Duty & Tax</td>
                      <td>${currencySymbol}${tariffAmount.toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td>Tax</td>
                      <td>${currencySymbol}${tax.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                      <td><strong>Total</strong></td>
                      <td><strong>${currencySymbol}${total.toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              ${shippingAddress ? `
              <div class="section">
                <div class="section-title">Shipping Information</div>
                <p><strong>Carrier:</strong> ${shippingRate?.carrier || 'Standard Shipping'}</p>
                <p><strong>Service:</strong> ${shippingRate?.service || 'Economy'}</p>
                <p><strong>Estimated Delivery:</strong> ${shippingRate?.estimated_days ? `${shippingRate.estimated_days} business days` : '7-14 business days'}</p>
                <p><strong>Shipping Address:</strong><br>
                  ${shippingAddress.name}<br>
                  ${shippingAddress.street1}<br>
                  ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}<br>
                  ${shippingAddress.country}
                </p>
              </div>
              ` : ''}
              
              <div class="section">
                <div class="section-title">What's Next?</div>
                <p>1. Your order is being processed and prepared for shipment.</p>
                <p>2. You'll receive tracking information once your order ships.</p>
                <p>3. Estimated delivery: ${shippingRate?.estimated_days ? `${shippingRate.estimated_days} business days` : '7-14 business days'}</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" class="button">Track Your Order</a>
              </div>
            </div>
            
            <div class="footer">
              <p>If you have any questions, please contact our support team at <a href="mailto:support@crossborder-tee-store.com">support@crossborder-tee-store.com</a></p>
              <p>© ${new Date().getFullYear()} CrossBorder Tee Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 发送邮件
    const { data, error } = await resend.emails.send({
      from: 'CrossBorder Tee Store <orders@crossborder-tee-store.com>',
      to: [customerEmail],
      subject: `Order Confirmation #${orderId}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order confirmation email sent successfully',
      emailId: data?.id,
    });
    
  } catch (err) {
    console.error('Error in send-order-confirmation API:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}