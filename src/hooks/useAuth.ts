'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  validateSession,
  destroySession,
  ValidatedSession,
} from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<ValidatedSession | null>(null)

  const validateStoredSession = useCallback(async () => {
    const sessionToken = getSessionCookie()
    if (!sessionToken) {
      setLoading(false)
      return
    }

    try {
      const validated = await validateSession(sessionToken)
      if (!validated) {
        clearSessionCookie()
        setSessionData(null)
      } else {
        setSessionData(validated)
      }
    } catch {
      clearSessionCookie()
      setSessionData(null)
    }
  }, [])

  useEffect(() => {
    validateStoredSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_OUT') {
          clearSessionCookie()
          setSessionData(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [validateStoredSession])

  return { user, loading, sessionData }
}

export async function destroyCurrentSession(): Promise<boolean> {
  const sessionToken = getSessionCookie()
  if (!sessionToken) return false
  const result = await destroySession(sessionToken)
  clearSessionCookie()
  return result
}
