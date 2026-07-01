'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PhoneInput from '@/components/ui/phone-input'
import { validatePhoneNumber, getFullPhone } from '@/lib/validation/phone'
import { GraduationCap, User, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle, XCircle, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { notify } from '@/lib/notifications'
import { validatePasswordStrength } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneCode, setPhoneCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const passwordValidation = validatePasswordStrength(password)
  const passwordStrength = password.length === 0 ? 0 : passwordValidation.errors.length === 0 ? 4 : passwordValidation.errors.length <= 2 ? 3 : passwordValidation.errors.length <= 3 ? 2 : 1
  const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':\\"\\|,.<>\/?~]/

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0])
      setLoading(false)
      return
    }

    // Validate phone number using libphonenumber-js
    const fullPhone = getFullPhone(phoneCode, phoneNumber)
    const phoneValidation = validatePhoneNumber(fullPhone, phoneCode)

    if (!phoneValidation.valid) {
      setError(phoneValidation.error || 'Please enter a valid phone number')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: fullPhone,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      notify.registerError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        phone: fullPhone,
        role: 'student',
      })

      if (profileError) {
        setError('Failed to create profile. Please try again.')
        setLoading(false)
        return
      }

      if (data.session) {
        notify.registerSuccess()
        window.location.href = '/'
        return
      }
    }

    notify.registerSuccess()
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
            <div className="inline-flex h-16 w-16 bg-green-100 rounded-2xl items-center justify-center mb-5">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Account Created!</h2>
            <p className="text-slate-500 mb-6">
              Please check your email to verify your account, then sign in.
            </p>
            <Link href="/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[length:20px_20px] bg-[radial-gradient(circle,white_1px,transparent_1px)]" />
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
            Start Your Engineering<br />Career Today
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-md">
            Join thousands of students who have transformed their careers with practical, hands-on training.
          </p>
          <div className="space-y-4">
            {[
              '100% Job Assistance',
              'Learn from Industry Experts',
              'Real World Projects',
              'Industry-Recognized Certificates',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-blue-100">
                <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="h-3 w-3 text-white" />
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
            <div className="inline-flex h-12 w-12 bg-blue-100 rounded-xl items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500 mt-1">Join Skillplace Academy today</p>
          </div>

          <div className="hidden lg:block text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-500 mt-1">Fill in your details to get started</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
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
                <Label htmlFor="phone" className="text-slate-700">Phone</Label>
                <PhoneInput
                  phoneCode={phoneCode}
                  phoneNumber={phoneNumber}
                  onPhoneCodeChange={setPhoneCode}
                  onPhoneNumberChange={setPhoneNumber}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
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
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Password strength: {strengthLabels[passwordStrength]}</p>
                    <div className="mt-2 space-y-1">
                      {[
                        { label: 'At least 8 characters', met: password.length >= 8 },
                        { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
                        { label: 'One lowercase letter', met: /[a-z]/.test(password) },
                        { label: 'One number', met: /[0-9]/.test(password) },
                        { label: 'One special character', met: specialCharRegex.test(password) },
                      ].map((req) => (
                        <div key={req.label} className="flex items-center gap-1.5">
                          {req.met ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-slate-300" />
                          )}
                          <span className={`text-xs ${req.met ? 'text-green-600' : 'text-slate-400'}`}>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" required className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-500">
                  I agree to the <span className="text-blue-600 font-medium">Terms of Service</span> and <span className="text-blue-600 font-medium">Privacy Policy</span>
                </span>
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}