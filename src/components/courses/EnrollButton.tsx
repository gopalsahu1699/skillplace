'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase/client'
import { notify } from '@/lib/notifications'
import { ShoppingCart, CheckCircle, Loader2, CreditCard, Lock, AlertCircle, X, Check } from 'lucide-react'

interface CouponData {
  id: string
  code: string
  discount_type: 'percent' | 'amount'
  discount_rate: number
}

interface EnrollButtonProps {
  courseId: string
  courseSlug: string
  price: number
  discountPrice: number | null
  title: string
  size?: 'default' | 'sm' | 'lg'
}

export default function EnrollButton({
  courseId,
  courseSlug,
  price,
  discountPrice,
  title,
  size = 'default',
}: EnrollButtonProps) {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; user_metadata?: Record<string, unknown>; email?: string } | null>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const basePrice = discountPrice || price
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === 'percent'
      ? Math.round(basePrice * appliedCoupon.discount_rate / 100)
      : Math.min(appliedCoupon.discount_rate, basePrice)
    : 0
  const finalPrice = Math.max(basePrice - couponDiscount, 0)
  const isFree = finalPrice === 0

  useEffect(() => {
    checkAuth()
  }, [courseId])

  async function checkAuth() {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    setUser(currentUser)

    if (currentUser) {
      const { data: enrollment } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('course_id', courseId)
        .maybeSingle()

      setEnrolled(!!enrollment)
    }
    setLoading(false)
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    setCouponError('')
    setAppliedCoupon(null)

    try {
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

  async function enrollFree() {
    if (!user) {
      notify.unauthorized()
      router.push('/login?redirectedFrom=/courses/' + courseSlug)
      return
    }

    setProcessing(true)
    setError('')
    const { error: enrollError } = await supabase.from('course_enrollments').insert({
      user_id: user.id,
      course_id: courseId,
      status: 'active',
    })

    if (enrollError) {
      setError('Failed to enroll. Please try again.')
      notify.enrollError()
      setProcessing(false)
      return
    }

    // Increment coupon used_count if a coupon was applied
    if (appliedCoupon) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('id', appliedCoupon.id)
        .single()

      if (coupon) {
        await supabase
          .from('coupons')
          .update({ used_count: (coupon.used_count || 0) + 1, updated_at: new Date().toISOString() })
          .eq('id', appliedCoupon.id)
      }
    }

    setEnrolled(true)
    notify.enrollSuccess(title)
    window.location.href = `/courses/${courseSlug}/learn`
  }

  async function initiatePayment() {
    if (!user) {
      notify.unauthorized()
      router.push('/login?redirectedFrom=/courses/' + courseSlug)
      return
    }

    setProcessing(true)
    setError('')

    try {
      notify.paymentRedirecting()
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, userId: user.id, couponCode: appliedCoupon?.code || null }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.includes('Authentication') || data.error?.includes('BAD_REQUEST')) {
          throw new Error('Payment gateway not configured. Please contact support.')
        }
        throw new Error(data.error || 'Payment initiation failed. Please try again.')
      }

      if (data.free) {
        setEnrolled(true)
        notify.enrollSuccess(title)
        window.location.href = data.redirectUrl
        return
      }

      if (data.success === false && data.orderId) {
        openRazorpayCheckout(data)
      } else {
        throw new Error('Unexpected response from payment server')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
      notify.paymentError(message)
    }

    setProcessing(false)
  }

  function openRazorpayCheckout(data: { key: string; amount: number; currency: string; orderId: string }) {
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'Skillplace Academy',
      description: title,
      order_id: data.orderId,
      image: '/logo.png',
      handler: async function (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) {
        setProcessing(true)
        setError('')
        try {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            setEnrolled(true)
            notify.paymentSuccess()
            window.location.href = verifyData.redirectUrl
          } else {
            setError('Payment verification failed. Please contact support.')
            notify.paymentError('Payment verification failed.')
          }
        } catch {
          setError('Payment verification failed. Please try again.')
          notify.paymentError('Payment verification failed.')
        }
        setProcessing(false)
      },
      prefill: {
        name: user?.user_metadata?.full_name as string || '',
        email: user?.email || '',
      },
      theme: {
        color: '#2563eb',
      },
      modal: {
        ondismiss: function () {
          setProcessing(false)
        },
      },
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      const rzp = new (window as unknown as { Razorpay: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay(options)
      rzp.open()
    }
    script.onerror = () => {
      setError('Failed to load payment gateway. Please try again.')
      notify.paymentError('Failed to load payment gateway.')
      setProcessing(false)
    }
    document.body.appendChild(script)
  }

  if (enrolled) {
    return (
      <a href={`/courses/${courseSlug}/learn`}>
        <Button size={size} className="w-full bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Continue Learning
        </Button>
      </a>
    )
  }

  if (loading) {
    return (
      <Button size={size} disabled className="w-full">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  return (
    <div className="space-y-3">
      {!isFree && (
        <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Course Price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">₹{finalPrice.toLocaleString()}</span>
              {finalPrice < basePrice && (
                <span className="text-sm text-slate-400 line-through">₹{basePrice.toLocaleString()}</span>
              )}
            </div>
            {finalPrice < basePrice && (
              <span className="text-xs text-green-600 font-medium">
                Save ₹{(basePrice - finalPrice).toLocaleString()}
                {appliedCoupon && ` (coupon: ${appliedCoupon.code})`}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Includes</p>
            <p className="text-xs text-slate-700">Lifetime access</p>
            <p className="text-xs text-slate-700">Certificate</p>
          </div>
        </div>
      )}

      {/* Coupon Section */}
      {!isFree && (
        <div className="space-y-2">
          {!appliedCoupon ? (
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="border-slate-300 font-mono text-sm"
                onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
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
          ) : (
            <div className="flex items-center justify-between bg-green-50 rounded-xl p-3 border border-green-200">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{appliedCoupon.code} applied!</span>
                <span className="text-xs text-green-600">-₹{couponDiscount.toLocaleString()}</span>
              </div>
              <button type="button" onClick={removeCoupon} className="text-sm text-red-500 hover:text-red-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {couponError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-2">
              <AlertCircle className="h-3 w-3 text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{couponError}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isFree ? (
        <Button
          size={size}
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={enrollFree}
          disabled={processing}
        >
          {processing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          Enroll Free
        </Button>
      ) : (
        <Button
          size={size}
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={initiatePayment}
          disabled={processing}
        >
          {processing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CreditCard className="h-4 w-4 mr-2" />
          )}
          Enroll Now — ₹{finalPrice.toLocaleString()}
        </Button>
      )}

      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Lock className="h-3 w-3" />
          Secure Payment
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <CreditCard className="h-3 w-3" />
          UPI, Card, Netbanking
        </div>
      </div>
    </div>
  )
}
