import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit'
import { logAuditEvent } from '@/lib/security/audit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in production')
}
const adminSupabase = createClient(supabaseUrl, serviceKey)

const ALLOWED_TABLES = new Set([
  'branches',
  'courses',
  'training_programs',
  'program_courses',
  'profiles',
  'students',
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
  'batches',
  'class_schedule',
  'scheduled_notifications',
  'notifications',
  'placements',
  'certificates',
  'course_progress',
  'lesson_progress',
  'test_attempts',
])

const READ_ONLY_TABLES = new Set([
  'user_sessions',
  'user_activity',
  'login_attempts',
  'revoked_tokens',
])

async function verifyAdminSession(request: NextRequest): Promise<{ ok: boolean; userId?: string; role?: string }> {
  const supabaseAccessToken = request.cookies.get('sb-access-token')?.value
  const supabaseRefreshToken = request.cookies.get('sb-refresh-token')?.value
  if (!supabaseAccessToken) return { ok: false }

  try {
    let { data: { user }, error } = await adminSupabase.auth.getUser(supabaseAccessToken)

    if (error && supabaseRefreshToken) {
      const refreshed = await adminSupabase.auth.refreshSession({ refresh_token: supabaseRefreshToken })
      const refreshedData = refreshed as { data: { user: typeof user } | null }
      const refreshedUser = refreshedData?.data?.user
      if (refreshedUser) {
        user = refreshedUser
        error = null
      }
    }

    if (error || !user) return { ok: false }

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') return { ok: true, userId: user.id, role: 'admin' }

    const { data: employee } = await adminSupabase
      .from('employees')
      .select('id, role')
      .eq('email', user.email)
      .single()

    if (employee?.role === 'admin') return { ok: true, userId: employee.id, role: 'admin' }

    if (employee) return { ok: true, userId: employee.id, role: employee.role }

    return { ok: false }
  } catch {
    return { ok: false }
  }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`admin:${ip}`, 60, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  const authResult = await verifyAdminSession(request)
  if (!authResult.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: rateLimitHeaders })
  }

  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')
  const filter = searchParams.get('filter')
  const value = searchParams.get('value')
  const join = searchParams.get('join')

  if (!table || !(ALLOWED_TABLES.has(table) || READ_ONLY_TABLES.has(table))) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400, headers: rateLimitHeaders })
  }

  try {
    // Build select string — use join if provided, otherwise select all columns
    const selectStr = join ? `*, ${join}` : '*'
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

  const authResult = await verifyAdminSession(request)
  if (!authResult.ok || authResult.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: rateLimitHeaders })
  }

  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')

  if (!table || !ALLOWED_TABLES.has(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400, headers: rateLimitHeaders })
  }

  try {
    const body = await request.json()

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers: rateLimitHeaders })
    }

    const { data, error } = await adminSupabase.from(table).insert(body).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 400, headers: rateLimitHeaders })

    await logAuditEvent({
      userId: authResult.userId,
      action: 'admin_action',
      resource: `${table}:create`,
      details: { table, data: body },
      ipAddress: ip,
      success: true,
    })

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

  const authResult = await verifyAdminSession(request)
  if (!authResult.ok || authResult.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: rateLimitHeaders })
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

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400, headers: rateLimitHeaders })
    }

    const { data, error } = await adminSupabase.from(table).update(body).eq('id', id).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 400, headers: rateLimitHeaders })

    await logAuditEvent({
      userId: authResult.userId,
      action: 'admin_action',
      resource: `${table}:update:${id}`,
      details: { table, id, changes: body },
      ipAddress: ip,
      success: true,
    })

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

  const authResult = await verifyAdminSession(request)
  if (!authResult.ok || authResult.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: rateLimitHeaders })
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

    await logAuditEvent({
      userId: authResult.userId,
      action: 'admin_action',
      resource: `${table}:delete:${id}`,
      details: { table, id },
      ipAddress: ip,
      success: true,
    })

    return NextResponse.json({ success: true }, { headers: rateLimitHeaders })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: rateLimitHeaders })
  }
}
