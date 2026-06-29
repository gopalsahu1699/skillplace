import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentSignature, fetchPayment } from '@/lib/razorpay'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`course-verify:${ip}`, 10, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 })
    }

    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const payment = await fetchPayment(razorpay_payment_id)

    if (payment.status !== 'captured') {
      return NextResponse.json({ error: 'Payment not captured' }, { status: 400 })
    }

    const { data: paymentRecord, error: recordError } = await adminSupabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('status', 'pending')
      .single()

    if (recordError || !paymentRecord) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    const { data: updatedPayment } = await adminSupabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.id)
      .select()
      .single()

    const { data: existingEnrollment } = await adminSupabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', paymentRecord.user_id)
      .eq('course_id', paymentRecord.course_id)
      .limit(1)
      .maybeSingle()

    let enrollment = existingEnrollment
    if (!existingEnrollment) {
      const { data: newEnrollment, error: enrollError } = await adminSupabase
        .from('course_enrollments')
        .insert({
          user_id: paymentRecord.user_id,
          course_id: paymentRecord.course_id,
          status: 'active',
        })
        .select()
        .single()

      if (enrollError) throw enrollError
      enrollment = newEnrollment
    }

    // Increment coupon used_count if coupon was used
    // Safe from double-count: this route only processes payments with status='pending'
    // Once status is updated to 'completed', neither webhook nor verify will reprocess
    if (paymentRecord.coupon_id) {
      const { data: coupon } = await adminSupabase
        .from('coupons')
        .select('used_count')
        .eq('id', paymentRecord.coupon_id)
        .single()

      if (coupon) {
        await adminSupabase
          .from('coupons')
          .update({ used_count: (coupon.used_count || 0) + 1, updated_at: new Date().toISOString() })
          .eq('id', paymentRecord.coupon_id)
      }
    }

    const { data: course } = paymentRecord.course_id
      ? await adminSupabase.from('courses').select('slug').eq('id', paymentRecord.course_id).single()
      : { data: null }

    const redirectUrl = course?.slug
      ? `/courses/${course.slug}/learn`
      : '/programs'

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      enrollment,
      redirectUrl,
    }, { headers: rateLimitHeaders })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: rateLimitHeaders })
  }
}
