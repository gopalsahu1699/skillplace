import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/cashfree'
import { adminSupabase } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-webhook-signature') || ''
    const timestamp = request.headers.get('x-webhook-timestamp') || ''

    if (!verifyWebhookSignature(rawBody, signature, timestamp)) {
      console.error('Webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const event = payload.type || payload.event

    const data = payload.data || payload
    const orderId = data.order?.order_id || data.order_id
    const paymentStatus = data.payment?.payment_status || data.payment_status || data.order_status

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    const { data: existingPayment } = await adminSupabase
      .from('payments')
      .select('id, status, coupon_id, user_id, course_id, program_id')
      .eq('order_id', orderId)
      .maybeSingle()

    if (!existingPayment) {
      console.error(`Webhook: Order ${orderId} not found in database`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (existingPayment.status === 'completed') {
      return NextResponse.json({ received: true, duplicate: true })
    }

    if (event === 'PAYMENT_SUCCESS_WEBHOOK' && paymentStatus === 'SUCCESS') {
      const paymentId = data.payment?.cf_payment_id || data.cf_payment_id

      const updateData: Record<string, unknown> = {
        status: 'completed',
        updated_at: new Date().toISOString(),
      }

      if (paymentId) updateData.cf_payment_id = String(paymentId)

      if (data.payment?.payment_method) {
        updateData.payment_method = data.payment.payment_method
      }

      const { error: updateError } = await adminSupabase
        .from('payments')
        .update(updateData)
        .eq('id', existingPayment.id)

      if (updateError) {
        console.error('Webhook: Failed to update payment status:', updateError)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      if (existingPayment.course_id) {
        const { data: enrollment } = await adminSupabase
          .from('course_enrollments')
          .select('id')
          .eq('user_id', existingPayment.user_id)
          .eq('course_id', existingPayment.course_id)
          .maybeSingle()

        if (!enrollment) {
          const { error: enrollError } = await adminSupabase
            .from('course_enrollments')
            .insert({
              user_id: existingPayment.user_id,
              course_id: existingPayment.course_id,
              status: 'active',
            })

          if (enrollError) {
            console.error('Webhook: Failed to create course enrollment:', enrollError)
          }
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
          const { error: enrollError } = await adminSupabase
            .from('enrollments')
            .insert({
              user_id: existingPayment.user_id,
              program_id: existingPayment.program_id,
              status: 'active',
            })

          if (enrollError) {
            console.error('Webhook: Failed to create program enrollment:', enrollError)
          }
        }
      }

      if (existingPayment.coupon_id) {
        const { error: couponError } = await adminSupabase
          .rpc('increment_coupon_usage', { p_coupon_id: existingPayment.coupon_id })

        if (couponError) {
          console.error('Webhook: Failed to increment coupon usage:', couponError)
        }
      }

      return NextResponse.json({ received: true, status: 'completed' })
    }

    if (paymentStatus === 'FAILED' || event === 'PAYMENT_FAILED_WEBHOOK') {
      const { error: updateError } = await adminSupabase
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
          ...(data.payment?.cf_payment_id ? { cf_payment_id: String(data.payment.cf_payment_id) } : {}),
        })
        .eq('id', existingPayment.id)

      if (updateError) {
        console.error('Webhook: Failed to update payment as failed:', updateError)
      }

      return NextResponse.json({ received: true, status: 'failed' })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
