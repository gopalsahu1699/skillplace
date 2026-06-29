import { NextRequest, NextResponse } from 'next/server'
import { createOrder, RAZORPAY_KEY_ID } from '@/lib/razorpay'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`course-order:${ip}`, 5, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  try {
    const { courseId, userId, couponCode } = await request.json()

    if (!courseId || !userId) {
      return NextResponse.json({ error: 'Missing courseId or userId' }, { status: 400 })
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

      // Increment coupon used_count if coupon was applied
      if (couponId) {
        const { data: coupon } = await adminSupabase
          .from('coupons')
          .select('used_count')
          .eq('id', couponId)
          .single()

        if (coupon) {
          await adminSupabase
            .from('coupons')
            .update({ used_count: (coupon.used_count || 0) + 1, updated_at: new Date().toISOString() })
            .eq('id', couponId)
        }
      }

      return NextResponse.json({
        success: true,
        free: true,
        enrollment,
        redirectUrl: `/courses/${course.slug}/learn`,
      })
    }

    const receipt = `crs_${userId.slice(0, 6)}_${courseId.slice(0, 6)}_${Date.now()}`.slice(0, 40)
    const orderNotes: Record<string, string> = {
      course_id: courseId,
      user_id: userId,
      course_title: course.title,
    }
    if (couponId) {
      orderNotes.coupon_id = couponId
    }

    const order = await createOrder(amount, 'INR', receipt, orderNotes)

    await adminSupabase.from('payments').insert({
      user_id: userId,
      course_id: courseId,
      program_id: null,
      coupon_id: couponId,
      amount,
      currency: 'INR',
      razorpay_order_id: order.id,
      status: 'pending',
    })

    return NextResponse.json({
      success: false,
      free: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID,
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
