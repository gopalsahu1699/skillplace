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
    const eventType = payload.type || payload.event || ''

    const data = payload.data || payload
    const orderId = data.order?.order_id || data.order_id
    const paymentStatus = data.payment?.payment_status || data.payment_status || data.order_status || ''

    if (!orderId) {
      return NextResponse.json({ received: true, info: 'Missing order_id' })
    }

    const { data: existingPayment } = await adminSupabase
      .from('payments')
      .select('id, status, coupon_id, user_id, course_id, program_id, program_type')
      .eq('order_id', orderId)
      .maybeSingle()

    if (!existingPayment) {
      return NextResponse.json({ received: true, info: `Order ${orderId} not found in database`, event: eventType })
    }

    if (existingPayment.status === 'completed') {
      return NextResponse.json({ received: true, duplicate: true })
    }

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' && paymentStatus === 'SUCCESS') {
      const paymentId = data.payment?.cf_payment_id || data.cf_payment_id

      const updateData: Record<string, unknown> = {
        status: 'completed',
        updated_at: new Date().toISOString(),
      }

      if (paymentId) updateData.cf_payment_id = String(paymentId)

      if (data.payment?.payment_method) {
        updateData.payment_method = data.payment.payment_method
      }

      const { data: updatedWebhook, error: updateError } = await adminSupabase
        .from('payments')
        .update(updateData)
        .eq('id', existingPayment.id)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle()

      if (updateError) {
        console.error('Webhook: Failed to update payment status:', updateError)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      if (!updatedWebhook) {
        console.log(`Webhook: Payment ${existingPayment.id} already completed by verify route`)
        return NextResponse.json({ received: true, already_processed: true })
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
        let profileId = existingPayment.user_id

        if (!profileId) {
          const customerDetails = data.customer_details || {}
          const email = customerDetails.customer_email || data.customer_email || ''
          const name = customerDetails.customer_name || data.customer_name || 'Student'
          const phone = customerDetails.customer_phone || data.customer_phone || null

          if (email) {
            const { data: existingProfile } = await adminSupabase
              .from('profiles')
              .select('id')
              .eq('email', email)
              .maybeSingle()

            if (existingProfile) {
              profileId = existingProfile.id
              if (phone || name) {
                await adminSupabase
                  .from('profiles')
                  .update({
                    ...(name ? { full_name: name } : {}),
                    ...(phone ? { phone } : {}),
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', profileId)
              }
            } else {
              const { data: newProfile } = await adminSupabase
                .from('profiles')
                .insert({
                  email,
                  full_name: name,
                  phone: phone,
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
              await adminSupabase.from('payments').update({ user_id: profileId }).eq('id', existingPayment.id)
            }
          }
        }

        if (profileId) {
          const { data: enrollment } = await adminSupabase
            .from('enrollments')
            .select('id')
            .eq('user_id', profileId)
            .eq('program_id', existingPayment.program_id)
            .maybeSingle()

          if (!enrollment) {
            const { error: enrollError } = await adminSupabase
              .from('enrollments')
              .insert({
                user_id: profileId,
                program_id: existingPayment.program_id,
                status: 'active',
                selected_mode: existingPayment.program_type || null,
              })

            if (enrollError) {
              console.error('Webhook: Failed to create program enrollment:', enrollError)
            }
          }
        } else {
          console.error(`Webhook: CRITICAL - Payment ${existingPayment.id} completed but no profile found/created for enrollment`)
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

    if (paymentStatus === 'FAILED' || eventType === 'PAYMENT_FAILED_WEBHOOK') {
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
