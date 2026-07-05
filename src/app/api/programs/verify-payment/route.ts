import { NextRequest, NextResponse } from 'next/server'
import { fetchCashfreePayments, fetchCashfreeOrder } from '@/lib/cashfree'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { validatePhoneServer } from '@/lib/validation/phone-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('order_id')

    if (!orderId) {
      return NextResponse.redirect(new URL('/enroll/error?reason=missing_order', request.url))
    }

    const { data: payment } = await adminSupabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (!payment) {
      return NextResponse.redirect(new URL('/enroll/error?reason=not_found', request.url))
    }

    if (payment.status === 'completed') {
      return NextResponse.redirect(new URL('/enroll/success', request.url))
    }

    const payments = await fetchCashfreePayments(orderId)
    const successfulPayment = payments.find((p) => p.paymentStatus === 'SUCCESS')

    if (!successfulPayment) {
      return NextResponse.redirect(new URL(`/enroll/status?order_id=${orderId}&status=failed`, request.url))
    }

    const updateData: Record<string, unknown> = {
      status: 'completed',
      cf_payment_id: String(successfulPayment.cfPaymentId),
      payment_id: successfulPayment.paymentId,
      payment_method: successfulPayment.paymentMethod,
      updated_at: new Date().toISOString(),
    }

    await adminSupabase.from('payments').update(updateData).eq('id', payment.id)

    if (payment.program_id) {
      let profileId = payment.user_id

      if (!profileId) {
        try {
          const orderData = await fetchCashfreeOrder(orderId)
          const customerEmail = orderData.customer_details?.customer_email
          if (customerEmail) {
            const { data: profile } = await adminSupabase
              .from('profiles')
              .select('id')
              .eq('email', customerEmail)
              .maybeSingle()
            profileId = profile?.id || null
          }
        } catch {
          return NextResponse.redirect(new URL('/enroll/error?reason=profile_not_found', request.url))
        }
      }

      if (profileId) {
        const { data: existingEnrollment } = await adminSupabase
          .from('enrollments')
          .select('id')
          .eq('user_id', profileId)
          .eq('program_id', payment.program_id)
          .maybeSingle()

        if (!existingEnrollment) {
          await adminSupabase.from('enrollments').insert({
            user_id: profileId,
            program_id: payment.program_id,
            status: 'active',
          })
        }
      }
    }

    if (payment.coupon_id) {
      await adminSupabase.rpc('increment_coupon_usage', { p_coupon_id: payment.coupon_id })
    }

    return NextResponse.redirect(new URL('/enroll/success', request.url))
  } catch (err) {
    console.error('programs/verify-payment GET error:', err)
    return NextResponse.redirect(new URL('/enroll/error?reason=verification_failed', request.url))
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`program-verify-post:${ip}`, 10, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  try {
    const {
      orderId,
      programId,
      studentName,
      email,
      phone,
      location,
      notes,
    } = await request.json()

    if (!orderId || !programId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: payment } = await adminSupabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status === 'completed') {
      return NextResponse.json({ success: true })
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

    await adminSupabase.from('payments').update(updateData).eq('id', payment.id)

    const safePhone = phone ? (validatePhoneServer(phone).formatted || phone) : null

    let profileId = payment.user_id

    if (!profileId) {
      const { data: existingProfile } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existingProfile) {
        profileId = existingProfile.id
        await adminSupabase
          .from('profiles')
          .update({
            full_name: studentName,
            phone: safePhone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileId)
      } else {
        const { data: newProfile } = await adminSupabase
          .from('profiles')
          .insert({
            email,
            full_name: studentName,
            phone: safePhone,
            role: 'student',
            is_active: true,
          })
          .select('id')
          .single()

        if (newProfile) {
          profileId = newProfile.id
        }
      }

      if (profileId) {
        await adminSupabase.from('payments').update({ user_id: profileId }).eq('id', payment.id)
      }
    }

    if (profileId && programId) {
      const { data: existingEnrollment } = await adminSupabase
        .from('enrollments')
        .select('id')
        .eq('user_id', profileId)
        .eq('program_id', programId)
        .maybeSingle()

      if (!existingEnrollment) {
        await adminSupabase.from('enrollments').insert({
          user_id: profileId,
          program_id: programId,
          status: 'active',
          location: location || null,
          notes: notes || null,
        })
      }
    }

    if (payment.coupon_id) {
      await adminSupabase.rpc('increment_coupon_usage', { p_coupon_id: payment.coupon_id })
    }

    return NextResponse.json({ success: true, paymentId: successfulPayment.cfPaymentId })
  } catch (err) {
    console.error('programs/verify-payment POST error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
