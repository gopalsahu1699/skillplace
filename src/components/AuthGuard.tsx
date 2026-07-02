'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter()
  const [state, setState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  useEffect(() => {
    let cancelled = false

    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (user) {
        setState('authenticated')
      } else {
        setState('unauthenticated')
        router.push('/login')
      }
    }

    check()
    return () => { cancelled = true }
  }, [router])

  if (state === 'loading') {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-slate-500">Checking access...</span>
      </div>
    )
  }

  if (state === 'unauthenticated') return null

  return <>{children}</>
}
