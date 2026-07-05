export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=(), accelerometer=(), autoplay=(self), clipboard-write=(self), display-capture=(), encrypted-media=(self), fullscreen=(self), hid=(), idle-detection=(), magnetometer=(), payment=(self), picture-in-picture=(self), publickey-credentials-get=(self), screen-wake-lock=(), serial=(), usb=(), web-share=(self)',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'X-DNS-Prefetch-Control': 'off',
    'X-Powered-By': '',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  }
}

export function getContentSecurityPolicy(nonce?: string): Record<string, string> {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.cashfree.com" + (nonce ? ` 'nonce-${nonce}'` : ''),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://*.supabase.co https://*.cloudflare.com https://*.cloudflarestream.com https://*.videodelivery.net https://*.r2.cloudflarestorage.com https://img.icons8.com",
    "media-src 'self' blob: https://*.supabase.co https://*.cloudflare.com https://*.cloudflarestream.com https://*.videodelivery.net https://*.r2.cloudflarestorage.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.cloudflare.com https://*.cloudflarestream.com https://api.cashfree.com https://sdk.cashfree.com https://sandbox.cashfree.com https://payments.cashfree.com https://payments-test.cashfree.com",
    "frame-src 'self' https://sdk.cashfree.com https://api.cashfree.com https://sandbox.cashfree.com https://payments.cashfree.com https://payments-test.cashfree.com https://*.cloudflarestream.com",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "manifest-src 'self'",
  ]

  return {
    'Content-Security-Policy': cspDirectives.join('; '),
  }
}

export function getVideoStreamHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Content-Security-Policy': "default-src 'self'; media-src 'self' blob:; connect-src 'self'; style-src 'self' 'unsafe-inline'",
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  }
}

export function getCorsHeaders(allowedOrigins: string[]): Record<string, string> | null {
  return {
    'Access-Control-Allow-Origin': allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Max-Age': '86400',
  }
}
