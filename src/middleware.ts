import { NextResponse, type NextRequest } from 'next/server'
import { generateCsrfToken, getCsrfCookieOptions } from '@/lib/security/csrf'

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[]

const PUBLIC_PATHS = [
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/images',
  '/api/video/stream-webhook',
  '/api/payment/webhook',
  '/api/cron',
  '/api/public',
]

const API_RATE_LIMITS = new Map<string, { count: number; resetTime: number }>()

function checkApiRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const key = `${identifier}:${Math.floor(Date.now() / windowMs)}`
  const now = Date.now()
  const existing = API_RATE_LIMITS.get(key)
  if (existing) {
    if (existing.count >= maxRequests) return false
    existing.count++
    return true
  }
  API_RATE_LIMITS.set(key, { count: 1, resetTime: now + windowMs })
  if (API_RATE_LIMITS.size > 5000) {
    const cutoff = now - windowMs * 2
    for (const [k, v] of API_RATE_LIMITS) {
      if (v.resetTime < cutoff) API_RATE_LIMITS.delete(k)
    }
  }
  return true
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    /^\/.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|webmanifest|woff2?|ttf|eot|otf|css|map)$/.test(pathname)
}

export async function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || 'unknown'

    const isAllowed = checkApiRateLimit(`middleware:${ip}`, 200, 60000)
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self)')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
    response.headers.set('X-Download-Options', 'noopen')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    response.headers.set('X-Powered-By', '')

    const method = request.method
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const origin = request.headers.get('origin')
      if (origin) {
        const host = request.headers.get('host') || ''
        const allowed = [...ALLOWED_ORIGINS, `https://${host}`, `http://${host}`]
        const isValid = allowed.some(a => origin.startsWith(a))
        if (!isValid) {
          return NextResponse.json(
            { error: 'CSRF: Invalid origin' },
            { status: 403 }
          )
        }
      }
    }

    if (request.nextUrl.pathname.startsWith('/api/video')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      response.headers.set('Surrogate-Control', 'no-store')
      response.headers.set('Referrer-Policy', 'no-referrer')
    }
  }

  const csrfCookie = request.cookies.get('csrf-token')?.value
  if (!csrfCookie && !request.nextUrl.pathname.startsWith('/api/')) {
    response.cookies.set('csrf-token', generateCsrfToken(), getCsrfCookieOptions())
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|android-chrome-\\d+x\\d+\\.png|apple-touch-icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|webmanifest|woff2?|ttf|eot|otf|css|map)$).*)'],
}
