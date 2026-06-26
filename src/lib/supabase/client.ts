import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://weebasgxtemffakbvcfa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

function generateToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export interface SessionData {
  sessionToken: string
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

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

export async function createSession(
  userId: string,
  userAgent?: string,
  ip?: string | null,
  accessToken?: string
): Promise<SessionData> {
  const sessionToken = generateToken()
  const accessTokenGenerated = generateToken()
  const refreshToken = generateToken()

  const ua = (userAgent || 'unknown').toLowerCase()
  let deviceType = 'unknown'
  if (/mobile|android|iphone/.test(ua)) deviceType = 'mobile'
  else if (/tablet|ipad/.test(ua)) deviceType = 'tablet'
  else if (/windows|mac|linux/.test(ua)) deviceType = 'desktop'

  let browser = 'unknown'
  if (/chrome/.test(ua)) browser = 'chrome'
  else if (/firefox/.test(ua)) browser = 'firefox'
  else if (/safari/.test(ua)) browser = 'safari'
  else if (/edge/.test(ua)) browser = 'edge'

  let os = 'unknown'
  if (/windows/.test(ua)) os = 'windows'
  else if (/mac/.test(ua)) os = 'macos'
  else if (/linux/.test(ua)) os = 'linux'
  else if (/android/.test(ua)) os = 'android'
  else if (/ios|iphone|ipad/.test(ua)) os = 'ios'

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const sessionRecord = {
    user_id: userId,
    session_token: sessionToken,
    access_token: accessTokenGenerated,
    refresh_token: refreshToken,
    ip_address: ip,
    user_agent: userAgent,
    device_type: deviceType,
    browser,
    os,
    login_method: 'email',
    expires_at: expiresAt.toISOString(),
  }

  let client = supabase
  if (accessToken) {
    const { createClient } = await import('@supabase/supabase-js')
    client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    })
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!existingProfile) {
    await supabase.from('profiles').insert({
      id: userId,
      email: '',
      full_name: null,
      phone: null,
      role: 'student',
      is_active: true,
    })
  }

  const { error } = await client.from('user_sessions').insert(sessionRecord)
  if (error) throw error

  const { data: newSession } = await client
    .from('user_sessions')
    .select('id')
    .eq('session_token', sessionToken)
    .single()

  if (newSession) {
    await client.from('user_activity').insert({
      user_id: userId,
      session_id: newSession.id,
      action: 'login',
      ip_address: ip,
      user_agent: userAgent,
    }).then(() => {}, () => {})
  }

  return { sessionToken, accessToken: accessTokenGenerated, refreshToken, expiresAt }
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

  data.profiles = profile || null
  return data as ValidatedSession
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
