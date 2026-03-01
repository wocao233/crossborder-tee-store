import { NextResponse } from 'next/server';
import { 
  getShippingRates, 
  DEFAULT_PARCEL, 
  DEFAULT_FROM_ADDRESS,
  type Address,
  type Parcel 
} from '@/src/lib/shippo';

// 请求体类型
interface ShippingRatesRequest {
  toAddress: Address;
  parcel?: Parcel;
  currency?: string;
  carrierAccounts?: string[];
  servicelevels?: string[];
}

export async function POST(request: Request) {
  try {
    const body: ShippingRatesRequest = await request.json();
    const { toAddress, parcel, currency, carrierAccounts, servicelevels } = body;

    // 验证必填字段
    if (!toAddress || !toAddress.country || !toAddress.zip) {
      return NextResponse.json(
        { error: 'Valid shipping address is required' },
        { status: 400 }
      );
    }

    // 使用默认值
    const shippingParcel = parcel || DEFAULT_PARCEL;
    const fromAddress = DEFAULT_FROM_ADDRESS;

    // 获取运费报价
    const result = await getShippingRates(
      fromAddress,
      toAddress,
      shippingParcel,
      {
        carrier_accounts: carrierAccounts,
        servicelevels,
        currency: currency || 'USD',
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to get shipping rates' },
        { status: 500 }
      );
    }

    // 格式化返回数据
    const formattedRates = result.rates.map(rate => ({
      id: rate.object_id,
      carrier: rate.carrier,
      service: rate.servicelevel_name,
      amount: parseFloat(rate.amount),
      currency: rate.currency,
      estimated_days: rate.days,
      attributes: rate.attributes,
      description: getShippingDescription(rate.carrier, rate.servicelevel_name, rate.days),
    }));

    return NextResponse.json({
      success: true,
      rates: formattedRates,
      shipment_id: result.shipment_id,
      from_address: fromAddress,
      to_address: toAddress,
      parcel: shippingParcel,
    });
    
  } catch (err) {
    console.error('Error in shipping-rates API:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

// 获取运费描述
function getShippingDescription(carrier: string, service: string, days: number): string {
  const carrierNames: Record<string, string> = {
    'usps': 'USPS',
    'fedex': 'FedEx',
    'ups': 'UPS',
    'dhl': 'DHL',
    'dpd': 'DPD',
    'royalmail': 'Royal Mail',
  };

  const carrierName = carrierNames[carrier.toLowerCase()] || carrier;
  
  if (days <= 3) {
    return `${carrierName} ${service} - Express (${days} days)`;
  } else if (days <= 7) {
    return `${carrierName} ${service} - Standard (${days} days)`;
  } else {
    return `${carrierName} ${service} - Economy (${days} days)`;
  }
}

// GET: 获取支持的运输商和选项
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'US';

    // 根据国家返回支持的运输商
    const carriersByCountry: Record<string, Array<{
      id: string;
      name: string;
      services: string[];
      notes: string;
    }>> = {
      'US': [
        {
          id: 'usps',
          name: 'USPS',
          services: ['First Class', 'Priority Mail', 'Express Mail'],
          notes: 'Most economical for domestic US',
        },
        {
          id: 'fedex',
          name: 'FedEx',
          services: ['Ground', '2Day', 'Overnight'],
          notes: 'Reliable and fast',
        },
        {
          id: 'ups',
          name: 'UPS',
          services: ['Ground', '3 Day Select', 'Next Day Air'],
          notes: 'Wide international coverage',
        },
      ],
      'CN': [
        {
          id: 'dhl',
          name: 'DHL',
          services: ['Express Worldwide', 'Economy Select'],
          notes: 'Fast delivery to China',
        },
        {
          id: 'fedex',
          name: 'FedEx',
          services: ['International Priority', 'International Economy'],
          notes: 'Reliable international service',
        },
      ],
      'GB': [
        {
          id: 'royalmail',
          name: 'Royal Mail',
          services: ['International Standard', 'International Tracked'],
          notes: 'Official UK postal service',
        },
        {
          id: 'dpd',
          name: 'DPD',
          services: ['Classic', 'Predict'],
          notes: 'Reliable European delivery',
        },
      ],
      'EU': [
        {
          id: 'dhl',
          name: 'DHL',
          services: ['Express', 'Parcel'],
          notes: 'Wide European network',
        },
        {
          id: 'dpd',
          name: 'DPD',
          services: ['Classic', 'Predict'],
          notes: 'Reliable European delivery',
        },
      ],
    };

    const carriers = carriersByCountry[country.toUpperCase()] || carriersByCountry['US'];

    // 默认包裹信息
    const defaultParcel = {
      ...DEFAULT_PARCEL,
      description: 'Standard T-shirt package',
      estimated_value: 50, // USD
    };

    return NextResponse.json({
      success: true,
      country,
      carriers,
      default_parcel: defaultParcel,
      from_address: DEFAULT_FROM_ADDRESS,
      supported_countries: ['US', 'CN', 'GB', 'DE', 'FR', 'JP', 'AU', 'CA', 'MX', 'BR', 'IN'],
      currency_options: ['USD', 'CNY', 'EUR', 'GBP', 'JPY'],
    });
    
  } catch (err) {
    console.error('Error in shipping options API:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}