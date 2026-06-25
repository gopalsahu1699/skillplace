import { supabase } from './supabase/client'
import {
  createSession,
  validateSession,
  destroySession,
  ValidatedSession,
} from './supabase/client'

function setSessionCookie(sessionToken: string): void {
  if (typeof document !== 'undefined') {
    document.cookie = `sp_session=${sessionToken}; path=/; max-age=604800; secure; samesite=lax`
  }
}

function getSessionCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(/(?:^|;\s*)sp_session=([^;]*)/)
  return match ? match[1] : undefined
}

function clearSessionCookie(): void {
  if (typeof document !== 'undefined') {
    document.cookie = 'sp_session=; path=/; max-age=0'
  }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  })
  if (error) throw error
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      phone,
      role: 'student',
    })

    try {
      const session = await createSession(data.user.id, undefined, null, data.session?.access_token)
      setSessionCookie(session.sessionToken)
    } catch {
      // Session creation is best-effort during sign up
    }
  }
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  if (data.user) {
    try {
      const userAgent =
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      const session = await createSession(data.user.id, userAgent, null, data.session?.access_token)
      setSessionCookie(session.sessionToken)
    } catch {
      // Session creation is best-effort during sign in
    }
  }
  return data
}

export async function signOut() {
  const sessionToken = getSessionCookie()
  if (sessionToken) {
    try {
      await destroySession(sessionToken)
    } catch {
      // Best-effort cleanup
    }
    clearSessionCookie()
  }
  await supabase.auth.signOut()
}

export async function getCurrentSession(): Promise<ValidatedSession | null> {
  const sessionToken = getSessionCookie()
  if (!sessionToken) return null
  return await validateSession(sessionToken)
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).limit(1)
  if (error) throw error
  return data && data.length > 0 ? data[0] : null
}
