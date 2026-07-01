import { NextRequest, NextResponse } from 'next/server'
import { generatePlaybackUrl } from '@/lib/cloudflare-r2'
import { adminSupabase } from '@/lib/supabase/admin'

/**
 * GET /api/video/r2-playback
 * Returns a presigned R2 playback URL for a lesson video (valid 1 hour).
 * The presigned URL includes authentication tokens so the browser can
 * stream directly from R2 with full range request support for seeking.
 *
 * Query: ?lessonId=xxx&courseId=xxx&userId=xxx
 *
 * Returns JSON: { playbackUrl, filename, type, expiresIn }
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

  try {
    // Generate a presigned URL (valid 1 hour) that allows direct browser access
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
