import { NextRequest, NextResponse } from 'next/server'
import { fetchCashfreePayments, fetchCashfreeOrder } from '@/lib/cashfree'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { validatePhoneServer } from '@/lib/validation/phone-server'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`program-verify:${ip}`, 10, 60000)
  if (!rateLimit.allowed) {
    return NextResponse.redirect(new URL('/enroll/error?reason=rate_limit', request.url))
  }

  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('order_id')
  const paymentSessionId = searchParams.get('payment_session_id')
  console.log(`[verify-payment] GET called - orderId: ${orderId}, paymentSessionId: ${paymentSessionId}`)

  try {
    if (!orderId) {
      console.error('[verify-payment] Missing order_id parameter')
      return NextResponse.redirect(new URL('/enroll/error?reason=missing_order', request.url))
    }

    const { data: payment, error: dbError } = await adminSupabase
      .from('payments')
      .select('*, training_programs(slug)')
      .eq('order_id', orderId)
      .single()

    if (dbError || !payment) {
      console.error(`[verify-payment] Payment not found for order ${orderId}:`, dbError)
      return NextResponse.redirect(new URL('/enroll/error?reason=not_found', request.url))
    }

    console.log(`[verify-payment] Payment found - id: ${payment.id}, status: ${payment.status}`)

    if (payment.status === 'completed') {
      console.log(`[verify-payment] Payment ${orderId} already completed`)
      const slug = (payment as any).training_programs?.slug
      if (slug) {
        return NextResponse.redirect(new URL(`/programs/${slug}/learn`, request.url))
      }
      return NextResponse.redirect(new URL('/enroll/success', request.url))
    }

    console.log(`[verify-payment] Fetching payments from Cashfree for order ${orderId}`)
    const payments = await fetchCashfreePayments(orderId)
    console.log(`[verify-payment] Cashfree payments response:`, JSON.stringify(payments))

    const successfulPayment = payments.find((p) => p.paymentStatus === 'SUCCESS')

    if (!successfulPayment) {
      const statuses = payments.map((p) => p.paymentStatus).join(', ')
      console.log(`[verify-payment] No SUCCESS payment found for order ${orderId}. Statuses: [${statuses}]`)
      return NextResponse.redirect(new URL(`/enroll/status?order_id=${orderId}&status=failed`, request.url))
    }

    console.log(`[verify-payment] SUCCESS payment found - cfPaymentId: ${successfulPayment.cfPaymentId}`)

    // Atomic transition: only update if still pending (prevents double-run from webhook + return URL)
    const { data: updated, error: updateError } = await adminSupabase
      .from('payments')
      .update({
        status: 'completed',
        cf_payment_id: String(successfulPayment.cfPaymentId),
        payment_id: successfulPayment.paymentId,
        payment_method: successfulPayment.paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)
      .eq('status', 'pending') // only update if still pending
      .select('id')
      .maybeSingle()

    if (updateError) {
      console.error('[verify-payment] Failed to update payment status:', updateError)
      return NextResponse.redirect(new URL('/enroll/error?reason=verification_failed', request.url))
    }

    // If null, another process already completed this — just redirect successfully
    if (!updated) {
      console.log(`[verify-payment] Payment ${orderId} was already completed by another request`)
      const slug = (payment as any).training_programs?.slug
      if (slug) {
        return NextResponse.redirect(new URL(`/programs/${slug}/learn`, request.url))
      }
      return NextResponse.redirect(new URL('/enroll/success', request.url))
    }

      if (payment.program_id) {
      let profileId = payment.user_id

      if (!profileId) {
        try {
          const orderData = await fetchCashfreeOrder(orderId)
          const customerEmail = orderData.customer_details?.customer_email
          const customerName = orderData.customer_details?.customer_name || 'Student'
          const customerPhone = orderData.customer_details?.customer_phone || null

          if (customerEmail) {
            const { data: profile } = await adminSupabase
              .from('profiles')
              .select('id')
              .eq('email', customerEmail)
              .maybeSingle()

            if (profile) {
              profileId = profile.id
            } else {
              const { data: newProfile } = await adminSupabase
                .from('profiles')
                .insert({
                  email: customerEmail,
                  full_name: customerName,
                  phone: customerPhone,
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
              await adminSupabase.from('payments').update({ user_id: profileId }).eq('id', payment.id)
            }
          }
        } catch (err) {
          console.error('[verify-payment] Failed to fetch Cashfree order or resolve profile:', err)
        }
      }

      if (profileId) {
        const { data: existingEnrollment } = await adminSupabase
          .from('enrollments')
          .select('id')
          .eq('user_id', profileId)
          .eq('program_id', payment.program_id)
          .maybeSingle()

        if (!existingEnrollment) {
          const { error: enrollError } = await adminSupabase.from('enrollments').insert({
            user_id: profileId,
            program_id: payment.program_id,
            status: 'active',
            selected_mode: payment.program_type || null,
          })
          if (enrollError) {
            console.error('[verify-payment] Failed to create enrollment:', enrollError)
          }
        }
      } else {
        // Profile not found — log for admin to manually handle
        console.error(`[verify-payment] CRITICAL: Payment ${payment.id} completed but no profile found for enrollment. program_id: ${payment.program_id}`)
      }
    }

    if (payment.coupon_id) {
      await adminSupabase.rpc('increment_coupon_usage', { p_coupon_id: payment.coupon_id })
    }

    const slug = (payment as any).training_programs?.slug
    if (slug) {
      return NextResponse.redirect(new URL(`/programs/${slug}/learn`, request.url))
    }
    return NextResponse.redirect(new URL('/enroll/success', request.url))
  } catch (err) {
    console.error('programs/verify-payment GET error:', err)
    return NextResponse.redirect(new URL('/enroll/error?reason=verification_failed', request.url))
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`program-verify-post:${ip}`, 10, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  try {
    const {
      orderId,
      programId,
      studentName,
      email,
      phone,
      location,
      notes,
    } = await request.json()

    if (!orderId || !programId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: payment } = await adminSupabase
      .from('payments')
      .select('*, training_programs(slug)')
      .eq('order_id', orderId)
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const getRedirectUrl = () => {
      const slug = (payment as any).training_programs?.slug
      return slug ? `/programs/${slug}/learn` : '/enroll/success'
    }

    if (payment.status === 'completed') {
      return NextResponse.json({ success: true, redirectUrl: getRedirectUrl() })
    }

    const payments = await fetchCashfreePayments(orderId)
    const successfulPayment = payments.find((p) => p.paymentStatus === 'SUCCESS')

    if (!successfulPayment) {
      return NextResponse.json({ success: false, status: payment.status })
    }

    // Atomic transition: only update if still pending
    const { data: updated, error: updateError } = await adminSupabase
      .from('payments')
      .update({
        status: 'completed',
        cf_payment_id: String(successfulPayment.cfPaymentId),
        payment_id: successfulPayment.paymentId,
        payment_method: successfulPayment.paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    if (updateError) {
      console.error('[verify-payment POST] Failed to update payment status:', updateError)
      return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
    }

    // If updated is null, another process already completed this payment — just return success
    if (!updated) {
      return NextResponse.json({ success: true, paymentId: successfulPayment.cfPaymentId, redirectUrl: getRedirectUrl() })
    }

    const safePhone = phone ? (validatePhoneServer(phone).formatted || phone) : null

    let profileId = payment.user_id

    if (!profileId) {
      const { data: existingProfile } = await adminSupabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

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
        const { data: newProfile } = await adminSupabase
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

        if (newProfile) {
          profileId = newProfile.id
        }
      }

      if (profileId) {
        await adminSupabase.from('payments').update({ user_id: profileId }).eq('id', payment.id)
      }
    }

    if (profileId && programId) {
      const { data: existingEnrollment } = await adminSupabase
        .from('enrollments')
        .select('id')
        .eq('user_id', profileId)
        .eq('program_id', programId)
        .maybeSingle()

      if (!existingEnrollment) {
        await adminSupabase.from('enrollments').insert({
          user_id: profileId,
          program_id: programId,
          status: 'active',
          location: location || null,
          notes: notes || null,
          selected_mode: payment.program_type || null,
        })
      }
    }

    if (payment.coupon_id) {
      await adminSupabase.rpc('increment_coupon_usage', { p_coupon_id: payment.coupon_id })
    }

    return NextResponse.json({ success: true, paymentId: successfulPayment.cfPaymentId, redirectUrl: getRedirectUrl() })
  } catch (err) {
    console.error('programs/verify-payment POST error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
