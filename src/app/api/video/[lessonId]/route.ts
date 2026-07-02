import { NextRequest, NextResponse } from 'next/server'
import {
  validatePlaybackToken,
  checkRateLimit,
  getRateLimitHeaders,
  getRateLimitIdentifier,
  getVideoStreamHeaders,
  logVideoPlayback,
  getLessonVideoInfoCached,
  fetchAndRewriteManifest,
  fetchStreamSegment,
  proxyR2Video,
  validateOriginReferer,
} from '@/lib/video-proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const streamHeaders = getVideoStreamHeaders()
  const { lessonId } = await params
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const segmentPath = searchParams.get('seg')
  const ip = getRateLimitIdentifier(request)

  if (!token) {
    return NextResponse.json({ error: 'Playback token required' }, {
      status: 401,
      headers: streamHeaders,
    })
  }

  const tokenValidation = validatePlaybackToken(token)
  if (!tokenValidation.valid) {
    return NextResponse.json({ error: tokenValidation.error || 'Invalid token' }, {
      status: 401,
      headers: streamHeaders,
    })
  }

  if (tokenValidation.lessonId !== lessonId) {
    return NextResponse.json({ error: 'Token mismatch' }, {
      status: 403,
      headers: streamHeaders,
    })
  }

  const rlKey = segmentPath
    ? `video-seg:${tokenValidation.userId}:${ip}`
    : `video-manifest:${tokenValidation.userId}:${ip}`
  const rlMax = segmentPath ? 300 : 20
  const rateLimit = checkRateLimit(rlKey, rlMax, 60000)
  const rateLimitHeaders = getRateLimitHeaders(rateLimit)

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { ...rateLimitHeaders, ...streamHeaders },
    })
  }

  if (process.env.NODE_ENV === 'production') {
    const isValidOrigin = validateOriginReferer(request)
    if (!isValidOrigin) {
      await logVideoPlayback({
        userId: tokenValidation.userId!,
        lessonId,
        courseId: tokenValidation.courseId,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || undefined,
        action: 'access_denied',
        success: false,
        errorMessage: 'Invalid origin/referer',
        metadata: {
          origin: request.headers.get('origin'),
          referer: request.headers.get('referer'),
        },
      })
      return NextResponse.json({ error: 'Access denied' }, {
        status: 403,
        headers: streamHeaders,
      })
    }
  }

  try {
    if (segmentPath) {
      const videoInfo = await getLessonVideoInfoCached(lessonId)
      if (!videoInfo.videoId) {
        return NextResponse.json({ error: 'Video not found' }, {
          status: 404,
          headers: { ...rateLimitHeaders, ...streamHeaders },
        })
      }

      const segResponse = await fetchStreamSegment(videoInfo.videoId, segmentPath)

      await logVideoPlayback({
        userId: tokenValidation.userId!,
        lessonId,
        courseId: tokenValidation.courseId,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || undefined,
        action: 'stream',
        success: true,
        bytesServed: segResponse.contentLength,
        metadata: { segmentPath, type: 'hls_segment' },
      })

      return new Response(segResponse.body, {
        status: segResponse.status,
        headers: {
          'Content-Type': segResponse.contentType,
          'Content-Length': segResponse.contentLength.toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...streamHeaders,
          ...rateLimitHeaders,
        },
      })
    }

    const videoInfo = await getLessonVideoInfoCached(lessonId)

    if (videoInfo.videoId) {
      const proxyBaseUrl = `${lessonId}?token=${token}`
      const manifestResult = await fetchAndRewriteManifest(videoInfo.videoId, proxyBaseUrl)

      await logVideoPlayback({
        userId: tokenValidation.userId!,
        lessonId,
        courseId: tokenValidation.courseId,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || undefined,
        action: 'stream',
        success: true,
        metadata: { type: 'hls_manifest' },
      })

      return new Response(manifestResult.manifest, {
        status: 200,
        headers: {
          'Content-Type': manifestResult.contentType,
          'Content-Length': Buffer.byteLength(manifestResult.manifest).toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...streamHeaders,
          ...rateLimitHeaders,
        },
      })
    }

    if (videoInfo.r2SourceKey) {
      const rangeHeader = request.headers.get('range') || undefined
      const streamResult = await proxyR2Video(videoInfo.r2SourceKey, rangeHeader)

      if (!streamResult.body) {
        return NextResponse.json({ error: 'Video stream unavailable' }, {
          status: 500,
          headers: { ...rateLimitHeaders, ...streamHeaders },
        })
      }

      const responseHeaders: Record<string, string> = {
        'Content-Type': streamResult.contentType,
        'Content-Length': streamResult.contentLength.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...streamHeaders,
        ...rateLimitHeaders,
      }

      if (streamResult.contentRange) {
        responseHeaders['Content-Range'] = streamResult.contentRange
      }

      await logVideoPlayback({
        userId: tokenValidation.userId!,
        lessonId,
        courseId: tokenValidation.courseId,
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || undefined,
        action: 'stream',
        success: true,
        rangeRequested: rangeHeader,
        bytesServed: streamResult.contentLength,
        metadata: { type: 'r2_direct', httpStatus: streamResult.statusCode },
      })

      return new Response(streamResult.body as ReadableStream, {
        status: streamResult.statusCode,
        headers: responseHeaders,
      })
    }

    return NextResponse.json({ error: 'No video source available' }, {
      status: 404,
      headers: { ...rateLimitHeaders, ...streamHeaders },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'

    await logVideoPlayback({
      userId: tokenValidation.userId!,
      lessonId,
      courseId: tokenValidation.courseId,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || undefined,
      action: 'error',
      success: false,
      errorMessage: message,
    })

    return NextResponse.json({ error: message }, {
      status: 500,
      headers: { ...rateLimitHeaders, ...streamHeaders },
    })
  }
}
