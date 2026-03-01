import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/config';

// 国际化中间件配置
export default createMiddleware({
  // 支持的语言
  locales,
  
  // 默认语言
  defaultLocale,
  
  // 语言检测
  localeDetection: true,
  
  // 路径前缀
  localePrefix: 'always',
  
  // 排除的路径
  pathnames: {
    // 不需要语言前缀的路径
    '/': '/',
    '/products': '/products',
    '/cart': '/cart',
    '/checkout': '/checkout',
    '/dashboard': '/dashboard',
    
    // 需要语言前缀的路径
    '/products/[id]': {
      en: '/products/[id]',
      zh: '/products/[id]'
    }
  }
});

// 中间件匹配的路径
export const config = {
  // 匹配所有路径，除了：
  matcher: [
    // 匹配所有请求路径
    '/((?!api|_next|_vercel|.*\\..*).*)',
    
    // 但排除以下路径
    '/(api|trpc)(.*)'
  ]
};