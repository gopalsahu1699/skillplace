import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseUrl, getSupabaseAnonKey } from './supabase/config'

export interface AuthenticatedUser {
  id: string
  email: string
  role: 'student' | 'admin'
  fullName: string | null
  isActive: boolean
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {}
      },
    },
  })
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active, full_name')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      return {
        id: user.id,
        email: user.email ?? '',
        role: 'student',
        fullName: user.user_metadata?.full_name ?? null,
        isActive: true,
      }
    }

    return {
      id: user.id,
      email: user.email ?? '',
      role: profile.role ?? 'student',
      fullName: profile.full_name,
      isActive: profile.is_active ?? true,
    }
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser()
  if (!user) {
    throw new AuthError('Authentication required', 401)
  }
  if (!user.isActive) {
    throw new AuthError('Account is disabled', 403)
  }
  return user
}
