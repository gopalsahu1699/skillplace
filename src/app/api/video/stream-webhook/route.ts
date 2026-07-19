import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

/**
 * POST /api/video/stream-webhook
 * Called by Cloudflare Stream when video processing completes.
 * Body: { uid: string, status: { state: string }, duration?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, status, duration } = body

    if (!uid) {
      return NextResponse.json({ error: 'Missing video uid' }, { status: 400 })
    }

    const state = status?.state || 'unknown'
    const isReady = state === 'ready'

    // Update lesson record
    const update: Record<string, unknown> = {
      stream_status: isReady ? 'ready' : state,
    }

    if (isReady && duration) {
      update.duration_minutes = Math.ceil(duration / 60)
    }

    const { error } = await adminSupabase
      .from('lessons')
      .update(update)
      .eq('video_id', uid)

    if (error) {
      logger.error('Stream webhook: failed to update lesson:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
