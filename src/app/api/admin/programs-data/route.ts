import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/security/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminSupabase = createClient(supabaseUrl, serviceKey)

async function verifyAdminSession(request: NextRequest): Promise<{ ok: boolean }> {
  const token = request.cookies.get('sb-access-token')?.value
  if (!token) return { ok: false }
  try {
    const { data: { user }, error } = await adminSupabase.auth.getUser(token)
    if (error || !user) return { ok: false }
    const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') return { ok: true }
    const { data: employee } = await adminSupabase.from('employees').select('role').eq('email', user.email).single()
    if (employee) return { ok: true }
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

  try {
    const [programsRes, branchesRes, coursesRes, pcRes] = await Promise.all([
      adminSupabase.from('training_programs').select('*,branches(name)').order('created_at', { ascending: false }),
      adminSupabase.from('branches').select('*').order('name'),
      adminSupabase.from('courses').select('*').order('created_at'),
      adminSupabase.from('program_courses').select('*').order('order_index'),
    ])

    return NextResponse.json({
      data: {
        programs: programsRes.data || [],
        branches: branchesRes.data || [],
        courses: coursesRes.data || [],
        programCourses: pcRes.data || [],
      },
    }, { headers: rateLimitHeaders })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500, headers: rateLimitHeaders })
  }
}
