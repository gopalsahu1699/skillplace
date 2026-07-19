import { NextRequest, NextResponse } from 'next/server'
import { generatePlaybackUrl } from '@/lib/cloudflare-r2'
import { importFromR2 } from '@/lib/cloudflare-stream'
import { adminSupabase } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId, r2Key, filename } = body

    if (!lessonId || !r2Key || !filename) {
      return NextResponse.json(
        { error: 'lessonId, r2Key, and filename are required' },
        { status: 400 }
      )
    }

    // Use a short-lived signed URL so Cloudflare Stream can pull the video
    // from R2 without making the bucket public
    const signedR2Url = await generatePlaybackUrl(r2Key, 3600)

    const { videoId, status } = await importFromR2(signedR2Url, filename, true)

    const { error: updateErr } = await adminSupabase
      .from('lessons')
      .update({
        video_id: videoId,
        r2_source_key: r2Key,
        r2_original_filename: filename,
        stream_status: status === 'processing' ? 'processing' : 'ready',
        video_url: null,
      })
      .eq('id', lessonId)

    if (updateErr) {
      logger.error('Failed to update lesson:', updateErr)
    }

    return NextResponse.json({
      success: true,
      videoId,
      status,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
