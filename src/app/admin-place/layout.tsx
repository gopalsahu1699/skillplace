'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminNavbar from '@/components/layout/AdminNavbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, AlertTriangle, LogIn } from 'lucide-react'
import { AdminContext } from '@/context/AdminContext'
import PermissionGuard from '@/components/PermissionGuard'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import type { EmployeePermission } from '@/types'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  isEmployee?: boolean
  permissions?: EmployeePermission | null
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'auth' | 'unauthorized' | 'error'>('error')
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (cancelled) return

        if (authError) {
          // Token expired or invalid — needs re-login
          setErrorType('auth')
          setError('Your session has expired. Please log in again.')
          setLoading(false)
          return
        }

        if (!user) {
          setErrorType('auth')
          setError('You are not logged in. Please log in to continue.')
          setLoading(false)
          return
        }

        // Check profiles table for admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (cancelled) return

        if (profile && profile.role === 'admin') {
          setAdminUser(profile)
          setLoading(false)
          return
        }

        // Check employees table
        const { data: employee } = await supabase
          .from('employees')
          .select('id, name, email, role, is_active')
          .eq('email', user.email)
          .maybeSingle()

        if (cancelled) return

        if (!employee) {
          setErrorType('unauthorized')
          setError('Access denied. You do not have admin privileges.')
          setLoading(false)
          return
        }

        if (employee.role === 'admin') {
          setAdminUser({
            id: employee.id,
            email: employee.email,
            full_name: employee.name,
            role: 'admin',
            isEmployee: true,
            permissions: null,
          })
          setLoading(false)
          return
        }

        // Non-admin employee — fetch permissions
        const { data: permissions } = await supabase
          .from('employee_permissions')
          .select('*')
          .eq('employee_id', employee.id)
          .single()

        if (cancelled) return

        if (!permissions) {
          setErrorType('unauthorized')
          setError('You do not have any page permissions assigned. Contact an admin to grant access.')
          setLoading(false)
          return
        }

        setAdminUser({
          id: employee.id,
          email: employee.email,
          full_name: employee.name,
          role: employee.role,
          isEmployee: true,
          permissions,
        })
        setLoading(false)
      } catch {
        if (!cancelled) {
          setErrorType('auth')
          setError('Session check failed. Please log in again.')
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
        setErrorType('auth')
        setError('Session check timed out. Please log in again.')
        setLoading(false)
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [loading])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <div className="hidden md:block w-64 bg-white border-r border-border p-4 space-y-2">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer" aria-hidden="true" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
              <div className="h-3 w-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
            </div>
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
              <div className={`h-5 w-5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded`} aria-hidden="true" />
              <div className={`h-4 ${i < 4 ? 'w-28' : 'w-20'} bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded`} aria-hidden="true" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-6 lg:p-8">
          <div className="space-y-6 max-w-6xl">
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
              <div className="h-9 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded-lg" aria-hidden="true" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-border rounded-xl p-5 space-y-2">
                  <div className="h-4 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                  <div className="h-8 w-12 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                  <div className="h-3 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                </div>
              ))}
            </div>
            <div className="bg-white border border-border rounded-xl p-5">
              <div className="h-6 w-48 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded mb-4" aria-hidden="true" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded-lg" aria-hidden="true" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    const isAuthError = errorType === 'auth'
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md border-slate-200">
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${isAuthError ? 'bg-amber-50' : 'bg-red-50'}`}>
              {isAuthError
                ? <AlertTriangle className="h-7 w-7 text-amber-600" />
                : <Lock className="h-7 w-7 text-red-600" />
              }
            </div>
            <CardTitle className="text-2xl text-slate-900">
              {isAuthError ? 'Session Expired' : 'Unauthorized'}
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthError ? (
              <Link href="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                  <LogIn className="h-4 w-4" />
                  Log In Again
                </Button>
              </Link>
            ) : (
              <Link href="/">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Homepage</Button>
              </Link>
            )}
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
    <div className="flex flex-col min-h-screen bg-slate-50">
      <AdminNavbar />
      <div className="flex flex-1">
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-40 md:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
        <AdminSidebar
          isAdmin={adminUser.role === 'admin'}
          permissions={adminUser.isEmployee ? adminUser.permissions : null}
          isOpen={sidebarOpen}
        />
        <AdminContext.Provider value={{ isAdmin: adminUser.role === 'admin', permissions: adminUser.permissions || null }}>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-3.5rem)] w-full max-w-full overflow-x-hidden">
            <div className="md:hidden mb-4">
              <button
                className="p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <PermissionGuard>{children}</PermissionGuard>
          </main>
        </AdminContext.Provider>
      </div>
    </div>
  )
}
