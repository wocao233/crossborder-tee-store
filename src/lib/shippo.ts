import Shippo from 'shippo';

// 初始化Shippo客户端
export const shippo = Shippo(process.env.SHIPPO_API_KEY!);

// 地址接口
export interface Address {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

// 包裹接口
export interface Parcel {
  length: number; // 厘米
  width: number; // 厘米
  height: number; // 厘米
  weight: number; // 千克
  mass_unit: 'kg' | 'lb';
  distance_unit: 'cm' | 'in';
}

// 物流选项
export interface ShippingOption {
  servicelevel_token: string;
  servicelevel_name: string;
  carrier: string;
  carrier_account: string;
  amount: string;
  currency: string;
  days: number;
  duration_terms: string;
  attributes: string[];
}

// 创建物流报价
export async function getShippingRates(
  fromAddress: Address,
  toAddress: Address,
  parcel: Parcel,
  options?: {
    carrier_accounts?: string[];
    servicelevels?: string[];
    currency?: string;
  }
) {
  try {
    const shipment = await shippo.shipment.create({
      address_from: {
        name: fromAddress.name,
        street1: fromAddress.street1,
        street2: fromAddress.street2,
        city: fromAddress.city,
        state: fromAddress.state,
        zip: fromAddress.zip,
        country: fromAddress.country,
        phone: fromAddress.phone,
        email: fromAddress.email,
      },
      address_to: {
        name: toAddress.name,
        street1: toAddress.street1,
        street2: toAddress.street2,
        city: toAddress.city,
        state: toAddress.state,
        zip: toAddress.zip,
        country: toAddress.country,
        phone: toAddress.phone,
        email: toAddress.email,
      },
      parcels: [{
        length: parcel.length.toString(),
        width: parcel.width.toString(),
        height: parcel.height.toString(),
        weight: parcel.weight.toString(),
        mass_unit: parcel.mass_unit,
        distance_unit: parcel.distance_unit,
      }],
      async: false,
      carrier_accounts: options?.carrier_accounts,
      servicelevels: options?.servicelevels,
    });

    // 过滤和排序报价
    const rates = shipment.rates
      .filter(rate => 
        rate.attributes?.includes('CHEAPEST') || 
        rate.attributes?.includes('FASTEST') ||
        rate.attributes?.includes('BESTVALUE')
      )
      .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))
      .slice(0, 5); // 返回前5个最佳报价

    return {
      success: true,
      rates: rates.map(rate => ({
        object_id: rate.object_id,
        servicelevel_token: rate.servicelevel_token,
        servicelevel_name: rate.servicelevel_name,
        carrier: rate.provider,
        carrier_account: rate.carrier_account,
        amount: rate.amount,
        currency: rate.currency,
        days: rate.estimated_days,
        duration_terms: rate.duration_terms,
        attributes: rate.attributes || [],
      })),
      shipment_id: shipment.object_id,
    };
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get shipping rates',
    };
  }
}

// 创建物流标签
export async function createShippingLabel(
  rateId: string,
  labelFileType: 'PNG' | 'PDF' | 'PDF_4x6' = 'PDF'
) {
  try {
    const transaction = await shippo.transaction.create({
      rate: rateId,
      label_file_type: labelFileType,
      async: false,
    });

    return {
      success: true,
      label_url: transaction.label_url,
      tracking_number: transaction.tracking_number,
      tracking_status: transaction.tracking_status,
      tracking_url_provider: transaction.tracking_url_provider,
      eta: transaction.eta,
    };
  } catch (error) {
    console.error('Error creating shipping label:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create shipping label',
    };
  }
}

// 关税估算（简化版）
export async function estimateTariff(
  toCountry: string,
  value: number,
  currency: string = 'USD'
) {
  try {
    // 这里可以集成更复杂的关税计算API
    // 目前使用简化的固定费率估算
    
    const tariffRates: Record<string, number> = {
      'US': 0.00, // 美国：0% 关税（大部分商品）
      'CN': 0.13, // 中国：13% 增值税
      'GB': 0.20, // 英国：20% VAT
      'DE': 0.19, // 德国：19% VAT
      'FR': 0.20, // 法国：20% VAT
      'JP': 0.10, // 日本：10% 消费税
      'AU': 0.10, // 澳大利亚：10% GST
      'CA': 0.05, // 加拿大：5% GST + 省税
    };

    const countryCode = toCountry.toUpperCase();
    const tariffRate = tariffRates[countryCode] || 0.10; // 默认10%
    const tariffAmount = value * tariffRate;

    return {
      success: true,
      country: toCountry,
      value,
      currency,
      tariff_rate: tariffRate,
      tariff_amount: tariffAmount,
      total_with_tariff: value + tariffAmount,
      notes: getTariffNotes(countryCode),
    };
  } catch (error) {
    console.error('Error estimating tariff:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to estimate tariff',
    };
  }
}

// 获取关税说明
function getTariffNotes(countryCode: string): string {
  const notes: Record<string, string> = {
    'US': 'Most consumer goods are duty-free under $800',
    'CN': '13% VAT applies to most imported goods',
    'GB': '20% VAT + possible import duty',
    'EU': 'VAT rates vary by country (19-27%)',
    'JP': '10% consumption tax + possible duty',
    'AU': '10% GST for imports over AUD$1000',
    'CA': '5% GST + provincial taxes may apply',
  };

  return notes[countryCode] || 'Import duties and taxes may apply';
}

// 验证地址
export async function validateAddress(address: Address) {
  try {
    const validation = await shippo.address.create({
      name: address.name,
      street1: address.street1,
      street2: address.street2,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      validate: true,
    });

    return {
      success: true,
      is_valid: validation.validation_results?.is_valid || false,
      messages: validation.validation_results?.messages || [],
      normalized_address: validation,
    };
  } catch (error) {
    console.error('Error validating address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate address',
    };
  }
}

// 跟踪包裹
export async function trackPackage(carrier: string, trackingNumber: string) {
  try {
    const tracking = await shippo.track.get_status(carrier, trackingNumber);

    return {
      success: true,
      tracking_status: tracking.tracking_status,
      location: tracking.location,
      eta: tracking.eta,
      events: tracking.tracking_history,
    };
  } catch (error) {
    console.error('Error tracking package:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track package',
    };
  }
}

// 默认包裹尺寸（T恤）
export const DEFAULT_PARCEL: Parcel = {
  length: 30, // 30cm
  width: 20,  // 20cm
  height: 5,  // 5cm
  weight: 0.5, // 0.5kg
  mass_unit: 'kg',
  distance_unit: 'cm',
};

// 默认发货地址（美国仓库）
export const DEFAULT_FROM_ADDRESS: Address = {
  name: 'CrossBorder Tee Store Warehouse',
  street1: '123 Commerce St',
  city: 'Los Angeles',
  state: 'CA',
  zip: '90001',
  country: 'US',
  phone: '+1-555-123-4567',
  email: 'warehouse@crossborder-tee-store.com',
};