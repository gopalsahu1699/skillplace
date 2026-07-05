import { NextRequest, NextResponse } from 'next/server'
import { fetchCashfreePayments } from '@/lib/cashfree'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`course-verify:${ip}`, 10, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

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

    if (payment.status === 'completed') {
      return NextResponse.redirect(new URL(`/courses/${payment.courses?.slug}/learn`, request.url))
    }

    const payments = await fetchCashfreePayments(orderId)
    const successfulPayment = payments.find((p) => p.paymentStatus === 'SUCCESS')

    if (!successfulPayment) {
      return NextResponse.redirect(new URL(`/payment/status?order_id=${orderId}&status=failed`, request.url))
    }

    const updateData: Record<string, unknown> = {
      status: 'completed',
      cf_payment_id: String(successfulPayment.cfPaymentId),
      payment_id: successfulPayment.paymentId,
      payment_method: successfulPayment.paymentMethod,
      updated_at: new Date().toISOString(),
    }

    await adminSupabase.from('payments').update(updateData).eq('order_id', orderId)

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
      const { data: coupon } = await adminSupabase
        .from('coupons')
        .select('used_count')
        .eq('id', payment.coupon_id)
        .single()

      if (coupon) {
        await adminSupabase
          .from('coupons')
          .update({ used_count: (coupon.used_count || 0) + 1, updated_at: new Date().toISOString() })
          .eq('id', payment.coupon_id)
      }
    }

    return NextResponse.redirect(new URL(`/courses/${payment.courses?.slug}/learn`, request.url))
  } catch {
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

    if (payment.status === 'completed') {
      return NextResponse.json({ success: true, redirectUrl: `/courses/${payment.courses?.slug}/learn` })
    }

    const payments = await fetchCashfreePayments(orderId)
    const successfulPayment = payments.find((p) => p.paymentStatus === 'SUCCESS')

    if (!successfulPayment) {
      return NextResponse.json({ success: false, status: payment.status })
    }

    const updateData: Record<string, unknown> = {
      status: 'completed',
      cf_payment_id: String(successfulPayment.cfPaymentId),
      payment_id: successfulPayment.paymentId,
      payment_method: successfulPayment.paymentMethod,
      updated_at: new Date().toISOString(),
    }

    await adminSupabase.from('payments').update(updateData).eq('order_id', orderId)

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
      const { data: coupon } = await adminSupabase
        .from('coupons')
        .select('used_count')
        .eq('id', payment.coupon_id)
        .single()

      if (coupon) {
        await adminSupabase
          .from('coupons')
          .update({ used_count: (coupon.used_count || 0) + 1, updated_at: new Date().toISOString() })
          .eq('id', payment.coupon_id)
      }
    }

    return NextResponse.json({ success: true, redirectUrl: `/courses/${courseSlug || payment.courses?.slug}/learn` })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
