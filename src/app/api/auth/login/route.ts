import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimitDB, logLoginAttempt, getRateLimitHeaders } from '@/lib/rate-limit'
import crypto from 'crypto'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'

  const rateCheck = await checkRateLimitDB(ip, 5, 15 * 60 * 1000)
  const rateHeaders = getRateLimitHeaders(rateCheck)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429, headers: rateHeaders }
    )
  }

  const { data, error } = await adminSupabase.auth.signInWithPassword({ email, password })

  await logLoginAttempt(email, ip, !error, error?.message)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401, headers: rateHeaders })
  }

  if (data.user) {
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ua = userAgent.toLowerCase()
    const deviceType = /mobile|android|iphone/.test(ua) ? 'mobile'
      : /tablet|ipad/.test(ua) ? 'tablet'
      : 'desktop'

    // Use Supabase access_token if available, otherwise generate a session UUID
    const sessionToken = data.session?.access_token || crypto.randomUUID()

    await adminSupabase.from('user_sessions').insert({
      user_id: data.user.id,
      session_token: sessionToken,
      access_token: data.session?.access_token || null,
      refresh_token: data.session?.refresh_token || null,
      expires_at: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : new Date(Date.now() + 86400000).toISOString(),
      ip_address: ip,
      user_agent: userAgent,
      device_type: deviceType,
      login_method: 'email',
    }).then(() => {}, () => {})

    const response = NextResponse.json({ success: true, user: data.user, session: data.session }, { headers: rateHeaders })

    // Set access token cookie so server-side API routes can verify admin sessions
    if (data.session?.access_token) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: data.session.expires_in || 86400,
      })
      if (data.session.refresh_token) {
        response.cookies.set('sb-refresh-token', data.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 3600,
        })
      }
    }

    return response
  }

  return NextResponse.json({ success: true, user: data.user }, { headers: rateHeaders })
}
