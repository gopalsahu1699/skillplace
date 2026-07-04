'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronRight, ChevronLeft, Loader2, CreditCard, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { waitForRazorpay, getRazorpay } from '@/lib/razorpay-client'
import PhoneInput from '@/components/ui/phone-input'
import { sanitizePhone, displayPhone } from '@/lib/validation/phone'

const PUBLIC_API_BASE = '/api/public'

interface ProgramInfo {
  id: string
  name: string
  slug: string
  description: string
  price: number
  discount_price: number | null
  duration_weeks: number
  features: string[]
  program_type: string
}

interface CouponData {
  id: string
  code: string
  discount_type: 'percent' | 'amount'
  discount_rate: number
  min_order_amount: number | null
  max_uses: number | null
  used_count: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
}

interface Course {
  id: string
  title: string
}

interface FormData {
  fullName: string
  email: string
  phoneNumber: string
  location: string
  notes: string
  acceptTerms: boolean
}

type Step = 'info' | 'payment' | 'success' | 'failure'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function EnrollPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [program, setProgram] = useState<ProgramInfo | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('info')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [phoneValid, setPhoneValid] = useState<boolean>(true) // Track phone validation
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    notes: '',
    acceptTerms: false,
  })
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  async function fetchUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', user.id)
          .single()

        if (profile) {
          const phoneDigits = (profile.phone || '').replace(/[^\d]/g, '')
          setFormData(prev => ({
            ...prev,
            fullName: profile.full_name || prev.fullName,
            email: profile.email || prev.email,
            phoneNumber: phoneDigits,
          }))
        } else {
          // Fallback to auth user email if no profile
          if (user.email) {
            setFormData(prev => ({
              ...prev,
              email: user.email || prev.email,
            }))
          }
        }
      }
    } catch {
      // Profile fetch failed, proceed with empty form
    }
  }

  async function fetchProgram() {
    setLoading(true)
    try {
      const publicRes = await fetch(`${PUBLIC_API_BASE}?table=training_programs&filter=slug&value=${slug}&join=branches(*)`)
      const publicData = await publicRes.json()
      const programs = publicData.data || []
      if (programs.length === 0) {
        setLoading(false)
        return
      }
      const prog = programs[0]
      setProgram(prog)

      try {
        const coursesRes = await fetch(`${PUBLIC_API_BASE}?table=program_courses&filter=program_id&value=${prog.id}&join=courses(id,title)`)
        const coursesData = await coursesRes.json()
        setCourses((coursesData.data || []).map((pc: { courses: Course }) => pc.courses).filter(Boolean))
      } catch {
        setCourses([])
      }
    } catch {
      setProgram(null)
    }
    setLoading(false)
  }

  const orderDataRef = useRef<{ key: string; amount: number; currency: string; orderId: string } | null>(null)

  function getCouponDiscount(): number {
    if (!appliedCoupon || !program) return 0
    const basePrice = program.discount_price || program.price
    if (appliedCoupon.discount_type === 'percent') {
      return Math.round(basePrice * appliedCoupon.discount_rate / 100)
    }
    return Math.min(appliedCoupon.discount_rate, basePrice)
  }

  function getFinalPrice(): number {
    if (!program) return 0
    const basePrice = program.discount_price || program.price
    const discount = getCouponDiscount()
    return Math.max(basePrice - discount, 0)
  }

  const displayPrice = getFinalPrice()

  useEffect(() => {
    Promise.resolve().then(() => fetchUserProfile())
    Promise.resolve().then(() => fetchProgram())
  }, [slug])

  useEffect(() => {
    if (step !== 'payment' || !program || displayPrice <= 0) {
      orderDataRef.current = null
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/programs/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programId: program.id,
            programName: program.name,
            studentName: formData.fullName,
            email: formData.email,
            phone: sanitizePhone(formData.phoneNumber),
            couponCode: appliedCoupon?.code || null,
          }),
        })
        const data = await res.json()
        if (!cancelled && data.orderId) {
          orderDataRef.current = { key: data.key, amount: data.amount, currency: data.currency, orderId: data.orderId }
        }
      } catch {
        if (!cancelled) orderDataRef.current = null
      }
    })()
    return () => {
      cancelled = true
      orderDataRef.current = null
    }
  }, [step, program, formData.fullName, formData.email, formData.phoneNumber, appliedCoupon, displayPrice])

  function updateForm(updates: Partial<FormData>) {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  async function applyCoupon() {
    if (!couponCode.trim() || !program) return
    setApplyingCoupon(true)
    setCouponError('')
    setAppliedCoupon(null)

    try {
      const basePrice = program.discount_price || program.price
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), amount: basePrice }),
      })
      const data = await res.json()

      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon')
        return
      }

      setAppliedCoupon(data.coupon)
      setCouponError('')
    } catch {
      setCouponError('Failed to validate coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const openRazorpay = useCallback(async () => {
    if (!program) return
    setSubmitting(true)
    setError('')

    try {
      const preOrderData = orderDataRef.current

      let orderData = preOrderData

      if (!orderData || !orderData.orderId) {
        const orderRes = await fetch('/api/programs/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programId: program.id,
            programName: program.name,
            studentName: formData.fullName,
            email: formData.email,
            phone: sanitizePhone(formData.phoneNumber),
            couponCode: appliedCoupon?.code || null,
          }),
        })

        const data = await orderRes.json()

        if (!orderRes.ok) {
          throw new Error(data.error || 'Failed to create payment order')
        }

        if (data.free) {
          setStep('success')
          toast.success('Enrollment confirmed!')
          setSubmitting(false)
          return
        }

        if (!data.orderId) {
          throw new Error('Unexpected response from payment server')
        }

        orderData = { key: data.key, amount: data.amount, currency: data.currency, orderId: data.orderId }
      }

      await waitForRazorpay()

      const Razorpay = getRazorpay()
      if (!Razorpay) {
        throw new Error('Payment gateway not loaded. Please refresh and try again.')
      }

      if (!orderData || !orderData.orderId) {
        throw new Error('Payment session expired. Please go back and try again.')
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Skillplace Academy',
        description: `Enrollment - ${program.name}`,
        order_id: orderData.orderId,
        handler: async function (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) {
          try {
            const verifyRes = await fetch('/api/programs/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                programId: program.id,
                studentName: formData.fullName,
                email: formData.email,
                phone: sanitizePhone(formData.phoneNumber),
                location: formData.location,
                notes: formData.notes,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              setStep('success')
              toast.success('Payment successful! Enrollment confirmed.')
            } else {
              setStep('failure')
              setError(verifyData.error || 'Payment verification failed')
            }
          } catch {
            setStep('failure')
            setError('Payment verification failed. Please contact support.')
          } finally {
            setSubmitting(false)
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: sanitizePhone(formData.phoneNumber),
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function () {
            setStep('failure')
            setError('Payment was cancelled. You can retry when ready.')
            setSubmitting(false)
          },
        },
      }

      const rzp = new Razorpay(options)
      rzp.open()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment')
      setSubmitting(false)
    }
  }, [program, formData, appliedCoupon])

  const canProceed = formData.fullName.trim() !== '' && formData.email.trim() !== '' && formData.phoneNumber.trim() !== '' && phoneValid

  const stepConfig = {
    info: { index: 0, label: 'Personal Info' },
    payment: { index: 1, label: 'Payment' },
    success: { index: 2, label: 'Complete' },
    failure: { index: 2, label: 'Complete' },
  }

  const steps = ['Personal Info', 'Payment', 'Complete']
  const currentStepIndex = stepConfig[step].index

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Program Not Found</h1>
          <Link href="/programs">
            <Button className="bg-blue-600 hover:bg-blue-700">Browse Programs</Button>
          </Link>
        </div>
      </div>
    )
  }

  const originalPrice = program.discount_price || program.price

  return (
    <div className="bg-slate-50 min-h-screen pb-24 md:pb-0">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/programs/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {program.name}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <span className="h-6 w-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-bold">
                    {program.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{program.name}</h2>
                  <p className="text-sm text-slate-500">Duration: {program.duration_weeks} weeks</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-4">{program.description}</p>
              <div className="space-y-2 mb-4">
                {program.features.slice(0, 5).map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-800 font-medium mb-1">Enrollment Fee</p>
                {appliedCoupon && getCouponDiscount() > 0 && (
                  <p className="text-sm text-slate-400 line-through">₹{originalPrice.toLocaleString()}</p>
                )}
                <p className="text-2xl font-bold text-slate-900">₹{displayPrice.toLocaleString()}</p>
                {appliedCoupon && getCouponDiscount() > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">You save ₹{getCouponDiscount().toLocaleString()} with {appliedCoupon.code}</p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Enroll in {program.name}</h1>
              <p className="text-slate-500 mb-6">
                {step === 'info' && 'Complete the form below to proceed'}
                {step === 'payment' && 'Review and complete your payment'}
                {(step === 'success' || step === 'failure') && 'Enrollment process complete'}
              </p>

              <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      i < currentStepIndex
                        ? 'bg-green-600 text-white'
                        : i === currentStepIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                    }`}>
                      {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`text-sm font-medium hidden sm:inline ${
                      i <= currentStepIndex ? 'text-slate-900' : 'text-slate-400'
                    }`}>{s}</span>
                    {i < steps.length - 1 && (
                      <div className={`w-8 h-0.5 ${i < currentStepIndex ? 'bg-green-600' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              {error && step !== 'failure' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {step === 'info' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Full Name *</label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => updateForm({ fullName: e.target.value })}
                      placeholder="Enter your full name"
                      className="border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateForm({ email: e.target.value })}
                      placeholder="Enter your email"
                      className="border-slate-300"
                    />
                  </div>
                  <div>

                    <PhoneInput
                      value={formData.phoneNumber}
                      onChange={(num) => updateForm({ phoneNumber: num })}
                      onValidationChange={setPhoneValid}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => updateForm({ location: e.target.value })}
                      placeholder="City, State"
                      className="border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Goals / Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => updateForm({ notes: e.target.value })}
                      placeholder="Any specific goals or questions..."
                      rows={3}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => updateForm({ acceptTerms: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-600">
                      I agree to the <Link href="/terms" className="text-blue-600 hover:underline">terms and conditions</Link> and understand that enrollment is subject to successful payment.
                    </span>
                  </label>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Name</span>
                      <span className="text-sm font-medium text-slate-900">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Email</span>
                      <span className="text-sm font-medium text-slate-900">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Phone</span>
                      <span className="text-sm font-medium text-slate-900">{displayPhone(formData.phoneNumber)}</span>
                    </div>
                    {formData.location && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Location</span>
                        <span className="text-sm font-medium text-slate-900">{formData.location}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-200 pt-3">
                      <span className="text-sm text-slate-500">Program</span>
                      <span className="text-sm font-medium text-blue-600">{program.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">Fee</span>
                      <div className="text-right">
                        {appliedCoupon && getCouponDiscount() > 0 && (
                          <span className="text-sm text-slate-400 line-through mr-2">₹{originalPrice.toLocaleString()}</span>
                        )}
                        <span className="text-sm font-medium text-slate-900">₹{displayPrice.toLocaleString()}</span>
                      </div>
                    </div>
                    {appliedCoupon && getCouponDiscount() > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="text-sm">Coupon ({appliedCoupon.code})</span>
                        <span className="text-sm font-medium">-₹{getCouponDiscount().toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {!appliedCoupon && (
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="border-slate-300 font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-300 shrink-0"
                        onClick={applyCoupon}
                        disabled={applyingCoupon || !couponCode.trim()}
                      >
                        {applyingCoupon ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-green-50 rounded-xl p-3 border border-green-200">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{appliedCoupon.code} applied!</span>
                      </div>
                      <button type="button" onClick={removeCoupon} className="text-sm text-red-500 hover:text-red-700">Remove</button>
                    </div>
                  )}
                  {couponError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm text-red-600">{couponError}</p>
                    </div>
                  )}

                  {courses.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-slate-700 mb-2">Courses Included:</p>
                      <ul className="space-y-1">
                        {courses.map((c) => (
                          <li key={c.id} className="text-sm text-slate-600 flex items-center gap-2">
                            <Check className="h-3 w-3 text-blue-600 shrink-0" />
                            {c.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Secure payment powered by Razorpay</span>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Enrollment Confirmed!</h3>
                  <p className="text-slate-500 mb-6">
                    Your enrollment in <span className="font-medium text-blue-600">{program.name}</span> has been confirmed.
                    You will receive a confirmation email shortly.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link href="/dashboard">
                      <Button className="bg-blue-600 hover:bg-blue-700">Go to Dashboard</Button>
                    </Link>
                    <Link href="/programs">
                      <Button variant="outline">Browse More Programs</Button>
                    </Link>
                  </div>
                </div>
              )}

              {step === 'failure' && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Failed</h3>
                  <p className="text-slate-500 mb-6">
                    {error || 'Something went wrong with your payment. Please try again.'}
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button
                      onClick={() => {
                        setStep('payment')
                        setError('')
                      }}
                      className="bg-blue-600 hover:bg-blue-700 gap-1"
                    >
                      <CreditCard className="h-4 w-4" />
                      Retry Payment
                    </Button>
                    <Link href={`/programs/${slug}`}>
                      <Button variant="outline">Back to Program</Button>
                    </Link>
                  </div>
                </div>
              )}

              {(step === 'info' || step === 'payment') && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                  <Button
                    variant="ghost"
                    onClick={() => step === 'payment' ? setStep('info') : router.back()}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {step === 'payment' ? 'Back' : 'Cancel'}
                  </Button>
                  {step === 'info' ? (
                    displayPrice > 0 ? (
                      <Button
                        onClick={() => setStep('payment')}
                        disabled={!canProceed || !formData.acceptTerms}
                        className="bg-blue-600 hover:bg-blue-700 gap-1"
                      >
                        Proceed to Pay
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={openRazorpay}
                        disabled={submitting || !canProceed || !formData.acceptTerms}
                        className="bg-green-600 hover:bg-green-700 gap-1"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            Enroll Free
                          </>
                        )}
                      </Button>
                    )
                  ) : (
                    <Button
                      onClick={openRazorpay}
                      disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          Pay Now ₹{displayPrice.toLocaleString()}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
