import crypto from 'crypto'
import { adminSupabase } from '@/lib/supabase/admin'
import { getSignedPlaybackUrl } from '@/lib/cloudflare-stream'
import { r2Client, R2_BUCKET_NAME } from '@/lib/cloudflare-r2'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import type { AuthenticatedUser } from '@/lib/server-auth'

// ============================================
// Rate Limiting
// ============================================

const memoryStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number = 60000
): RateLimitResult {
  const windowKey = Math.floor(Date.now() / windowMs)
  const key = `${identifier}:${windowKey}`
  const now = Date.now()
  const resetTime = (windowKey + 1) * windowMs

  const existing = memoryStore.get(key)
  if (existing) {
    if (existing.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetIn: resetTime - now }
    }
    existing.count++
    return { allowed: true, remaining: maxRequests - existing.count, resetIn: resetTime - now }
  }

  memoryStore.set(key, { count: 1, resetTime })

  if (memoryStore.size > 10000) {
    const cutoff = now - windowMs * 2
    for (const [k, v] of memoryStore) {
      if (v.resetTime < cutoff) {
        memoryStore.delete(k)
      }
    }
  }

  return { allowed: true, remaining: maxRequests - 1, resetIn: resetTime - now }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  }
  if (!result.allowed) {
    headers['Retry-After'] = Math.ceil(result.resetIn / 1000).toString()
  }
  return headers
}

export function getRateLimitIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
}

setInterval(() => {
  const now = Date.now()
  for (const [key, record] of memoryStore.entries()) {
    if (now > record.resetTime) {
      memoryStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

// ============================================
// Playback Token
// ============================================

const VIDEO_SECRET: string = process.env.VIDEO_SECRET!
if (!VIDEO_SECRET) {
  throw new Error('VIDEO_SECRET environment variable is required')
}
const TOKEN_EXPIRY_SECONDS = 60
const TOKEN_VERSION = 1

export function generatePlaybackToken(
  userId: string,
  lessonId: string,
  courseId: string,
  expirySeconds: number = TOKEN_EXPIRY_SECONDS
): string {
  const nonce = crypto.randomBytes(16).toString('hex')
  const exp = Math.floor(Date.now() / 1000) + expirySeconds
  const payload = `${TOKEN_VERSION}:${userId}:${lessonId}:${courseId}:${exp}:${nonce}`
  const sig = crypto.createHmac('sha256', VIDEO_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

export function validatePlaybackToken(token: string): {
  valid: boolean
  userId?: string
  lessonId?: string
  courseId?: string
  error?: string
} {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const parts = decoded.split(':')
    if (parts.length !== 7) {
      return { valid: false, error: 'Invalid token format' }
    }

    const [version, userId, lessonId, courseId, expStr, nonce, sig] = parts

    if (parseInt(version, 10) !== TOKEN_VERSION) {
      return { valid: false, error: 'Invalid token version' }
    }

    const exp = parseInt(expStr, 10)
    if (Date.now() / 1000 > exp) {
      return { valid: false, error: 'Token expired' }
    }

    const expectedSig = crypto
      .createHmac('sha256', VIDEO_SECRET)
      .update(`${version}:${userId}:${lessonId}:${courseId}:${expStr}:${nonce}`)
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return { valid: false, error: 'Invalid token signature' }
    }

    return { valid: true, userId, lessonId, courseId }
  } catch {
    return { valid: false, error: 'Malformed token' }
  }
}

// ============================================
// Security Headers
// ============================================

export function getVideoStreamHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Content-Security-Policy': "default-src 'self'; media-src 'self' blob:; connect-src 'self'; style-src 'self' 'unsafe-inline'",
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  }
}

// ============================================
// Access Validation
// ============================================

export interface AccessValidation {
  allowed: boolean
  error?: string
  status?: number
  courseId?: string
  courseTitle?: string
  lessonTitle?: string
}

export async function validateVideoAccess(
  lessonId: string,
  user: AuthenticatedUser
): Promise<AccessValidation> {
  try {
    // Single query with joins to get lesson → module → course in one round trip
    const { data: lesson, error: lessonError } = await adminSupabase
      .from('lessons')
      .select('id, title, is_active, is_free, video_id, r2_source_key, video_url, content_type, module:module_id(course_id)')
      .eq('id', lessonId)
      .maybeSingle()

    if (lessonError || !lesson) {
      // Fallback: try without content_type column
      if (lessonError && lessonError.message?.includes('content_type')) {
        const { data: fallback } = await adminSupabase
          .from('lessons')
          .select('id, title, is_active, is_free, video_id, r2_source_key, video_url, module:module_id(course_id)')
          .eq('id', lessonId)
          .maybeSingle()
        if (!fallback) return { allowed: false, error: 'Lesson not found', status: 404 }
        const isVideo = !!(fallback.video_id || fallback.r2_source_key || fallback.video_url)
        return validateVideoAccessWithCourse(fallback as Record<string, unknown>, user, isVideo)
      }
      return { allowed: false, error: 'Lesson not found', status: 404 }
    }

    const isVideo = lesson.content_type === 'video' ||
      !!(lesson.video_id || lesson.r2_source_key || lesson.video_url)

    return validateVideoAccessWithCourse(lesson as Record<string, unknown>, user, !!isVideo)
  } catch {
    return { allowed: false, error: 'Access validation failed', status: 500 }
  }
}

async function validateVideoAccessWithCourse(
  lesson: Record<string, unknown>,
  user: AuthenticatedUser,
  isVideo: boolean
): Promise<AccessValidation> {
  if (!lesson.is_active) return { allowed: false, error: 'Lesson is not available', status: 403 }
  if (!isVideo) return { allowed: false, error: 'Lesson is not a video', status: 400 }

  const modRaw = lesson.module as unknown
  const modData = Array.isArray(modRaw) ? modRaw[0] : modRaw
  const courseId = modData?.course_id
  if (!courseId) return { allowed: false, error: 'Module not found', status: 404 }

  const { data: course } = await adminSupabase
    .from('courses')
    .select('id, title, is_active, price')
    .eq('id', courseId)
    .maybeSingle()
  if (!course) return { allowed: false, error: 'Course not found', status: 404 }
  if (!course.is_active) return { allowed: false, error: 'Course is not available', status: 403 }

  if (lesson.is_free) {
    return { allowed: true, courseId: course.id, courseTitle: course.title, lessonTitle: lesson.title as string }
  }

  const { data: courseEnrollment } = await adminSupabase
    .from('course_enrollments')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .in('status', ['active', 'completed'])
    .limit(1)
    .maybeSingle()
  if (courseEnrollment) {
    return { allowed: true, courseId: course.id, courseTitle: course.title, lessonTitle: lesson.title as string }
  }

  const { data: programEnrollments } = await adminSupabase
    .from('enrollments')
    .select('id, status, program_id')
    .eq('user_id', user.id)
    .in('status', ['active', 'completed'])
  if (programEnrollments && programEnrollments.length > 0) {
    const programIds = programEnrollments.map(e => e.program_id).filter(Boolean)
    if (programIds.length > 0) {
      const { data: programCourses } = await adminSupabase
        .from('program_courses')
        .select('course_id')
        .in('program_id', programIds)
        .eq('course_id', course.id)
      if (programCourses && programCourses.length > 0) {
        return { allowed: true, courseId: course.id, courseTitle: course.title, lessonTitle: lesson.title as string }
      }
    }
  }

  return { allowed: false, error: 'Enrollment required', status: 403 }
}

// ============================================
// Lesson Video Info
// ============================================

const lessonVideoCache = new Map<string, { videoId: string | null; r2Key: string | null; courseId: string; fetchedAt: number }>()
const CACHE_TTL = 60_000

async function getLessonVideoInfoRaw(lessonId: string): Promise<{
  videoId: string | null
  r2SourceKey: string | null
  streamStatus: string | null
  courseId: string
} | null> {
  // Single query with join to get module → course in one round trip
  const { data, error } = await adminSupabase
    .from('lessons')
    .select('video_id, r2_source_key, stream_status, video_url, module:module_id(course_id)')
    .eq('id', lessonId)
    .maybeSingle()

  if (error) return null
  if (!data) return null

  const moduleRaw = data.module as unknown
  const moduleData = Array.isArray(moduleRaw) ? moduleRaw[0] : moduleRaw

  return {
    videoId: data.video_id,
    r2SourceKey: data.r2_source_key || null,
    streamStatus: data.stream_status || null,
    courseId: moduleData?.course_id || '',
  }
}

export async function getLessonVideoInfo(lessonId: string): Promise<{
  videoId: string | null
  r2SourceKey: string | null
  streamStatus: string | null
  courseId: string
}> {
  const info = await getLessonVideoInfoRaw(lessonId)
  if (info) return info
  return { videoId: null, r2SourceKey: null, streamStatus: null, courseId: '' }
}

export async function getLessonVideoInfoCached(lessonId: string): ReturnType<typeof getLessonVideoInfo> {
  const cached = lessonVideoCache.get(lessonId)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return Promise.resolve({ videoId: cached.videoId, r2SourceKey: cached.r2Key, streamStatus: null, courseId: cached.courseId })
  }
  return getLessonVideoInfo(lessonId).then((info) => {
    lessonVideoCache.set(lessonId, { videoId: info.videoId, r2Key: info.r2SourceKey, courseId: info.courseId, fetchedAt: Date.now() })
    return info
  })
}

// ============================================
// Audit Logging
// ============================================

export interface VideoPlaybackLog {
  userId: string
  lessonId: string
  courseId?: string
  ipAddress?: string
  userAgent?: string
  action: 'stream' | 'token_generate' | 'token_refresh' | 'access_denied' | 'error'
  watchDurationSeconds?: number
  bytesServed?: number
  rangeRequested?: string
  success: boolean
  errorMessage?: string
  metadata?: Record<string, unknown>
}

export async function logVideoPlayback(entry: VideoPlaybackLog): Promise<void> {
  try {
    await adminSupabase.from('video_playback_log').insert({
      user_id: entry.userId,
      lesson_id: entry.lessonId,
      course_id: entry.courseId || null,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
      action: entry.action,
      watch_duration_seconds: entry.watchDurationSeconds || 0,
      bytes_served: entry.bytesServed || 0,
      range_requested: entry.rangeRequested || null,
      success: entry.success,
      error_message: entry.errorMessage || null,
      metadata: entry.metadata || {},
    }).then(() => {}, () => {})
  } catch {}
}

// ============================================
// Stream Proxy (Cloudflare Stream HLS)
// ============================================

const _CF_STREAM_DOMAIN = process.env.CLOUDFLARE_STREAM_DOMAIN || 'videodelivery.net'

// Cache signed playback URLs in memory to avoid Cloudflare API call per segment
const playbackUrlCache = new Map<string, { playbackUrl: string; expiresAt: number }>()
const PLAYBACK_URL_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getCachedPlaybackUrl(videoId: string): Promise<string> {
  const cached = playbackUrlCache.get(videoId)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.playbackUrl
  }

  // Request a 10-minute signed URL; cache for 5 minutes
  const { playbackUrl } = await getSignedPlaybackUrl(videoId, 10)
  playbackUrlCache.set(videoId, {
    playbackUrl,
    expiresAt: Date.now() + PLAYBACK_URL_CACHE_TTL,
  })

  return playbackUrl
}

// Clean expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of playbackUrlCache.entries()) {
    if (now > record.expiresAt) {
      playbackUrlCache.delete(key)
    }
  }
}, 5 * 60 * 1000)

export async function fetchAndRewriteManifest(
  videoId: string,
  proxyBaseUrl: string
): Promise<{ manifest: string; contentType: string }> {
  const playbackUrl = await getCachedPlaybackUrl(videoId)

  const response = await fetch(playbackUrl, {
    headers: { 'Accept': 'application/vnd.apple.mpegurl' },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch manifest: ${response.status}`)
  }

  const manifestText = await response.text()

  const rewritten = manifestText.split('\n').map((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('http') && !trimmed.startsWith('https')) {
      const segmentPath = trimmed.replace(/^\.\.\//, '')
      return `/api/video/${proxyBaseUrl}&seg=${encodeURIComponent(segmentPath)}`
    }
    if (trimmed.startsWith('http')) {
      const segmentPath = trimmed.replace(/^https?:\/\/[^/]+\//, '')
      return `/api/video/${proxyBaseUrl}&seg=${encodeURIComponent(segmentPath)}`
    }
    return line
  })

  return { manifest: rewritten.join('\n'), contentType: 'application/vnd.apple.mpegurl' }
}

export async function fetchStreamSegment(
  videoId: string,
  segmentPath: string
): Promise<{ body: ReadableStream<Uint8Array> | null; contentType: string; contentLength: number; status: number }> {
  const playbackUrl = await getCachedPlaybackUrl(videoId)
  const baseUrl = playbackUrl.replace('/manifest/video.m3u8', '')
  const segmentUrl = `${baseUrl}/${segmentPath}`

  const response = await fetch(segmentUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch segment: ${response.status}`)
  }

  return {
    body: response.body,
    contentType: response.headers.get('content-type') || 'video/MP2T',
    contentLength: parseInt(response.headers.get('content-length') || '0', 10),
    status: response.status,
  }
}

// ============================================
// R2 Stream Proxy (Direct video)
// ============================================

export async function proxyR2Video(
  r2SourceKey: string,
  rangeHeader?: string
): Promise<{
  body: ReadableStream<Uint8Array> | undefined
  contentLength: number
  contentType: string
  contentRange?: string
  statusCode: number
}> {
  const input: { Bucket: string; Key: string; Range?: string } = {
    Bucket: R2_BUCKET_NAME,
    Key: r2SourceKey,
  }

  if (rangeHeader) {
    input.Range = rangeHeader
  }

  const command = new GetObjectCommand(input)
  const response = await r2Client.send(command)

  const contentLength = parseInt(response.ContentLength?.toString() || '0', 10)
  const contentType = response.ContentType || 'video/mp4'

  const result: {
    body: ReadableStream<Uint8Array> | undefined
    contentLength: number
    contentType: string
    contentRange?: string
    statusCode: number
  } = {
    body: response.Body as ReadableStream<Uint8Array> | undefined,
    contentLength,
    contentType,
    statusCode: rangeHeader ? 206 : 200,
  }

  if (response.ContentRange) {
    result.contentRange = response.ContentRange
  }

  return result
}

// ============================================
// Origin / Referer Validation
// ============================================

export function validateOriginReferer(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const allowedDomains = [
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean).map(d => d?.replace(/\/+$/, ''))

  if (origin) {
    return allowedDomains.some(d => origin.startsWith(d!))
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer)
      return allowedDomains.some(d => {
        const allowedUrl = new URL(d!)
        return refererUrl.origin === allowedUrl.origin
      })
    } catch {
      return false
    }
  }

  return false
}
