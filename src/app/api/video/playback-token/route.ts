import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'
import {
  validateVideoAccess,
  getLessonVideoInfo,
  generatePlaybackToken,
  getRateLimitHeaders,
  getRateLimitIdentifier,
  checkRateLimit,
  getVideoStreamHeaders,
  logVideoPlayback,
} from '@/lib/video-proxy'

export async function GET(request: NextRequest) {
  const ip = getRateLimitIdentifier(request)
  const rateLimit = checkRateLimit(`playback-token:${ip}`, 10, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { ...rateLimitHeaders, ...getVideoStreamHeaders() },
    })
  }

  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, {
        status: 400,
        headers: { ...rateLimitHeaders, ...getVideoStreamHeaders() },
      })
    }

    const access = await validateVideoAccess(lessonId, user)

    if (!access.allowed) {
      await logVideoPlayback({
        userId: user.id,
        lessonId,
        courseId: access.courseId,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || undefined,
        action: 'access_denied',
        success: false,
        errorMessage: access.error,
        metadata: { reason: access.error },
      })

      return NextResponse.json({ error: access.error }, {
        status: access.status || 403,
        headers: { ...rateLimitHeaders, ...getVideoStreamHeaders() },
      })
    }

    const videoInfo = await getLessonVideoInfo(lessonId)

    const userRateLimit = checkRateLimit(`playback-token-user:${user.id}`, 20, 60000)
    if (!userRateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, {
        status: 429,
        headers: { ...getRateLimitHeaders(userRateLimit), ...getVideoStreamHeaders() },
      })
    }

    const token = generatePlaybackToken(user.id, lessonId, access.courseId!, 60)

    await logVideoPlayback({
      userId: user.id,
      lessonId,
      courseId: access.courseId,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || undefined,
      action: 'token_generate',
      success: true,
    })

    const streamUrl = `/api/video/${lessonId}?token=${token}`

    return NextResponse.json({
      token,
      streamUrl,
      lessonId,
      courseId: access.courseId,
      courseTitle: access.courseTitle,
      lessonTitle: access.lessonTitle,
      expiresIn: 60,
      source: {
        type: videoInfo.videoId ? 'stream' : videoInfo.r2SourceKey ? 'r2' : 'none',
      },
    }, {
      headers: { ...rateLimitHeaders, ...getVideoStreamHeaders() },
    })
  } catch (err) {
    const status = err instanceof Error && 'statusCode' in err
      ? (err as { statusCode: number }).statusCode
      : 500
    const message = err instanceof Error ? err.message : 'Internal server error'

    return NextResponse.json({ error: message }, {
      status,
      headers: { ...rateLimitHeaders, ...getVideoStreamHeaders() },
    })
  }
}
