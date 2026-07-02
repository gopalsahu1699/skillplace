import { NextResponse, type NextRequest } from 'next/server'

function generateCsrfToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function getCsrfCookie(request: NextRequest): string | undefined {
  return request.cookies.get('csrf-token')?.value
}

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean)

const PUBLIC_PATHS = [
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/images',
  '/api/video/stream-webhook',
  '/api/payments/webhook',
  '/api/cron',
]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    /^\/.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
}

export async function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const origin = request.headers.get('origin')
      if (origin && !ALLOWED_ORIGINS.some(a => a && origin.startsWith(a))) {
        return NextResponse.json({ error: 'CSRF: Invalid origin' }, { status: 403 })
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

  if (request.nextUrl.pathname.startsWith('/courses/') || request.nextUrl.pathname.startsWith('/programs/')) {
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  if (!getCsrfCookie(request) && !request.nextUrl.pathname.startsWith('/api/')) {
    response.cookies.set('csrf-token', generateCsrfToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
