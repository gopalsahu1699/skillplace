import { NextRequest, NextResponse } from 'next/server'
import { createCashfreeOrder, getCashfreeEnv } from '@/lib/cashfree'
import { adminSupabase } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`course-order:${ip}`, 5, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { courseId, userId, couponCode } = await request.json()

    if (!courseId || !userId) {
      return NextResponse.json({ error: 'Missing courseId or userId' }, { status: 400 })
    }

    if (user.id !== userId) {
      return NextResponse.json({ error: 'User ID does not match authenticated user' }, { status: 403 })
    }

    const { data: course, error: courseError } = await adminSupabase
      .from('courses')
      .select('id, title, price, discount_price, slug')
      .eq('id', courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const { data: existingEnrollment } = await adminSupabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .limit(1)
      .maybeSingle()

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    }

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('email, phone')
      .eq('id', userId)
      .single()

    let amount = course.discount_price || course.price
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
      if (coupon.min_order_amount && amount < coupon.min_order_amount) {
        return NextResponse.json(
          { error: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}` },
          { status: 400 }
        )
      }

      let discountAmount = 0
      if (coupon.discount_type === 'percent') {
        discountAmount = Math.round(amount * coupon.discount_rate / 100)
        if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
          discountAmount = coupon.max_discount_amount
        }
      } else {
        discountAmount = Math.min(coupon.discount_rate, amount)
      }
      amount = amount - discountAmount
      couponId = coupon.id
    }

    if (amount <= 0) {
      const { data: enrollment, error: enrollError } = await adminSupabase
        .from('course_enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          status: 'active',
        })
        .select()
        .single()

      if (enrollError) throw enrollError

      if (couponId) {
        await adminSupabase.rpc('increment_coupon_usage', { p_coupon_id: couponId })
      }

      return NextResponse.json({
        success: true,
        free: true,
        enrollment,
        redirectUrl: `/courses/${course.slug}/learn`,
      })
    }

    const orderId = `crs_${userId.slice(0, 8)}_${courseId.slice(0, 8)}_${Date.now()}`.slice(0, 40)

    const cfOrder = await createCashfreeOrder({
      orderId,
      orderAmount: amount,
      orderCurrency: 'INR',
      customerId: userId,
      customerEmail: profile?.email || '',
      customerPhone: profile?.phone || '',
      returnUrl: `${BASE_URL}/api/payments/verify?order_id={order_id}`,
      notifyUrl: `${BASE_URL}/api/payment/webhook`,
    })

    await adminSupabase.from('payments').insert({
      user_id: userId,
      course_id: courseId,
      program_id: null,
      coupon_id: couponId,
      amount,
      currency: 'INR',
      order_id: cfOrder.orderId,
      cf_order_id: cfOrder.cfOrderId,
      cf_payment_session_id: cfOrder.paymentSessionId,
      status: 'pending',
    })

    return NextResponse.json({
      success: true,
      orderId: cfOrder.orderId,
      cfOrderId: cfOrder.cfOrderId,
      paymentSessionId: cfOrder.paymentSessionId,
      amount: cfOrder.orderAmount,
      currency: cfOrder.orderCurrency,
      env: getCashfreeEnv(),
      course: {
        title: course.title,
        slug: course.slug,
        price: course.price,
        discount_price: course.discount_price,
      },
    }, { headers: rateLimitHeaders })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: rateLimitHeaders })
  }
}
