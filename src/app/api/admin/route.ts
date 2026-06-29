import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminSupabase = createClient(supabaseUrl, serviceKey)

const ALLOWED_TABLES = new Set([
  'branches',
  'courses',
  'training_programs',
  'program_courses',
  'profiles',
  'enrollments',
  'course_enrollments',
  'purchases',
  'payments',
  'testimonials',
  'leads',
  'modules',
  'lessons',
  'tests',
  'test_questions',
  'employees',
  'employee_permissions',
  'coupons',
  'students',
  'batches',
  'class_schedule',
  'scheduled_notifications',
  'notifications',
  'placements',
  'certificates',
  'user_sessions',
  'user_activity',
  'login_attempts',
  'revoked_tokens',
  'course_progress',
  'lesson_progress',
  'test_attempts',
])

async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  const supabaseAccessToken = request.cookies.get('sb-access-token')?.value
  const supabaseRefreshToken = request.cookies.get('sb-refresh-token')?.value
  if (!supabaseAccessToken) return false

  try {
    let { data: { user }, error } = await adminSupabase.auth.getUser(supabaseAccessToken)

    // If token expired, try to refresh using the refresh token
    if (error && supabaseRefreshToken) {
      try {
        const refreshed = await adminSupabase.auth.refreshSession({ refresh_token: supabaseRefreshToken })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const refreshedUser = (refreshed as any)?.data?.user
        if (refreshedUser) {
          user = refreshedUser
          error = null
        }
      } catch {
        // refresh failed, fall through to false
      }
    }

    if (error || !user) return false

    // Check profiles table first
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') return true

    // Fallback: check employees table (admins may not have a profile entry)
    const { data: employee } = await adminSupabase
      .from('employees')
      .select('role')
      .eq('email', user.email)
      .single()

    return employee?.role === 'admin'
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`admin:${ip}`, 60, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  const isAuthenticated = await verifyAdminSession(request)
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders })
  }

  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')
  const filter = searchParams.get('filter')
  const value = searchParams.get('value')
  const join = searchParams.get('join')

  if (!table || !ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400, headers: rateLimitHeaders })
  }

  try {
    let selectStr = '*'
    if (join) {
      const parts: string[] = []
      let depth = 0
      let current = ''
      for (const ch of join) {
        if (ch === '(') { depth++; current += ch }
        else if (ch === ')') { depth--; current += ch }
        else if (ch === ',' && depth === 0) {
          if (current.trim()) parts.push(current.trim())
          current = ''
        } else { current += ch }
      }
      if (current.trim()) parts.push(current.trim())
      selectStr = '*' + ',' + parts.map(t => t === '*' ? t : t.includes('(') ? t : `${t}(*)`).join(',')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = adminSupabase.from(table).select(selectStr)

    if (id) {
      query = query.eq('id', id).single()
    } else if (filter && value) {
      query = query.eq(filter, value)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400, headers: rateLimitHeaders })
    return NextResponse.json({ data }, { headers: rateLimitHeaders })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: rateLimitHeaders })
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`admin-write:${ip}`, 30, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  const isAuthenticated = await verifyAdminSession(request)
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders })
  }

  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')

  if (!table || !ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400, headers: rateLimitHeaders })
  }

  try {
    const body = await request.json()
    const { data, error } = await adminSupabase.from(table).insert(body).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 400, headers: rateLimitHeaders })
    return NextResponse.json({ data }, { headers: rateLimitHeaders })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: rateLimitHeaders })
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`admin-write:${ip}`, 30, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  const isAuthenticated = await verifyAdminSession(request)
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders })
  }

  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')

  if (!table || !ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400, headers: rateLimitHeaders })
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400, headers: rateLimitHeaders })
  }

  try {
    const body = await request.json()
    const { data, error } = await adminSupabase.from(table).update(body).eq('id', id).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 400, headers: rateLimitHeaders })
    return NextResponse.json({ data }, { headers: rateLimitHeaders })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: rateLimitHeaders })
  }
}

export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`admin-write:${ip}`, 30, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  const isAuthenticated = await verifyAdminSession(request)
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders })
  }

  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')

  if (!table || !ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400, headers: rateLimitHeaders })
  }

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400, headers: rateLimitHeaders })
  }

  try {
    const { error } = await adminSupabase.from(table).delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400, headers: rateLimitHeaders })
    return NextResponse.json({ success: true }, { headers: rateLimitHeaders })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: rateLimitHeaders })
  }
}
