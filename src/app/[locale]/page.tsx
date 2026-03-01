import { useTranslations } from 'next-intl';
import { useCurrency } from '@/src/providers/CurrencyProvider';
import Link from 'next/link';
import ProductCard from '@/src/components/ProductCard';

// 模拟商品数据
const mockProducts = [
  {
    id: '1',
    name: 'Premium Cotton T-Shirt',
    description: '100% organic cotton, comfortable fit, perfect for everyday wear',
    priceUSD: 29.99,
    originalPriceUSD: 39.99,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop'],
    category: 'Basic',
    tags: ['Cotton', 'Organic', 'Everyday'],
    stock: 50,
    rating: 4.5,
    reviewCount: 128,
    sku: 'TSHIRT-001',
  },
  {
    id: '2',
    name: 'Graphic Design T-Shirt',
    description: 'Unique graphic print, limited edition design',
    priceUSD: 34.99,
    originalPriceUSD: 44.99,
    images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w-800&auto=format&fit=crop'],
    category: 'Design',
    tags: ['Graphic', 'Limited', 'Art'],
    stock: 25,
    rating: 4.8,
    reviewCount: 89,
    sku: 'TSHIRT-002',
  },
  {
    id: '3',
    name: 'Performance Sport T-Shirt',
    description: 'Moisture-wicking fabric, perfect for workouts',
    priceUSD: 39.99,
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop'],
    category: 'Sport',
    tags: ['Performance', 'Workout', 'Active'],
    stock: 75,
    rating: 4.7,
    reviewCount: 156,
    sku: 'TSHIRT-003',
  },
  {
    id: '4',
    name: 'Oversized Comfort T-Shirt',
    description: 'Relaxed fit, soft fabric, perfect for lounging',
    priceUSD: 32.99,
    originalPriceUSD: 42.99,
    images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&auto=format&fit=crop'],
    category: 'Comfort',
    tags: ['Oversized', 'Soft', 'Relaxed'],
    stock: 40,
    rating: 4.6,
    reviewCount: 92,
    sku: 'TSHIRT-004',
  },
];

export default function HomePage() {
  const t = useTranslations();
  const { formatPrice } = useCurrency();

  const handleAddToCart = (productId: string) => {
    console.log('Added to cart:', productId);
    // 这里会连接到实际的购物车逻辑
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
              >
                {t('hero.cta')}
              </Link>
              <Link
                href="/categories"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
              >
                {t('navigation.categories')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Multi-Currency Support</h3>
            <p className="text-gray-600">Pay in USD, CNY, EUR, GBP, or JPY with real-time exchange rates.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Worldwide Shipping</h3>
            <p className="text-gray-600">Fast international shipping with real-time tracking and customs support.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
            <p className="text-gray-600">PCI-compliant payments with Stripe, PayPal, Alipay, and WeChat Pay.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{t('hero.featured')}</h2>
            <p className="text-gray-600 mt-2">{t('products.subtitle')}</p>
          </div>
          <Link
            href="/products"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.priceUSD,
                originalPrice: product.originalPriceUSD,
                images: product.images,
                category: product.category,
                tags: product.tags,
                stock: product.stock,
                rating: product.rating,
                reviewCount: product.reviewCount,
                sku: product.sku,
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-900 text-white rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Shop Cross-Border?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands of satisfied customers worldwide. Experience seamless international shopping with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Shopping
            </Link>
            <Link
              href="/about"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">5,000+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
            <div className="text-gray-600">Countries Served</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
            <div className="text-gray-600">Customer Support</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">5★</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      </section>
    </div>
  );
}