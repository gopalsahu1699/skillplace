import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`coupon:${ip}`, 10, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders }
    )
  }

  try {
    const { code, amount } = await request.json()

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    if (amount === undefined || amount === null || typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    const normalizedCode = code.trim().toUpperCase()

    const { data: coupon, error } = await adminSupabase
      .from('coupons')
      .select('id, code, discount_type, discount_rate, max_discount_amount, min_order_amount, max_uses, used_count, valid_from, valid_until, is_active')
      .eq('code', normalizedCode)
      .single()

    if (error || !coupon) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    if (!coupon.is_active) {
      return NextResponse.json(
        { error: 'This coupon is no longer active' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json(
        { error: 'This coupon has expired' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    if (coupon.valid_from && new Date(coupon.valid_from) > new Date()) {
      return NextResponse.json(
        { error: 'This coupon is not yet valid' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json(
        { error: 'This coupon has reached its usage limit' },
        { status: 400, headers: rateLimitHeaders }
      )
    }

    if (coupon.min_order_amount && amount < coupon.min_order_amount) {
      return NextResponse.json(
        { error: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}` },
        { status: 400, headers: rateLimitHeaders }
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

    const finalPrice = Math.max(amount - discountAmount, 1)

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_rate: coupon.discount_rate,
      },
      discount_amount: discountAmount,
      original_amount: amount,
      final_amount: finalPrice,
    }, { headers: rateLimitHeaders })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to validate coupon' },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
