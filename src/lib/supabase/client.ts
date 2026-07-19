import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseUrl, getSupabaseAnonKey } from './config'

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      if (typeof document === 'undefined') return []
      return document.cookie.split(';').map(c => {
        const [name, ...rest] = c.split('=')
        return { name: name.trim(), value: rest.join('=').trim() }
      }).filter(c => c.name)
    },
    setAll(cookies) {
      if (typeof document === 'undefined') return
      cookies.forEach(({ name, value, options }) => {
        let cookie = `${name}=${value}; path=/; max-age=${options?.maxAge || 604800}; samesite=${options?.sameSite || 'lax'}`
        if (options?.secure) cookie += '; secure'
        document.cookie = cookie
      })
    },
  },
})

export interface ValidatedSession {
  id: string
  user_id: string
  session_token: string
  refresh_token: string | null
  access_token: string | null
  ip_address: string | null
  user_agent: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  login_method: string | null
  is_active: boolean | null
  expires_at: string
  created_at: string | null
  last_active_at: string | null
  logout_at: string | null
  profiles: {
    id: string
    email: string
    full_name: string | null
    phone: string | null
    avatar_url: string | null
    role: 'student' | 'admin'
    is_active: boolean
    created_at: string
    updated_at: string
  } | null
}

export async function validateSession(
  sessionToken: string
): Promise<ValidatedSession | null> {
  const { data: revoked } = await supabase
    .from('revoked_tokens')
    .select('id')
    .eq('token', sessionToken)
    .maybeSingle()

  if (revoked) return null

  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .eq('is_revoked', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error || !data) return null

  const lastActive = new Date(data.last_active_at || data.created_at)
  const inactiveMinutes = (Date.now() - lastActive.getTime()) / (1000 * 60)

  if (inactiveMinutes > 30) {
    await revokeSession(sessionToken, 'inactive_30min')
    return null
  }

  await supabase
    .from('user_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('session_token', sessionToken)

  await supabase
    .from('user_activity')
    .insert({
      user_id: data.user_id,
      session_id: data.id,
      action: 'session_validate',
      ip_address: data.ip_address,
    }).then(() => {}, () => {})

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user_id)
    .maybeSingle()

  return { ...data, profiles: profile || null } as ValidatedSession
}

export async function updateSessionActivity(
  sessionToken: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('session_token', sessionToken)
  return !error
}

export async function revokeSession(
  sessionToken: string,
  reason: string = 'logout'
): Promise<boolean> {
  const { data: session } = await supabase
    .from('user_sessions')
    .select('user_id')
    .eq('session_token', sessionToken)
    .single()

  const { error } = await supabase
    .from('user_sessions')
    .update({
      is_active: false,
      is_revoked: true,
      revoked_at: new Date().toISOString(),
      revoke_reason: reason,
    })
    .eq('session_token', sessionToken)

  if (!error && session) {
    await supabase.from('revoked_tokens').insert({
      token: sessionToken,
      user_id: session.user_id,
      reason,
    }).then(() => {}, () => {})

    await supabase.from('user_activity').insert({
      user_id: session.user_id,
      action: 'logout',
      resource: sessionToken,
    }).then(() => {}, () => {})
  }

  return !error
}

export { safeSupabase } from '@/lib/safe-supabase'

export async function revokeAllSessions(
  userId: string,
  reason: string = 'logout_all'
): Promise<boolean> {
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('session_token, user_id')
    .eq('user_id', userId)
    .eq('is_active', true)

  const { error } = await supabase
    .from('user_sessions')
    .update({
      is_active: false,
      is_revoked: true,
      revoked_at: new Date().toISOString(),
      revoke_reason: reason,
    })
    .eq('user_id', userId)
    .eq('is_active', true)

  if (sessions && sessions.length > 0) {
    await supabase.from('revoked_tokens').insert(
      sessions.map(s => ({ token: s.session_token, user_id: s.user_id, reason }))
    ).then(() => {}, () => {})

    await supabase.from('user_activity').insert({
      user_id: userId,
      action: 'logout_all',
    }).then(() => {}, () => {})
  }

  return !error
}
