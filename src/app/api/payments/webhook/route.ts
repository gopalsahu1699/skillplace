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
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentRecord.id)

        const { data: existingEnrollment } = await adminSupabase
          .from('enrollments')
          .select('id')
          .eq('user_id', paymentRecord.user_id)
          .eq('program_id', paymentRecord.program_id)
          .limit(1)
          .maybeSingle()

        if (!existingEnrollment) {
          await adminSupabase.from('enrollments').insert({
            user_id: paymentRecord.user_id,
            program_id: paymentRecord.program_id,
            branch_id: null,
            status: 'active',
            program_type: 'online',
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
