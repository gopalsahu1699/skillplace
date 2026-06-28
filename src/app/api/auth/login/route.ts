import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimitDB, logLoginAttempt } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'

  const rateCheck = await checkRateLimitDB(ip, 5, 15 * 60 * 1000)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 }
    )
  }

  const { data, error } = await adminSupabase.auth.signInWithPassword({ email, password })

  await logLoginAttempt(email, ip, !error, error?.message)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  if (data.user) {
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ua = userAgent.toLowerCase()
    const deviceType = /mobile|android|iphone/.test(ua) ? 'mobile'
      : /tablet|ipad/.test(ua) ? 'tablet'
      : 'desktop'

    await adminSupabase.from('user_sessions').insert({
      user_id: data.user.id,
      session_token: data.session?.access_token || 'server-side',
      ip_address: ip,
      user_agent: userAgent,
      device_type: deviceType,
      login_method: 'email',
    }).then(() => {}, () => {})

    await adminSupabase.from('user_activity').insert({
      user_id: data.user.id,
      action: 'login',
      ip_address: ip,
      user_agent: userAgent,
    }).then(() => {}, () => {})
  }

  return NextResponse.json({ success: true, user: data.user })
}
