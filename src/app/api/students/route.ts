import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validatePhoneServer } from '@/lib/validation/phone-server'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminSupabase = createClient(supabaseUrl, serviceKey)

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

async function verifyAdmin(request: NextRequest): Promise<boolean> {
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

export async function GET(request: NextRequest) {
  const isAuthed = await verifyAdminOrEmployee(request)
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batch_id')
  const programType = searchParams.get('program_type')
  const search = searchParams.get('search')

  try {
    let query = adminSupabase
      .from('profiles')
      .select('*, enrollments(id, status, courses(title))')
      .eq('role', 'student')

    if (batchId) {
      query = query.eq('batch_id', batchId)
    }

    if (programType) {
      query = query.eq('program_type', programType)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`students-write:${ip}`, 20, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: rateLimitHeaders })
  }

  const isAdmin = await verifyAdmin(request)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    if (Array.isArray(body)) {
      if (body.length > 100) {
        return NextResponse.json({ error: 'Maximum 100 students per batch request' }, { status: 400 })
      }
      const results = []
      for (const student of body) {
        if (!student.full_name || !student.email) {
          return NextResponse.json({ error: 'full_name and email are required for each student' }, { status: 400 })
        }
        if (student.phone) {
          const phoneValidation = validatePhoneServer(student.phone)
          if (!phoneValidation.valid) {
            return NextResponse.json(
              { error: `Invalid phone for student ${student.full_name}: ${phoneValidation.error}` },
              { status: 400 }
            )
          }
          student.phone = phoneValidation.formatted || student.phone
        }

        const { data, error } = await adminSupabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            full_name: student.full_name,
            email: student.email,
            phone: student.phone || null,
            location: student.location || null,
            program_type: student.program_type || 'online_course',
            batch_id: student.batch_id || null,
            role: 'student',
            is_active: true,
          })
          .select()
          .single()

        if (!error && data) results.push(data)
      }
      return NextResponse.json({ data: results })
    }

    if (!body.full_name || !body.email) {
      return NextResponse.json({ error: 'full_name and email are required' }, { status: 400 })
    }

    if (body.phone) {
      const phoneValidation = validatePhoneServer(body.phone)
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { error: phoneValidation.error || 'Invalid phone number' },
          { status: 400 }
        )
      }
      body.phone = phoneValidation.formatted || body.phone
    }

    const { data, error } = await adminSupabase
      .from('profiles')
      .insert({
        id: crypto.randomUUID(),
        full_name: body.full_name,
        email: body.email,
        phone: body.phone || null,
        location: body.location || null,
        program_type: body.program_type || 'online_course',
        batch_id: body.batch_id || null,
        role: 'student',
        is_active: body.is_active !== false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdmin(request)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  try {
    const body = await request.json()

    if (body.phone) {
      const phoneValidation = validatePhoneServer(body.phone)
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { error: phoneValidation.error || 'Invalid phone number' },
          { status: 400 }
        )
      }
      body.phone = phoneValidation.formatted || body.phone
    }

    const { data, error } = await adminSupabase
      .from('profiles')
      .update({
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        location: body.location,
        program_type: body.program_type,
        batch_id: body.batch_id,
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
  const isAdmin = await verifyAdmin(request)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const ids = searchParams.get('ids')

  try {
    if (ids) {
      const idList = ids.split(',')
      if (idList.length > 100) {
        return NextResponse.json({ error: 'Maximum 100 IDs per request' }, { status: 400 })
      }
      const { error } = await adminSupabase.from('profiles').delete().in('id', idList)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const { error } = await adminSupabase.from('profiles').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
