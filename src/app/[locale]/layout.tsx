import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/src/i18n/config';
import "./globals.css";
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { CurrencyProvider } from '@/src/providers/CurrencyProvider';
import { CartProvider } from '@/src/providers/CartProvider';

const inter = Inter({ subsets: ["latin"] });

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

// 生成静态参数
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// 生成元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const messages = await getMessages({ locale });
  
  return {
    title: messages.metadata?.title || 'CrossBorder Tee Store',
    description: messages.metadata?.description || 'Premium T-shirts with worldwide shipping',
    keywords: ['T-shirt', 'ecommerce', 'cross-border', 'international shipping', 'USD', 'CNY'],
    authors: [{ name: 'CrossBorder Tee Store' }],
    openGraph: {
      type: 'website',
      locale: locale,
      url: 'https://crossborder-tee-store.vercel.app',
      title: messages.metadata?.title || 'CrossBorder Tee Store',
      description: messages.metadata?.description || 'Premium T-shirts with worldwide shipping',
      siteName: 'CrossBorder Tee Store',
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.metadata?.title || 'CrossBorder Tee Store',
      description: messages.metadata?.description || 'Premium T-shirts with worldwide shipping',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: 'https://crossborder-tee-store.vercel.app',
      languages: {
        'en': 'https://crossborder-tee-store.vercel.app/en',
        'zh': 'https://crossborder-tee-store.vercel.app/zh',
      },
    },
  };
}

export default async function RootLayout({
  children,
  params
}: Props) {
  // 验证语言
  if (!locales.includes(params.locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale: params.locale });

  return (
    <html lang={params.locale} className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <NextIntlClientProvider messages={messages}>
          <CurrencyProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Header locale={params.locale} />
                <main className="flex-1 container mx-auto px-4 py-8">
                  {children}
                </main>
                <Footer locale={params.locale} />
              </div>
            </CartProvider>
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
