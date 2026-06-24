'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile && (profile.role === 'admin' || profile.role === 'employee')) {
        setAdminUser(profile)
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
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
      <AdminSidebar isAdmin={adminUser.role === 'admin'} />
      <main className="flex-1 p-6 ml-64">
        <div className="flex items-center justify-end gap-4 mb-4">
          <span className="text-sm text-slate-500">
            {adminUser.full_name || adminUser.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-300 hover:bg-slate-50">Logout</Button>
        </div>
        {children}
      </main>
    </div>
  )
}
