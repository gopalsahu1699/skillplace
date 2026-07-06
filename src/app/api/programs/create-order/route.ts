import { NextResponse } from 'next/server'
import { createCashfreeOrder, getCashfreeEnv } from '@/lib/cashfree'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { validatePhoneServer } from '@/lib/validation/phone-server'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`create-order:${ip}`, 5, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders }
    )
  }

  try {
    const { programId, studentName, email, phone, couponCode } = await request.json()

    if (!programId || !studentName || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (typeof studentName !== 'string' || studentName.trim().length < 2) {
      return NextResponse.json({ error: 'Invalid student name' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const phoneValidation = validatePhoneServer(phone)
    if (!phoneValidation.valid) {
      return NextResponse.json({ error: phoneValidation.error || 'Invalid phone number' }, { status: 400 })
    }
    const safePhone = phoneValidation.formatted || phone

    const { data: program } = await adminSupabase
      .from('training_programs')
      .select('price, discount_price, name')
      .eq('id', programId)
      .single()

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    let amount = (program.discount_price || program.price)
    let couponId: string | null = null

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const normalizedCode = couponCode.trim().toUpperCase()
      const { data: coupon } = await adminSupabase
        .from('coupons')
        .select('id, discount_type, discount_rate, max_discount_amount, min_order_amount, max_uses, used_count, valid_from, valid_until, is_active')
        .eq('code', normalizedCode)
        .single()

      if (!coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
      }

      if (!coupon.is_active) {
        return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 })
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
      }

      if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
        return NextResponse.json({ error: 'This coupon is not yet valid' }, { status: 400 })
      }

      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
      }

      const basePrice = program.discount_price || program.price
      if (coupon.min_order_amount && basePrice < coupon.min_order_amount) {
        return NextResponse.json({ error: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}` }, { status: 400 })
      }

      let discountAmount = 0
      if (coupon.discount_type === 'percent') {
        discountAmount = Math.round(basePrice * coupon.discount_rate / 100)
        if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
          discountAmount = coupon.max_discount_amount
        }
      } else {
        discountAmount = coupon.discount_rate
      }

      const finalPrice = basePrice - discountAmount

      if (finalPrice <= 0) {
        let profileId: string | null = null
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
              phone: safePhone,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profileId)
        } else {
          const { data: newProfile, error: profileError } = await adminSupabase
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

          if (profileError) {
            return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
          }
          profileId = newProfile.id
        }

        const { error: enrollmentError } = await adminSupabase
          .from('enrollments')
          .insert({
            user_id: profileId,
            program_id: programId,
            status: 'active',
            notes: null,
          })

        if (enrollmentError) {
          return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 })
        }

        const freeOrderId = `free_prg_${programId.slice(0, 8)}_${Date.now()}`.slice(0, 40)

        await adminSupabase.from('payments').insert({
          user_id: profileId,
          course_id: null,
          program_id: programId,
          coupon_id: coupon.id,
          amount: 0,
          currency: 'INR',
          order_id: freeOrderId,
          cf_order_id: freeOrderId,
          status: 'completed',
        })

        await adminSupabase.rpc('increment_coupon_usage', { p_coupon_id: coupon.id })

        return NextResponse.json({
          free: true,
          success: true,
        }, { headers: rateLimitHeaders })
      }

      amount = finalPrice
      couponId = coupon.id
    }

    const orderId = `prog_${programId.slice(0, 8)}_${Date.now()}`.slice(0, 40)
    const cfCustomerId = `prog_${safePhone}`

    console.log(`[create-order] Creating Cashfree order - orderId: ${orderId}, amount: ${amount}, currency: INR`)
    console.log(`[create-order] Customer - name: ${studentName}, email: ${email}, phone: ${safePhone}`)
    console.log(`[create-order] returnUrl: ${BASE_URL}/api/programs/verify-payment?order_id={order_id}`)
    console.log(`[create-order] notifyUrl: ${BASE_URL}/api/payment/webhook`)

    const cfOrder = await createCashfreeOrder({
      orderId,
      orderAmount: amount,
      orderCurrency: 'INR',
      customerId: cfCustomerId,
      customerName: studentName,
      customerEmail: email,
      customerPhone: safePhone,
      returnUrl: `${BASE_URL}/api/programs/verify-payment?order_id={order_id}`,
      notifyUrl: `${BASE_URL}/api/payment/webhook`,
    })

    console.log(`[create-order] Cashfree response - cfOrderId: ${cfOrder.cfOrderId}, paymentSessionId: ${cfOrder.paymentSessionId}, orderStatus: ${cfOrder.orderStatus}`)

    if (!cfOrder.paymentSessionId) {
      console.error('[create-order] Cashfree returned empty paymentSessionId')
      throw new Error('Cashfree failed to generate payment session')
    }

    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    const profileId = existingProfile?.id || null

    console.log(`[create-order] Saving payment record - profileId: ${profileId}, orderId: ${cfOrder.orderId}`)

    const { error: insertError } = await adminSupabase.from('payments').insert({
      user_id: profileId,
      course_id: null,
      program_id: programId,
      coupon_id: couponId,
      amount: amount,
      currency: 'INR',
      order_id: cfOrder.orderId,
      cf_order_id: cfOrder.cfOrderId,
      cf_payment_session_id: cfOrder.paymentSessionId,
      status: 'pending',
    })

    if (insertError) {
      console.error('[create-order] Failed to save payment record:', insertError)
      throw new Error('Failed to save payment record')
    }

    return NextResponse.json({
      orderId: cfOrder.orderId,
      cfOrderId: cfOrder.cfOrderId,
      paymentSessionId: cfOrder.paymentSessionId,
      amount: cfOrder.orderAmount,
      currency: cfOrder.orderCurrency,
      env: getCashfreeEnv(),
    }, { headers: rateLimitHeaders })
  } catch (error: unknown) {
    console.error('programs/create-order error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json(
      { error: message },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
