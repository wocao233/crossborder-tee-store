import { NextResponse } from 'next/server';
import { estimateTariff } from '@/src/lib/shippo';

// 请求体类型
interface TariffEstimateRequest {
  country: string;
  value: number;
  currency?: string;
  category?: string;
  weight?: number;
}

// 商品分类关税税率
const TARIFF_RATES_BY_CATEGORY: Record<string, Record<string, number>> = {
  'clothing': {
    'US': 0.00,    // 美国：服装通常免税
    'CN': 0.13,    // 中国：13% 增值税
    'GB': 0.20,    // 英国：20% VAT
    'DE': 0.19,    // 德国：19% VAT
    'FR': 0.20,    // 法国：20% VAT
    'IT': 0.22,    // 意大利：22% VAT
    'ES': 0.21,    // 西班牙：21% VAT
    'JP': 0.10,    // 日本：10% 消费税
    'AU': 0.10,    // 澳大利亚：10% GST
    'CA': 0.05,    // 加拿大：5% GST
    'MX': 0.16,    // 墨西哥：16% IVA
    'BR': 0.17,    // 巴西：17% ICMS
    'IN': 0.18,    // 印度：18% GST
    'KR': 0.10,    // 韩国：10% VAT
    'SG': 0.07,    // 新加坡：7% GST
    'AE': 0.05,    // 阿联酋：5% VAT
  },
  'electronics': {
    'US': 0.00,
    'CN': 0.13,
    'GB': 0.20,
    'DE': 0.19,
    'JP': 0.10,
  },
  'books': {
    'US': 0.00,
    'CN': 0.00,    // 中国：图书免税
    'GB': 0.00,    // 英国：图书零税率
    'DE': 0.07,    // 德国：图书优惠税率7%
    'FR': 0.055,   // 法国：图书优惠税率5.5%
  },
};

// 免税额度
const DUTY_FREE_THRESHOLDS: Record<string, number> = {
  'US': 800,   // 美元
  'CN': 1000,  // 人民币
  'GB': 135,   // 英镑
  'DE': 150,   // 欧元
  'FR': 150,   // 欧元
  'JP': 10000, // 日元
  'AU': 1000,  // 澳元
  'CA': 20,    // 加元（低值货物）
};

export async function POST(request: Request) {
  try {
    const body: TariffEstimateRequest = await request.json();
    const { country, value, currency = 'USD', category = 'clothing', weight = 0.5 } = body;

    // 验证必填字段
    if (!country || value === undefined) {
      return NextResponse.json(
        { error: 'Country and value are required' },
        { status: 400 }
      );
    }

    if (value <= 0) {
      return NextResponse.json(
        { error: 'Value must be greater than 0' },
        { status: 400 }
      );
    }

    const countryCode = country.toUpperCase();

    // 检查是否在免税额度内
    const dutyFreeThreshold = DUTY_FREE_THRESHOLDS[countryCode];
    const isDutyFree = dutyFreeThreshold && value <= dutyFreeThreshold;

    // 获取税率
    const categoryRates = TARIFF_RATES_BY_CATEGORY[category] || TARIFF_RATES_BY_CATEGORY.clothing;
    const tariffRate = categoryRates[countryCode] || 0.10; // 默认10%

    // 计算关税金额
    let tariffAmount = 0;
    let dutyAmount = 0;
    let vatAmount = 0;

    if (!isDutyFree) {
      // 对于服装类，通常只有增值税，没有关税
      if (category === 'clothing') {
        vatAmount = value * tariffRate;
        tariffAmount = vatAmount;
      } else {
        // 其他类别可能有额外关税
        const dutyRate = getDutyRate(countryCode, category);
        dutyAmount = value * dutyRate;
        vatAmount = (value + dutyAmount) * tariffRate;
        tariffAmount = dutyAmount + vatAmount;
      }
    }

    // 获取货币符号
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'CNY': '¥',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };

    const currencySymbol = currencySymbols[currency.toUpperCase()] || currency;

    return NextResponse.json({
      success: true,
      estimate: {
        country: countryCode,
        value,
        currency,
        category,
        weight_kg: weight,
        
        // 关税信息
        is_duty_free: isDutyFree,
        duty_free_threshold: dutyFreeThreshold 
          ? `${currencySymbol}${dutyFreeThreshold}` 
          : 'No threshold',
        
        // 税率
        vat_rate: tariffRate * 100, // 转换为百分比
        duty_rate: getDutyRate(countryCode, category) * 100,
        
        // 金额
        vat_amount: vatAmount,
        duty_amount: dutyAmount,
        total_tariff: tariffAmount,
        total_with_tariff: value + tariffAmount,
        
        // 格式化显示
        formatted: {
          value: `${currencySymbol}${value.toFixed(2)}`,
          vat_amount: `${currencySymbol}${vatAmount.toFixed(2)}`,
          duty_amount: `${currencySymbol}${dutyAmount.toFixed(2)}`,
          total_tariff: `${currencySymbol}${tariffAmount.toFixed(2)}`,
          total_with_tariff: `${currencySymbol}${(value + tariffAmount).toFixed(2)}`,
        },
        
        // 说明
        notes: getTariffNotes(countryCode, category, isDutyFree),
        documentation_required: getDocumentationRequirements(countryCode, value),
        processing_fee: getProcessingFee(countryCode),
      },
    });
    
  } catch (err) {
    console.error('Error in tariff estimate API:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

// 获取关税税率
function getDutyRate(countryCode: string, category: string): number {
  const dutyRates: Record<string, Record<string, number>> = {
    'US': {
      'clothing': 0.00,
      'electronics': 0.00,
      'books': 0.00,
    },
    'CN': {
      'clothing': 0.00,
      'electronics': 0.00,
      'books': 0.00,
    },
    'GB': {
      'clothing': 0.00,
      'electronics': 0.00,
      'books': 0.00,
    },
    'EU': {
      'clothing': 0.12,
      'electronics': 0.00,
      'books': 0.00,
    },
  };

  const regionRates = dutyRates[countryCode] || dutyRates['EU'] || {};
  return regionRates[category] || 0.00;
}

// 获取关税说明
function getTariffNotes(countryCode: string, category: string, isDutyFree: boolean): string {
  if (isDutyFree) {
    return `Your order is below the duty-free threshold. No import taxes will be charged.`;
  }

  const notes: Record<string, string> = {
    'US': `US imports under $800 are duty-free. Your order may be subject to state sales tax upon delivery.`,
    'CN': `Imports to China are subject to 13% VAT. Clothing items typically have no additional duty.`,
    'GB': `UK imports are subject to 20% VAT. Additional duty may apply for certain categories.`,
    'DE': `German imports are subject to 19% VAT. Clothing may have additional 12% duty.`,
    'FR': `French imports are subject to 20% VAT. Additional duty may apply.`,
    'JP': `Japanese imports are subject to 10% consumption tax.`,
    'AU': `Australian imports over AUD$1000 are subject to 10% GST.`,
    'CA': `Canadian imports are subject to 5% GST plus provincial taxes.`,
  };

  return notes[countryCode] || `Import duties and taxes may apply. The final amount will be determined by customs.`;
}

// 获取文件要求
function getDocumentationRequirements(countryCode: string, value: number): string[] {
  const requirements: string[] = [];
  
  if (value > 1000) {
    requirements.push('Commercial invoice');
  }
  
  if (['CN', 'RU', 'BR', 'IN'].includes(countryCode)) {
    requirements.push('Customs declaration form');
  }
  
  if (['AU', 'NZ'].includes(countryCode) && value > 1000) {
    requirements.push('Import declaration');
  }
  
  if (requirements.length === 0) {
    requirements.push('Standard shipping documentation');
  }
  
  return requirements;
}

// 获取处理费
function getProcessingFee(countryCode: string): number {
  const fees: Record<string, number> = {
    'US': 0,
    'CN': 10,
    'GB': 8,
    'DE': 10,
    'FR': 10,
    'JP': 5,
    'AU': 15,
    'CA': 5,
  };
  
  return fees[countryCode] || 10;
}

// GET: 获取关税信息
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || 'US';
    const category = searchParams.get('category') || 'clothing';

    const countryCode = country.toUpperCase();
    
    return NextResponse.json({
      success: true,
      country: countryCode,
      category,
      duty_free_thresholds: DUTY_FREE_THRESHOLDS,
      tariff_rates: TARIFF_RATES_BY_CATEGORY[category] || TARIFF_RATES_BY_CATEGORY.clothing,
      common_categories: Object.keys(TARIFF_RATES_BY_CATEGORY),
      notes: 'Tariff estimates are for informational purposes only. Final amounts are determined by customs authorities.',
    });
    
  } catch (err) {
    console.error('Error in tariff info API:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}