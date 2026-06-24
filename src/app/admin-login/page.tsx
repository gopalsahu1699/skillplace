'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap, Shield, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Invalid admin credentials. Please try again.')
      setLoading(false)
      return
    }

    // Check if user is admin
    if (data.user) {
      // Session is automatically stored in cookies by the Supabase client storage adapter

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role !== 'admin') {
        setError('Access denied. This page is for administrators only.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
    }

    window.location.href = '/admin-place'
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative flex flex-col justify-center px-12 xl:px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              Admin Portal
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Secure Access to<br />Your Academy
          </h1>
          <p className="text-slate-300 text-lg mb-8 max-w-md">
            Manage courses, students, payments, and placements from your admin dashboard.
          </p>
          <div className="space-y-4">
            {[
              'Manage courses and categories',
              'View and manage students',
              'Track payments and revenue',
              'Handle leads and placements',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-slate-300">
                <div className="h-6 w-6 bg-blue-600/30 rounded-full flex items-center justify-center shrink-0">
                  <ArrowRight className="h-3 w-3 text-blue-400" />
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex h-12 w-12 bg-slate-900 rounded-xl items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
            <p className="text-slate-500 mt-1">Sign in to manage your academy</p>
          </div>

          <div className="hidden lg:block text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Admin Sign In</h1>
            <p className="text-slate-500 mt-1">Enter your admin credentials to continue</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-slate-700">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@skillplace.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 shadow-sm" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In as Admin'}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Looking for student login?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
