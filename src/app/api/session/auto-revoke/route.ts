import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date().toISOString()
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    // Find sessions to auto-revoke (expired or idle > 30 min)
    const { data: expired } = await adminSupabase
      .from('user_sessions')
      .select('id, session_token, user_id')
      .eq('is_active', true)
      .lt('expires_at', now)

    const { data: idle } = await adminSupabase
      .from('user_sessions')
      .select('id, session_token, user_id')
      .eq('is_active', true)
      .lt('last_active_at', thirtyMinAgo)

    const toRevoke = [...(expired || []), ...(idle || [])]
    const uniqueIds = Array.from(new Set(toRevoke.map(s => s.id)))

    if (uniqueIds.length > 0) {
      await adminSupabase
        .from('user_sessions')
        .update({
          is_active: false,
          is_revoked: true,
          revoked_at: now,
          revoke_reason: 'auto_expired',
        })
        .in('id', uniqueIds)

      await adminSupabase.from('revoked_tokens').insert(
        toRevoke.map(s => ({
          token: s.session_token,
          user_id: s.user_id,
          reason: 'auto_expired',
        }))
      ).then(() => {}, () => {})
    }

    // Also cleanup old revoked_tokens older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    await adminSupabase
      .from('revoked_tokens')
      .delete()
      .lt('revoked_at', thirtyDaysAgo)
      .then(() => {}, () => {})

    return NextResponse.json({ success: true, revoked: uniqueIds.length })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
