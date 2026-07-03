import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import {
  initiateMultipartUpload,
  getPartUploadUrl,
  completeMultipartUpload,
  abortMultipartUpload,
  getR2Key,
  getPartCount,
  CHUNK_SIZE,
} from '@/lib/cloudflare-r2'

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('sb-access-token')?.value
  if (!token) return false

  try {
    const { data: { user }, error } = await adminSupabase.auth.getUser(token)
    if (error || !user) return false

    const { data: profile } = await adminSupabase
      .from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role === 'admin') return true

    const { data: emp } = await adminSupabase
      .from('employees').select('role').eq('email', user.email).maybeSingle()
    return emp?.role === 'admin'
  } catch {
    return false
  }
}

/**
 * POST /api/video/multipart/init
 * Initiate a multipart upload for large files.
 * Body: { filename: string, contentType?: string, lessonId?: string }
 */
export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { filename, contentType = 'video/mp4', lessonId = 'temp' } = body

    if (!filename) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 })
    }

    const key = getR2Key(lessonId, filename)
    const { uploadId } = await initiateMultipartUpload(key, contentType)

    return NextResponse.json({ uploadId, key, chunkSize: CHUNK_SIZE })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * GET /api/video/multipart/url?key=xxx&uploadId=xxx&partNumber=1
 * Get presigned URL for a specific part.
 */
export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const uploadId = searchParams.get('uploadId')
    const partNumber = Number(searchParams.get('partNumber'))

    if (!key || !uploadId || !partNumber) {
      return NextResponse.json({ error: 'key, uploadId, and partNumber are required' }, { status: 400 })
    }

    const url = await getPartUploadUrl(key, uploadId, partNumber)
    return NextResponse.json({ url, partNumber })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/video/multipart/complete
 * Complete the multipart upload.
 * Body: { key: string, uploadId: string, parts: { PartNumber: number, ETag: string }[] }
 */
export async function PUT(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { key, uploadId, parts } = body

    if (!key || !uploadId || !parts || !Array.isArray(parts)) {
      return NextResponse.json({ error: 'key, uploadId, and parts are required' }, { status: 400 })
    }

    await completeMultipartUpload(key, uploadId, parts)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/video/multipart/abort?key=xxx&uploadId=xxx
 * Abort a multipart upload (cleanup on failure).
 */
export async function DELETE(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const uploadId = searchParams.get('uploadId')

    if (!key || !uploadId) {
      return NextResponse.json({ error: 'key and uploadId are required' }, { status: 400 })
    }

    await abortMultipartUpload(key, uploadId)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export { getPartCount }
