import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/cashfree'
import { adminSupabase } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-webhook-signature') || ''
    const timestamp = request.headers.get('x-webhook-timestamp') || ''

    if (!verifyWebhookSignature(rawBody, signature, timestamp)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const event = payload.type || payload.event

    if (event !== 'PAYMENT_SUCCESS_WEBHOOK') {
      return NextResponse.json({ received: true })
    }

    const data = payload.data || payload
    const orderId = data.order?.order_id || data.order_id
    const paymentId = data.payment?.cf_payment_id || data.cf_payment_id
    const paymentStatus = data.payment?.payment_status || data.payment_status

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    const { data: existingPayment } = await adminSupabase
      .from('payments')
      .select('id, status, coupon_id, user_id, course_id, program_id')
      .eq('order_id', orderId)
      .single()

    if (!existingPayment) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (existingPayment.status === 'completed') {
      return NextResponse.json({ received: true, duplicate: true })
    }

    if (paymentStatus === 'SUCCESS') {
      const updateData: Record<string, unknown> = {
        status: 'completed',
        updated_at: new Date().toISOString(),
      }

      if (paymentId) updateData.cf_payment_id = String(paymentId)

      if (data.payment?.payment_method) {
        updateData.payment_method = data.payment.payment_method
      }

      await adminSupabase.from('payments').update(updateData).eq('id', existingPayment.id)

      if (existingPayment.course_id) {
        const { data: enrollment } = await adminSupabase
          .from('course_enrollments')
          .select('id')
          .eq('user_id', existingPayment.user_id)
          .eq('course_id', existingPayment.course_id)
          .maybeSingle()

        if (!enrollment) {
          await adminSupabase.from('course_enrollments').insert({
            user_id: existingPayment.user_id,
            course_id: existingPayment.course_id,
            status: 'active',
          })
        }
      }

      if (existingPayment.program_id) {
        const { data: enrollment } = await adminSupabase
          .from('enrollments')
          .select('id')
          .eq('user_id', existingPayment.user_id)
          .eq('program_id', existingPayment.program_id)
          .maybeSingle()

        if (!enrollment) {
          await adminSupabase.from('enrollments').insert({
            user_id: existingPayment.user_id,
            program_id: existingPayment.program_id,
            status: 'active',
          })
        }
      }

      if (existingPayment.coupon_id) {
        await adminSupabase.rpc('increment_coupon_usage', { p_coupon_id: existingPayment.coupon_id })
      }
    } else if (paymentStatus === 'FAILED') {
      await adminSupabase
        .from('payments')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', existingPayment.id)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
