import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'
import { validateVideoAccess, getLessonVideoInfo, getVideoStreamHeaders, generatePlaybackToken } from '@/lib/video-proxy'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lessonId = searchParams.get('lessonId')

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
  }

  try {
    const user = await requireAuth()
    const access = await validateVideoAccess(lessonId, user)
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status || 403 })
    }

    const videoInfo = await getLessonVideoInfo(lessonId)
    if (!videoInfo.r2SourceKey) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Generate a short-lived token and return a proxied stream URL
    const token = generatePlaybackToken(user.id, lessonId, access.courseId!, 120)
    const streamUrl = `/api/video/${lessonId}?token=${token}`

    return NextResponse.json({
      streamUrl,
      lessonId,
      courseId: access.courseId,
      courseTitle: access.courseTitle,
      lessonTitle: access.lessonTitle,
      expiresIn: 120,
      type: 'r2',
    }, {
      headers: getVideoStreamHeaders(),
    })
  } catch (err: unknown) {
    const status = err instanceof Error && 'statusCode' in err
      ? (err as { statusCode: number }).statusCode
      : 500
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status })
  }
}
