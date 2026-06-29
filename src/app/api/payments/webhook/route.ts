import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { adminSupabase } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || ''

    const isValid = verifyWebhookSignature(body, signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(body)
    const event = payload.event

    if (event === 'payment.captured') {
      const payment = payload.payload.payment.entity
      const orderId = payment.order_id
      const paymentId = payment.id

      const { data: paymentRecord } = await adminSupabase
        .from('payments')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .eq('status', 'pending')
        .single()

      if (paymentRecord) {
        await adminSupabase
          .from('payments')
          .update({
            razorpay_payment_id: paymentId,
            razorpay_signature: payment.signature || null,
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentRecord.id)

        // Resolve user_id if null (program payments may not have it at creation time)
        let resolvedUserId = paymentRecord.user_id
        if (!resolvedUserId) {
          // Try to find profile by email from Razorpay notes
          const email = payment.notes?.email
          if (email) {
            const { data: profile } = await adminSupabase
              .from('profiles')
              .select('id')
              .eq('email', email)
              .single()
            if (profile) {
              resolvedUserId = profile.id
              await adminSupabase
                .from('payments')
                .update({ user_id: resolvedUserId })
                .eq('id', paymentRecord.id)
            }
          }
        }

        // Course enrollment
        if (paymentRecord.course_id && resolvedUserId) {
          const { data: existingEnrollment } = await adminSupabase
            .from('course_enrollments')
            .select('id')
            .eq('user_id', resolvedUserId)
            .eq('course_id', paymentRecord.course_id)
            .limit(1)
            .maybeSingle()

          if (!existingEnrollment) {
            await adminSupabase.from('course_enrollments').insert({
              user_id: resolvedUserId,
              course_id: paymentRecord.course_id,
              status: 'active',
            })
          }
        }

        // Program enrollment
        if (paymentRecord.program_id && resolvedUserId) {
          const { data: existingEnrollment } = await adminSupabase
            .from('enrollments')
            .select('id')
            .eq('user_id', resolvedUserId)
            .eq('program_id', paymentRecord.program_id)
            .limit(1)
            .maybeSingle()

          if (!existingEnrollment) {
            await adminSupabase.from('enrollments').insert({
              user_id: resolvedUserId,
              program_id: paymentRecord.program_id,
              branch_id: null,
              status: 'active',
              program_type: 'online',
            })
          }
        }

        // Increment coupon used_count if coupon was used
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
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
