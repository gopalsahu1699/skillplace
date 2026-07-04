import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminSupabase = createClient(supabaseUrl, serviceKey)

async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return false
  try {
    const { data: { user }, error } = await adminSupabase.auth.getUser(accessToken)
    if (error || !user) return false
    const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role === 'admin') return true
    const { data: emp } = await adminSupabase.from('employees').select('role').eq('email', user.email).maybeSingle()
    return emp?.role === 'admin'
  } catch {
    return false
  }
}

async function verifyAdminOrEmployee(request: NextRequest): Promise<boolean> {
  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return false
  try {
    const { data: { user }, error } = await adminSupabase.auth.getUser(accessToken)
    if (error || !user) return false
    const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role === 'admin') return true
    const { data: emp } = await adminSupabase.from('employees').select('id').eq('email', user.email).maybeSingle()
    return !!emp
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const isAuthed = await verifyAdminOrEmployee(request)
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    let query = adminSupabase
      .from('batches')
      .select('*, courses(title)')

    if (id) {
      query = query.eq('id', id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const batches = Array.isArray(data) ? data : [data]

    const batchesWithCounts = await Promise.all(
      batches.map(async (b: { id: string }) => {
        const { count } = await adminSupabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('batch_id', b.id)
        return { ...b, student_count: count || 0 }
      })
    )

    if (id) return NextResponse.json({ data: batchesWithCounts[0] })
    return NextResponse.json({ data: batchesWithCounts })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`batches-write:${ip}`, 20, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  const isAdmin = await verifyAdminSession(request)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1) {
      return NextResponse.json({ error: 'Batch name is required' }, { status: 400 })
    }

    const { data, error } = await adminSupabase
      .from('batches')
      .insert({
        name: body.name.trim(),
        description: body.description || null,
        course_id: body.course_id || null,
        program_type: body.program_type || 'online_course',
        start_date: body.start_date || null,
        end_date: body.end_date || null,
        is_active: body.is_active !== false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data }, { headers: rateLimitHeaders })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdminSession(request)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  try {
    const body = await request.json()
    const { data, error } = await adminSupabase
      .from('batches')
      .update({
        name: body.name,
        description: body.description,
        course_id: body.course_id,
        program_type: body.program_type,
        start_date: body.start_date,
        end_date: body.end_date,
        is_active: body.is_active,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminSession(request)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  try {
    const { error } = await adminSupabase.from('batches').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
