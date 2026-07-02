import { NextRequest, NextResponse } from 'next/server'
import { generatePlaybackUrl } from '@/lib/cloudflare-r2'
import { adminSupabase } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/middleware'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lessonId = searchParams.get('lessonId')
  const courseId = searchParams.get('courseId')

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  if (courseId) {
    const { data: enrollment } = await adminSupabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
    }
  }

  const { data: lesson, error } = await adminSupabase
    .from('lessons')
    .select('r2_source_key, r2_original_filename')
    .eq('id', lessonId)
    .maybeSingle()

  if (error || !lesson || !lesson.r2_source_key) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  try {
    const playbackUrl = await generatePlaybackUrl(lesson.r2_source_key, 3600)

    return NextResponse.json({
      playbackUrl,
      filename: lesson.r2_original_filename,
      type: 'r2',
      expiresIn: 3600,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate playback URL'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
