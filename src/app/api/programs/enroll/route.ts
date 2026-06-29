import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`enroll:${ip}`, 5, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: rateLimitHeaders }
    )
  }

  try {
    const body = await request.json()
    const { full_name, email, phone, location, program_id, start_date, notes } = body

    if (!full_name || !email || !phone || !program_id) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, email, phone, program_id' },
        { status: 400 }
      )
    }

    if (typeof full_name !== 'string' || full_name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Invalid full name' },
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

    // Phone validation: accept international format like +91XXXXXXXXXX
    const phoneDigits = phone.replace(/[\s\-()]/g, '')
    if (phoneDigits.startsWith('91')) {
      if (!/^[6-9]\d{9}$/.test(phoneDigits.slice(2))) {
        return NextResponse.json(
          { error: 'Invalid Indian phone number. Format: +91XXXXXXXXXX' },
          { status: 400 }
        )
      }
    } else if (!/^\d{7,12}$/.test(phoneDigits)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    const { data: program } = await adminSupabase
      .from('training_programs')
      .select('id')
      .eq('id', program_id)
      .single()

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    let authUserId: string | null = null
    try {
      const supabase = await createSupabaseServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        authUserId = user.id
      }
    } catch {
      // Not authenticated, proceed without auth user
    }

    let profileId: string | null = null

    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      profileId = existingProfile.id
      await adminSupabase
        .from('profiles')
        .update({
          full_name,
          phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
    } else {
      const { data: newProfile, error: profileError } = await adminSupabase
        .from('profiles')
        .insert({
          email,
          full_name,
          phone,
          role: 'student',
          is_active: true,
        })
        .select('id')
        .single()

      if (profileError) {
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }
      profileId = newProfile.id
    }

    const { data: enrollment, error: enrollmentError } = await adminSupabase
      .from('enrollments')
      .insert({
        user_id: profileId,
        program_id,
        status: 'pending',
        notes: notes || null,
      })
      .select('id')
      .single()

    if (enrollmentError) {
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      enrollment_id: enrollment.id,
      message: 'Enrollment application submitted successfully',
    }, { headers: rateLimitHeaders })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500, headers: rateLimitHeaders }
    )
  }
}
