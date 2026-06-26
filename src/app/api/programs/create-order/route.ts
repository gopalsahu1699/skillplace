import { NextResponse } from 'next/server'
import { razorpay, RAZORPAY_KEY_ID } from '@/lib/razorpay'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

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
    const { programId, programName, studentName, email, phone, couponCode } = await request.json()

    if (!programId || !studentName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (typeof studentName !== 'string' || studentName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Invalid student name' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const phoneRegex = /^[+]?[\d\s\-()]{7,15}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    const { data: program } = await adminSupabase
      .from('training_programs')
      .select('price, discount_price, name')
      .eq('id', programId)
      .single()

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    let amount = (program.discount_price || program.price) * 100
    let couponId: string | null = null

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const normalizedCode = couponCode.trim().toUpperCase()
      const { data: coupon } = await adminSupabase
        .from('coupons')
        .select('id, discount_type, discount_rate, min_order_amount, max_uses, used_count, valid_from, valid_until, is_active')
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
        return NextResponse.json(
          { error: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}` },
          { status: 400 }
        )
      }

      let discountAmount = 0
      if (coupon.discount_type === 'percent') {
        discountAmount = Math.round(basePrice * coupon.discount_rate / 100)
      } else {
        discountAmount = coupon.discount_rate
      }

      const finalPrice = Math.max(basePrice - discountAmount, 1)
      amount = finalPrice * 100
      couponId = coupon.id
    }

    const receiptId = `prog_${programId.slice(0, 8)}_${Date.now()}`.slice(0, 40)

    const orderNotes: Record<string, string> = {
      program_id: programId,
      program_name: programName || program.name,
      student_name: studentName,
      email,
      phone,
    }
    if (couponId) {
      orderNotes.coupon_id = couponId
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: receiptId,
      notes: orderNotes,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID,
    }, { headers: rateLimitHeaders })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
