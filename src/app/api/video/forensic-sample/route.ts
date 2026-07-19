import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server-auth'
import { adminSupabase } from '@/lib/supabase/admin'
import { analyzeSample, flagSample } from '@/lib/video-forensic-detection'
import { logger } from '@/lib/logger'

const MAX_IMAGE_SIZE = 500 * 1024
const MIN_INTERVAL_MS = 30000

const lastSampleTimestamps = new Map<string, number>()

setInterval(() => {
  const cutoff = Date.now() - 300000
  for (const [key, ts] of lastSampleTimestamps) {
    if (ts < cutoff) lastSampleTimestamps.delete(key)
  }
}, 60000)

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const { lessonId, timestamp, currentTime, imageBase64, userAgent, screenWidth, screenHeight } = body

    if (!lessonId || !timestamp || !imageBase64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (typeof imageBase64 !== 'string' || imageBase64.length > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
    }

    const sampleKey = `${user.id}:${lessonId}`
    const lastTs = lastSampleTimestamps.get(sampleKey)
    if (lastTs && (Date.now() - lastTs) < MIN_INTERVAL_MS) {
      return NextResponse.json({ status: 'rate_limited' }, { status: 429 })
    }
    lastSampleTimestamps.set(sampleKey, Date.now())

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    const { data: inserted, error: insertErr } = await adminSupabase
      .from('video_forensic_samples')
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        sample_timestamp: new Date(timestamp).toISOString(),
        video_current_time: currentTime || 0,
        screenshot_b64: base64Data,
        user_agent: userAgent || null,
        screen_width: screenWidth || null,
        screen_height: screenHeight || null,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      })
      .select('id')
      .single()

    if (insertErr || !inserted) {
      return NextResponse.json({ status: 'ok' })
    }

    analyzeSample(user.id, lessonId, screenWidth || 0, screenHeight || 0)
      .then(async (result) => {
        if (result.flagged) {
          await flagSample(inserted.id, result.reason || 'Suspicious pattern detected', result.severity)
          logger.info('[Forensic] Auto-flagged sample ' + inserted.id + ' for user ' + user.id + ': ' + result.reason)
        }
      })
      .catch(() => {})

    return NextResponse.json({ status: 'ok' })
  } catch (err: unknown) {
    const status = err instanceof Error && 'statusCode' in err
      ? (err as { statusCode: number }).statusCode
      : 500
    return NextResponse.json({ error: 'Forensic sampling failed' }, { status })
  }
}