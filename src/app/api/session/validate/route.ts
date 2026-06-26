import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const { data: revoked } = await adminSupabase
    .from('revoked_tokens')
    .select('id')
    .eq('token', token)
    .maybeSingle()

  if (revoked) {
    return NextResponse.json({ error: 'Session revoked' }, { status: 401 })
  }

  const { data: session, error } = await adminSupabase
    .from('user_sessions')
    .select('*')
    .eq('session_token', token)
    .eq('is_active', true)
    .eq('is_revoked', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error || !session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const lastActive = new Date(session.last_active_at || session.created_at)
  const inactiveMinutes = (Date.now() - lastActive.getTime()) / (1000 * 60)

  if (inactiveMinutes > 30) {
    await adminSupabase
      .from('user_sessions')
      .update({
        is_active: false,
        is_revoked: true,
        revoked_at: new Date().toISOString(),
        revoke_reason: 'inactive_30min',
      })
      .eq('session_token', token)

    await adminSupabase.from('revoked_tokens').insert({
      token,
      user_id: session.user_id,
      reason: 'inactive_30min',
    }).then(() => {}, () => {})

    return NextResponse.json({ error: 'Session expired due to inactivity' }, { status: 401 })
  }

  await adminSupabase
    .from('user_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('session_token', token)

  return NextResponse.json({
    id: session.id,
    user_id: session.user_id,
    session_token: session.session_token,
    device_type: session.device_type,
    browser: session.browser,
    os: session.os,
    profiles: session.profiles,
  })
}
