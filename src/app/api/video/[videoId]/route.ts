import { NextRequest, NextResponse } from 'next/server'
import { getSignedPlaybackUrl, getVideoStatus } from '@/lib/cloudflare-stream'
import { adminSupabase } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const courseId = searchParams.get('courseId')

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

  try {
    const status = await getVideoStatus(videoId)

    if (status.status.state !== 'ready') {
      return NextResponse.json({
        status: status.status,
        state: status.status.state,
      }, { status: 200 })
    }

    const { playbackUrl, expiresAt } = await getSignedPlaybackUrl(videoId, 120)

    return NextResponse.json({
      playbackUrl,
      embedUrl: `https://iframe.cloudflarestream.com/${videoId}`,
      thumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`,
      duration: status.duration,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
