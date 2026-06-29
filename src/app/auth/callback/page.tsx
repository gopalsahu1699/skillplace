'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Check if this is a password recovery link
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery')) {
      // Redirect to the reset-password page with the token in the URL
      router.push(`/auth/reset-password${window.location.search}${window.location.hash}`)
      return
    }

    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/')
        router.refresh()
      }
    })

    const timer = setTimeout(() => {
      router.push('/')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
