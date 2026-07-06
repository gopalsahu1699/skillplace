import { NextRequest, NextResponse } from 'next/server'
import { fetchCashfreePayments } from '@/lib/cashfree'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`course-verify:${ip}`, 10, 60000)

  if (!rateLimit.allowed) {
    return NextResponse.redirect(new URL('/payment/error?reason=rate_limit', request.url))
  }

  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      return NextResponse.redirect(new URL('/payment/error?reason=missing_order', request.url))
    }

    const { data: payment } = await adminSupabase
      .from('payments')
      .select('*, courses!inner(slug)')
      .eq('order_id', orderId)
      .single()

    if (!payment) {
      return NextResponse.redirect(new URL('/payment/error?reason=not_found', request.url))
    }

    // Already completed — just redirect, do NOT re-increment coupon or re-enroll
    if (payment.status === 'completed') {
      return NextResponse.redirect(new URL(`/courses/${payment.courses?.slug}/learn`, request.url))
    }

    const payments = await fetchCashfreePayments(orderId)
    const successfulPayment = payments.find((p) => p.paymentStatus === 'SUCCESS')

    if (!successfulPayment) {
      return NextResponse.redirect(new URL(`/payment/status?order_id=${orderId}&status=failed`, request.url))
    }

    // Atomic update: only proceed if we are the one transitioning pending→completed
    const { data: updated, error: updateError } = await adminSupabase
      .from('payments')
      .update({
        status: 'completed',
        cf_payment_id: String(successfulPayment.cfPaymentId),
        payment_id: successfulPayment.paymentId,
        payment_method: successfulPayment.paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .eq('status', 'pending') // only update if still pending (prevents double-run)
      .select('id')
      .maybeSingle()

    if (updateError) {
      console.error('payments/verify: failed to update payment:', updateError)
      return NextResponse.redirect(new URL('/payment/error?reason=verification_failed', request.url))
    }

    // If updated is null, another request already completed this payment — just redirect
    if (!updated) {
      return NextResponse.redirect(new URL(`/courses/${payment.courses?.slug}/learn`, request.url))
    }

    const { data: existingEnrollment } = await adminSupabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', payment.user_id)
      .eq('course_id', payment.course_id)
      .maybeSingle()

    if (!existingEnrollment) {
      await adminSupabase.from('course_enrollments').insert({
        user_id: payment.user_id,
        course_id: payment.course_id,
        status: 'active',
      })
    }

    // Only increment coupon if webhook hasn't already done it
    // Webhook is the primary handler; this is the fallback for local/non-webhook environments
    if (payment.coupon_id) {
      await adminSupabase.rpc('increment_coupon_usage', { p_coupon_id: payment.coupon_id })
    }

    return NextResponse.redirect(new URL(`/courses/${payment.courses?.slug}/learn`, request.url))
  } catch (err) {
    console.error('payments/verify GET error:', err)
    return NextResponse.redirect(new URL('/payment/error?reason=verification_failed', request.url))
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`course-verify-post:${ip}`, 10, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  try {
    const { orderId, courseSlug } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const { data: payment } = await adminSupabase
      .from('payments')
      .select('*, courses!inner(slug)')
      .eq('order_id', orderId)
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Already completed — return success without re-running side effects
    if (payment.status === 'completed') {
      return NextResponse.json({ success: true, redirectUrl: `/courses/${payment.courses?.slug}/learn` })
    }

    const payments = await fetchCashfreePayments(orderId)
    const successfulPayment = payments.find((p) => p.paymentStatus === 'SUCCESS')

    if (!successfulPayment) {
      return NextResponse.json({ success: false, status: payment.status })
    }

    // Atomic transition: only update if still pending
    const { data: updated } = await adminSupabase
      .from('payments')
      .update({
        status: 'completed',
        cf_payment_id: String(successfulPayment.cfPaymentId),
        payment_id: successfulPayment.paymentId,
        payment_method: successfulPayment.paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    // Another request already handled this — just return success
    if (!updated) {
      return NextResponse.json({ success: true, redirectUrl: `/courses/${courseSlug || payment.courses?.slug}/learn` })
    }

    const { data: existingEnrollment } = await adminSupabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', payment.user_id)
      .eq('course_id', payment.course_id)
      .maybeSingle()

    if (!existingEnrollment) {
      await adminSupabase.from('course_enrollments').insert({
        user_id: payment.user_id,
        course_id: payment.course_id,
        status: 'active',
      })
    }

    if (payment.coupon_id) {
      await adminSupabase.rpc('increment_coupon_usage', { p_coupon_id: payment.coupon_id })
    }

    return NextResponse.json({ success: true, redirectUrl: `/courses/${courseSlug || payment.courses?.slug}/learn` })
  } catch (err) {
    console.error('payments/verify POST error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
