import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '')).hostname
  : '*.supabase.co'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  serverExternalPackages: ['@aws-sdk/client-s3'],
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'off' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), accelerometer=(), autoplay=(self), clipboard-write=(self), display-capture=(), encrypted-media=(self), fullscreen=(self), hid=(), idle-detection=(), magnetometer=(), payment=(self), picture-in-picture=(self), publickey-credentials-get=(self), screen-wake-lock=(), serial=(), usb=(), web-share=(self)' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        { key: 'X-Powered-By', value: '' },
        { key: 'X-Download-Options', value: 'noopen' },
        { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.cashfree.com https://*.cloudflare.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https://*.supabase.co https://*.cloudflare.com https://*.cloudflarestream.com https://*.videodelivery.net https://*.r2.cloudflarestorage.com https://img.icons8.com",
            "media-src 'self' blob: https://*.supabase.co https://*.cloudflare.com https://*.cloudflarestream.com https://*.videodelivery.net https://*.r2.cloudflarestorage.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.cloudflare.com https://*.cloudflarestream.com https://api.cashfree.com https://sdk.cashfree.com https://sandbox.cashfree.com https://payments.cashfree.com https://payments-test.cashfree.com",
            "frame-src 'self' https://sdk.cashfree.com https://api.cashfree.com https://sandbox.cashfree.com https://payments.cashfree.com https://payments-test.cashfree.com https://*.cloudflarestream.com https://www.google.com https://maps.google.com",
            "frame-ancestors 'self'",
            "form-action 'self' https://api.cashfree.com https://sandbox.cashfree.com https://payments.cashfree.com https://payments-test.cashfree.com",
            "base-uri 'self'",
            "object-src 'none'",
            "manifest-src 'self'",
          ].join('; '),
        },
      ],
    },
    {
      source: '/images/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/favicon.ico',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/android-chrome-:size.png',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/apple-touch-icon.png',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      source: '/manifest.webmanifest',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400' },
      ],
    },
  ],
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
    optimizeServerReact: true,
    webpackBuildWorker: true,
  },
  output: 'standalone',
};

export default nextConfig;
