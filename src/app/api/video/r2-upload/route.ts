import { NextRequest, NextResponse } from 'next/server'
import { generateUploadUrl, getR2Key } from '@/lib/cloudflare-r2'
import { adminSupabase } from '@/lib/supabase/admin'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

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

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rateLimit = checkRateLimit(`r2-upload:${ip}`, 10, 60000)
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
    const { lessonId = 'temp', filename, contentType = 'video/mp4' } = body

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 })
    }

    const allowedExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv']
    const ext = '.' + filename.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json({ error: 'Invalid video file type' }, { status: 400 })
    }

    if (lessonId !== 'temp') {
      const { data: lesson, error: lessonErr } = await adminSupabase
        .from('lessons')
        .select('id')
        .eq('id', lessonId)
        .maybeSingle()

      if (lessonErr || !lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      }
    }

    const key = getR2Key(lessonId, filename)
    const uploadUrl = await generateUploadUrl(key, contentType, 3600)

    return NextResponse.json({
      uploadUrl,
      key,
      expiresIn: 3600,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
