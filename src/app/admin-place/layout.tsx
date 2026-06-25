'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { validateSession, destroySession } from '@/lib/supabase/client'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (cancelled) return

        if (authError) {
          setError('Authentication error: ' + authError.message)
          setLoading(false)
          return
        }

        if (!user) {
          setLoading(false)
          return
        }

        const sessionToken = getSessionCookie()
        if (!sessionToken) {
          router.push('/login')
          return
        }

        const validatedSession = await validateSession(sessionToken)
        if (!validatedSession) {
          clearSessionCookie()
          setError('Session expired. Please sign in again.')
          setLoading(false)
          return
        }

        // Check profiles table first, then employees table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (cancelled) return

        if (profile && profile.role === 'admin') {
          setAdminUser(profile)
        } else {
          // Fallback: check employees table
          const { data: employee } = await supabase
            .from('employees')
            .select('role')
            .eq('id', user.id)
            .single()

          if (employee?.role === 'admin') {
            setAdminUser({ id: user.id, email: user.email || '', full_name: user.user_metadata?.full_name || null, role: 'admin' })
          } else {
            clearSessionCookie()
            setError('Access denied. Admin privileges required.')
            setLoading(false)
            return
          }
        }

        setLoading(false)
      } catch (err) {
        if (!cancelled) {
          setError('Session check failed. Please refresh the page.')
          setLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => {
      if (loading) {
        setError('Session check timed out. Please refresh the page.')
        setLoading(false)
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [loading])

  const handleLogout = async () => {
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
    setAdminUser(null)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Lock className="h-7 w-7 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Session Error</CardTitle>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!adminUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md border-slate-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <Lock className="h-7 w-7 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Admin Access Required</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              You need admin privileges to access this area
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-slate-500">
              Please sign in with an admin account to continue.
            </p>
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      <AdminSidebar isAdmin={adminUser.role === 'admin'} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 p-4 md:p-6 min-h-screen">
        <div className="flex items-center justify-between gap-4 mb-4">
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-slate-500 hidden sm:inline">
              {adminUser.full_name || adminUser.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-300 hover:bg-slate-50">Logout</Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
