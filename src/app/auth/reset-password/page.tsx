'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap, Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { validatePasswordStrength } from '@/lib/auth'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  // Check if we have a valid session from the recovery token
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setTokenValid(true)
      } else {
        // Check URL hash for recovery token
        const hash = window.location.hash
        if (hash && hash.includes('type=recovery')) {
          setTokenValid(true)
        } else {
          setTokenValid(false)
        }
      }
    }
    checkSession()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate password strength
    const validation = validatePasswordStrength(password)
    if (!validation.valid) {
      setError(validation.errors[0])
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      setError(updateError.message)
      toast.error(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    toast.success('Password updated successfully!')

    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)

    setLoading(false)
  }

  // Token is invalid or expired
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="inline-flex h-14 w-14 bg-red-100 rounded-2xl items-center justify-center mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid or Expired Link</h2>
            <p className="text-slate-500 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full bg-blue-600 hover:bg-blue-700">
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Still checking token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
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
            Reset Your<br />Password
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-md">
            Choose a strong password to secure your account.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex h-12 w-12 bg-blue-100 rounded-xl items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
            <p className="text-slate-500 mt-1">Enter your new password</p>
          </div>

          <div className="hidden lg:block text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
            <p className="text-slate-500 mt-1">Enter your new password below</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            {success ? (
              <div className="text-center py-4">
                <div className="inline-flex h-14 w-14 bg-green-100 rounded-2xl items-center justify-center mb-4">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <p className="text-slate-900 font-semibold mb-2">Password Updated!</p>
                <p className="text-slate-500 text-sm mb-6">
                  Your password has been changed successfully. Redirecting to login...
                </p>
                <Button onClick={() => router.push('/login')} className="w-full bg-blue-600 hover:bg-blue-700">
                  Go to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-slate-700">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                      minLength={8}
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
                <div>
                  <Label htmlFor="confirmPassword" className="text-slate-700">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 font-medium mb-1">Password requirements:</p>
                  <ul className="text-xs text-slate-400 space-y-0.5">
                    <li className={password.length >= 8 ? 'text-green-500' : ''}>At least 8 characters</li>
                    <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>One uppercase letter</li>
                    <li className={/[a-z]/.test(password) ? 'text-green-500' : ''}>One lowercase letter</li>
                    <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>One number</li>
                    <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]/.test(password) ? 'text-green-500' : ''}>One special character</li>
                  </ul>
                </div>

                {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Remember your password?{' '}
            <button onClick={() => router.push('/login')} className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
