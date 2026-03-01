import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 国际化配置
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    localeDetection: true,
  },
};

export default withNextIntl(nextConfig);
