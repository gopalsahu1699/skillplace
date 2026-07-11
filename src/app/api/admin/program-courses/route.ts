import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminSupabase = createClient(supabaseUrl, serviceKey)

async function verifyAdminSession(request: NextRequest): Promise<{ ok: boolean; userId?: string }> {
  const supabaseAccessToken = request.cookies.get('sb-access-token')?.value
  if (!supabaseAccessToken) return { ok: false }

  try {
    const { data: { user }, error } = await adminSupabase.auth.getUser(supabaseAccessToken)
    if (error || !user) return { ok: false }

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'admin') return { ok: true, userId: user.id }

    const { data: employee } = await adminSupabase
      .from('employees')
      .select('id, role')
      .eq('email', user.email)
      .single()
    if (employee?.role === 'admin') return { ok: true, userId: employee.id }
    if (employee) return { ok: true, userId: employee.id }

    return { ok: false }
  } catch {
    return { ok: false }
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`admin-write:${ip}`, 30, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  const authResult = await verifyAdminSession(request)
  if (!authResult.ok) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: rateLimitHeaders })
  }

  try {
    const { program_id, course_ids } = await request.json()
    if (!program_id || !Array.isArray(course_ids)) {
      return NextResponse.json({ error: 'Invalid payload: program_id and course_ids[] required' }, { status: 400, headers: rateLimitHeaders })
    }

    const { error: deleteError } = await adminSupabase
      .from('program_courses')
      .delete()
      .eq('program_id', program_id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400, headers: rateLimitHeaders })
    }

    if (course_ids.length === 0) {
      return NextResponse.json({ success: true, count: 0 }, { headers: rateLimitHeaders })
    }

    const inserts = course_ids.map((course_id: string, i: number) => ({
      program_id,
      course_id,
      order_index: i,
    }))

    const { data, error: insertError } = await adminSupabase
      .from('program_courses')
      .insert(inserts)
      .select()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400, headers: rateLimitHeaders })
    }

    return NextResponse.json({ success: true, count: data?.length || 0 }, { headers: rateLimitHeaders })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: rateLimitHeaders })
  }
}
