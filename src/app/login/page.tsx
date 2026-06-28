'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { checkRateLimit } from '@/lib/rate-limit'
import { notify } from '@/lib/notifications'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const searchParams = useSearchParams()
  const redirectedFrom = searchParams.get('redirectedFrom') || '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const clientIp = '127.0.0.1'
    const rateCheck = checkRateLimit(clientIp, 5, 15 * 60 * 1000)
    if (!rateCheck.allowed) {
      setError('Too many login attempts. Please try again in 15 minutes.')
      setLoading(false)
      return
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      notify.loginError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      notify.loginSuccess(data.user.user_metadata?.full_name || data.user.email)

      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).catch(() => {})

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin' || profile?.role === 'employee') {
        window.location.href = '/admin-place'
      } else {
        const { data: employee } = await supabase
          .from('employees')
          .select('role')
          .eq('email', data.user.email)
          .single()

        if (employee?.role === 'admin' || employee?.role === 'employee') {
          window.location.href = '/admin-place'
        } else {
          window.location.href = redirectedFrom
        }
      }
    } else {
      window.location.href = redirectedFrom
    }
  }

  async function handleOAuthLogin(provider: 'google' | 'github') {
    setError('')
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      notify.loginError(authError.message)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setResetLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (resetError) {
      setError(resetError.message)
      notify.loginError(resetError.message)
    } else {
      setResetSent(true)
      notify.registerSuccess()
    }
    setResetLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative flex flex-col justify-center px-12 xl:px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              skillplace <span className="text-blue-200">ACADEMY</span>
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Welcome Back to<br />Your Learning Journey
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-md">
            Access your courses, track your progress, and continue building your engineering career.
          </p>
          <div className="space-y-4">
            {[
              'Continue where you left off',
              'Track your learning progress',
              'Access live projects and assignments',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-blue-100">
                <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex h-12 w-12 bg-blue-100 rounded-xl items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 mt-1">Sign in to your account</p>
          </div>

          <div className="hidden lg:block text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
            <p className="text-slate-500 mt-1">Enter your credentials to access your account</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            {showReset ? (
              resetSent ? (
                <div className="text-center py-4">
                  <div className="inline-flex h-14 w-14 bg-green-100 rounded-2xl items-center justify-center mb-4">
                    <Mail className="h-7 w-7 text-green-600" />
                  </div>
                  <p className="text-slate-900 font-semibold mb-2">Check your email</p>
                  <p className="text-slate-500 text-sm mb-6">
                    We sent a password reset link to {resetEmail}
                  </p>
                  <Button variant="outline" onClick={() => { setShowReset(false); setResetSent(false); }} className="w-full border-slate-300">
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-sm text-slate-500">
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </p>
                  <div>
                    <Label htmlFor="resetEmail" className="text-slate-700">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
                  <div className="flex gap-3">
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={resetLoading}>
                      {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    <Button type="button" variant="outline" className="w-full border-slate-300" onClick={() => { setShowReset(false); setError(''); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-slate-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
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
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => {
                        setShowReset(true)
                        setResetEmail(email)
                        setError('')
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-slate-400">Or continue with</span></div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50" onClick={() => handleOAuthLogin('google')}>
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Google
                    </Button>
                    <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50" onClick={() => handleOAuthLogin('github')}>
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      GitHub
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
