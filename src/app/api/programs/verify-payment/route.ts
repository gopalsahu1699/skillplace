import { NextResponse } from 'next/server'
import { verifyPaymentSignature, fetchPayment } from '@/lib/razorpay'
import { adminSupabase } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`verify-payment:${ip}`, 10, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders }
    )
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      programId,
      studentName,
      email,
      phone,
      location,
      notes,
    } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !programId) {
      return NextResponse.json(
        { error: 'Missing required payment fields' },
        { status: 400 }
      )
    }

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const payment = await fetchPayment(razorpay_payment_id)
    if (payment.status !== 'captured') {
      return NextResponse.json({ error: 'Payment not captured' }, { status: 400 })
    }

    // Find the payment record in our DB
    const { data: paymentRecord, error: recordError } = await adminSupabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('status', 'pending')
      .single()

    if (recordError || !paymentRecord) {
      // Already processed or not found — return success to avoid client errors
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
      }, { headers: rateLimitHeaders })
    }

    // Update payment record to completed
    await adminSupabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.id)

    let authUserId: string | null = null
    try {
      const supabase = await createSupabaseServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        authUserId = user.id
      }
    } catch {
      // Not authenticated, proceed without auth user
    }

    let profileId: string | null = paymentRecord.user_id

    // If no user_id on payment record, find/create profile
    if (!profileId) {
      const { data: existingProfile } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (existingProfile) {
        profileId = existingProfile.id
        await adminSupabase
          .from('profiles')
          .update({
            full_name: studentName,
            phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileId)
      } else {
        const { data: newProfile, error: profileError } = await adminSupabase
          .from('profiles')
          .insert({
            email,
            full_name: studentName,
            phone,
            role: 'student',
            is_active: true,
          })
          .select('id')
          .single()

        if (profileError) {
          return NextResponse.json(
            { error: 'Failed to create profile' },
            { status: 500 }
          )
        }
        profileId = newProfile.id
      }

      // Update payment record with user_id
      await adminSupabase
        .from('payments')
        .update({ user_id: profileId })
        .eq('id', paymentRecord.id)
    }

    const { data: enrollment, error: enrollmentError } = await adminSupabase
      .from('enrollments')
      .insert({
        user_id: profileId,
        program_id: programId,
        status: 'active',
        notes: notes || null,
      })
      .select('id')
      .single()

    if (enrollmentError) {
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      )
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

    return NextResponse.json({
      success: true,
      enrollmentId: enrollment.id,
      paymentId: razorpay_payment_id,
    }, { headers: rateLimitHeaders })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
