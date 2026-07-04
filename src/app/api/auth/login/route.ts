import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimitDB, logLoginAttempt, getRateLimitHeaders } from '@/lib/rate-limit'
import { emailSchema } from '@/lib/security/validation'
import { logAuditEvent } from '@/lib/security/audit'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    const emailResult = emailSchema.safeParse(email)
    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'

    const rateCheck = await checkRateLimitDB(ip, 5, 15 * 60 * 1000)
    const rateHeaders = getRateLimitHeaders(rateCheck)
    if (!rateCheck.allowed) {
      await logAuditEvent({
        action: 'rate_limit_exceeded',
        details: { type: 'login', ip },
        ipAddress: ip,
        success: false,
        metadata: { rateLimitWindow: '15min', maxAttempts: 5 },
      })
      return NextResponse.json(
        { error: 'Too many attempts. Try again in 15 minutes.' },
        { status: 429, headers: rateHeaders }
      )
    }

    const { data, error } = await adminSupabase.auth.signInWithPassword({
      email: emailResult.data,
      password,
    })

    await logLoginAttempt(emailResult.data, ip, !error, error?.message)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401, headers: rateHeaders })
    }

    if (data.user) {
      const userAgent = request.headers.get('user-agent') || 'unknown'
      const ua = userAgent.toLowerCase()
      const deviceType = /mobile|android|iphone/.test(ua) ? 'mobile'
        : /tablet|ipad/.test(ua) ? 'tablet'
        : 'desktop'

      const sessionToken = data.session?.access_token || crypto.randomUUID()

      await adminSupabase.from('user_sessions').insert({
        user_id: data.user.id,
        session_token: sessionToken,
        access_token: data.session?.access_token || null,
        refresh_token: data.session?.refresh_token || null,
        expires_at: data.session?.expires_at
          ? new Date(data.session.expires_at * 1000).toISOString()
          : new Date(Date.now() + 86400000).toISOString(),
        ip_address: ip,
        user_agent: userAgent,
        device_type: deviceType,
        login_method: 'email',
      }).then(() => {}, () => {})

      await logAuditEvent({
        userId: data.user.id,
        action: 'login',
        ipAddress: ip,
        userAgent,
        success: true,
      })

      const response = NextResponse.json({ success: true, user: data.user, session: data.session }, { headers: rateHeaders })

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
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
