import { NextRequest, NextResponse } from 'next/server'
import { getR2Url } from '@/lib/cloudflare-r2'
import { adminSupabase } from '@/lib/supabase/admin'

/**
 * GET /api/video/r2-playback
 * Returns the R2 public URL for a lesson video.
 * Checks enrollment before allowing access.
 * Query: ?lessonId=xxx&userId=xxx&courseId=xxx
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lessonId = searchParams.get('lessonId')
  const userId = searchParams.get('userId')
  const courseId = searchParams.get('courseId')

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
  }

  // Check enrollment if userId and courseId provided
  if (userId && courseId) {
    const { data: enrollment } = await adminSupabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
    }
  }

  // Get the lesson's R2 key
  const { data: lesson, error } = await adminSupabase
    .from('lessons')
    .select('r2_source_key, r2_original_filename')
    .eq('id', lessonId)
    .maybeSingle()

  if (error || !lesson || !lesson.r2_source_key) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  const playbackUrl = getR2Url(lesson.r2_source_key)

  return NextResponse.json({
    playbackUrl,
    filename: lesson.r2_original_filename,
    type: 'r2',
  })
}
