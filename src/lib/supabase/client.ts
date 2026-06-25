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
  ip?: string | null
): Promise<SessionData> {
  const sessionToken = generateToken()
  const accessToken = generateToken()
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

  const { error } = await supabase.from('user_sessions').insert({
    user_id: userId,
    session_token: sessionToken,
    access_token: accessToken,
    refresh_token: refreshToken,
    ip_address: ip,
    user_agent: userAgent,
    device_type: deviceType,
    browser,
    os,
    login_method: 'email',
    expires_at: expiresAt.toISOString(),
  })

  if (error) throw error
  return { sessionToken, accessToken, refreshToken, expiresAt }
}

export async function validateSession(
  sessionToken: string
): Promise<ValidatedSession | null> {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*, profiles(*)')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) return null
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

export async function destroySession(
  sessionToken: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false, logout_at: new Date().toISOString() })
    .eq('session_token', sessionToken)
  return !error
}

export async function destroyAllUserSessions(
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false, logout_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_active', true)
  return !error
}
