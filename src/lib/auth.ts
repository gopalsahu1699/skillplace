import { supabase } from './supabase/client'
import { safeAsync, handleError } from './errors/ErrorHandler'
import { logger } from './logger'
import {
  validateSession,
  type ValidatedSession,
} from './supabase/client'

export interface PasswordValidation {
  valid: boolean
  errors: string[]
}

export function validatePasswordStrength(password: string): PasswordValidation {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return { valid: errors.length === 0, errors }
}

export async function signUp(email: string, password: string, fullName: string, phone: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  })
  if (error) {
    const appError = handleError(error, { route: 'auth.signUp' })
    throw appError
  }
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      phone,
      role: 'student',
    })
    if (profileError) {
      logger.warn('Profile creation failed after signup', profileError)
    }
  }
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const appError = handleError(error, { route: 'auth.signIn' })
    throw appError
  }
  return data
}

export async function signOut() {
  await safeAsync(async () => {
    await supabase.auth.signOut()
  }, { route: 'auth.signOut' })
}

export async function getCurrentSession(): Promise<ValidatedSession | null> {
  const result = await safeAsync(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('is_revoked', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sessionError || !session) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    session.profiles = profile || null
    return session as ValidatedSession
  }, { route: 'auth.getCurrentSession' })

  return result.success ? result.data : null
}
