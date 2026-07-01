import { NextRequest, NextResponse } from 'next/server'
import { generateUploadUrl, getR2Key, getR2Url } from '@/lib/cloudflare-r2'
import { adminSupabase } from '@/lib/supabase/admin'

/**
 * POST /api/video/r2-upload
 * Generates a presigned R2 URL for direct browser upload.
 * Body: { lessonId?: string, filename: string, contentType?: string }
 *
 * For new lessons (no ID yet), pass lessonId: 'temp' — key will be under lessons/temp/
 * The key gets updated to the real lesson ID after creation via r2-to-stream or lesson update.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const cookieToken = request.cookies.get('sb-access-token')?.value

  // Verify admin session via cookie
  if (cookieToken) {
    const { data: { user }, error: authErr } = await adminSupabase.auth.getUser(cookieToken)
    if (!authErr && user) {
      const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (profile?.role !== 'admin') {
        const { data: emp } = await adminSupabase.from('employees').select('role').eq('email', user.email).maybeSingle()
        if (emp?.role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }
    }
  } else if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'cron-secret'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { lessonId = 'temp', filename, contentType = 'video/mp4' } = body

    if (!filename) {
      return NextResponse.json(
        { error: 'filename is required' },
        { status: 400 }
      )
    }

    // Verify lesson exists (skip for 'temp' IDs — new lesson not yet created)
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

    // Generate unique R2 key: lessons/{lessonId}/{timestamp}.{ext}
    const key = getR2Key(lessonId, filename)

    // Generate presigned URL (valid for 1 hour)
    const uploadUrl = await generateUploadUrl(key, contentType, 3600)

    // Build the public playback URL so the client can store it
    const playbackUrl = getR2Url(key)

    return NextResponse.json({
      uploadUrl,
      key,
      playbackUrl,
      expiresIn: 3600,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
