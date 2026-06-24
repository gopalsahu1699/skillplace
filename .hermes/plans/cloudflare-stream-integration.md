# Cloudflare Stream Integration — Complete Implementation

## Goal
Integrate Cloudflare Stream for video hosting and delivery:
1. Admin uploads videos → Cloudflare Stream → Returns video ID
2. Store video IDs in Supabase lessons table
3. Students play videos via Cloudflare Stream player with signed URLs
4. Watermark overlay with student name/email during playback
5. Anti-download protections via Cloudflare Stream security settings

## Prerequisites (User Will Provide)
```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=***
CLOUDFLARE_STREAM_DOMAIN=your-domain.cloudflarestream.com (or videodelivery.net)
```

## Architecture

```
Admin Upload → Next.js API → Cloudflare Stream API → Returns video ID
                                                      ↓
                              Store video_uid in Supabase lessons table
                                                      ↓
Student Watch → SecureVideoPlayer → Cloudflare Stream signed URL → Video.js/HLS player
                      ↓
              Watermark overlay (student name/email)
              Anti-download protections
              Progress tracking
```

## Tasks

### Step 1: Create `src/lib/cloudflare-stream.ts`

Cloudflare Stream API client with:
- Upload video via direct creator URL
- Get video status/details
- Generate signed playback URLs
- Delete videos
- Get embed code

```ts
// src/lib/cloudflare-stream.ts

const CF_API_BASE = 'https://api.cloudflare.com/client/v4'
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || ''
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || ''
const CF_STREAM_DOMAIN = process.env.CLOUDFLARE_STREAM_DOMAIN || 'videodelivery.net'

const cfHeaders = {
  'Authorization': `Bearer ${CF_API_TOKEN}`,
  'Content-Type': 'application/json',
}

// Upload video via direct creator URL (returns upload URL for client)
export async function createDirectUploadUrl(): Promise<{ uploadUrl: string; videoId: string }> {
  const res = await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/direct_upload`,
    {
      method: 'POST',
      headers: cfHeaders,
      body: JSON.stringify({
        maxDurationSeconds: 3600, // 1 hour max
        requireSignedURLs: true, // Enable signed URLs for security
        allowedOrigins: ['*'], // Restrict to your domain in production
      }),
    }
  )

  const data = await res.json()
  if (!data.success) throw new Error(data.errors?.[0]?.message || 'Failed to create upload URL')

  return {
    uploadUrl: data.result.uploadUrl,
    videoId: data.result.uid,
  }
}

// Upload video from server (admin uploads file → our server → Cloudflare)
export async function uploadVideo(file: Buffer, filename: string): Promise<{ videoId: string }> {
  // Step 1: Get direct upload URL
  const { uploadUrl, videoId } = await createDirectUploadUrl()

  // Step 2: Upload file to Cloudflare
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })

  if (!uploadRes.ok) throw new Error('Failed to upload video to Cloudflare')

  return { videoId }
}

// Get video status and details
export async function getVideoStatus(videoId: string): Promise<any> {
  const res = await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/${videoId}`,
    { headers: cfHeaders }
  )

  const data = await res.json()
  return data.result
}

// Generate signed playback URL (expires after specified time)
export async function getSignedPlaybackUrl(
  videoId: string,
  expiresInMinutes: number = 120
): Promise<{ playbackUrl: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  const res = await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/${videoId}/token`,
    {
      method: 'POST',
      headers: cfHeaders,
      body: JSON.stringify({
        exp: Math.floor(expiresAt.getTime() / 1000),
      }),
    }
  )

  const data = await res.json()
  if (!data.success) throw new Error('Failed to generate signed URL')

  return {
    playbackUrl: data.result.token,
    expiresAt,
  }
}

// Get iframe embed URL
export function getEmbedUrl(videoId: string): string {
  return `https://iframe.cloudflarestream.com/${videoId}`
}

// Get HLS/DASH playback URL
export function getHlsUrl(videoId: string): string {
  return `https://${CF_STREAM_DOMAIN}/${videoId}/manifest/video.m3u8`
}

// Delete video
export async function deleteVideo(videoId: string): Promise<void> {
  await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/stream/${videoId}`,
    { method: 'DELETE', headers: cfHeaders }
  )
}

// Get video thumbnail URL
export function getThumbnailUrl(videoId: string): string {
  return `https://${CF_STREAM_DOMAIN}/${videoId}/thumbnails/thumbnail.jpg`
}
```

### Step 2: Create `src/app/api/video/upload/route.ts`

Admin video upload endpoint:
- Accepts video file upload
- Uploads to Cloudflare Stream
- Returns video ID for storage in lesson

```ts
// src/app/api/video/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { uploadVideo } from '@/lib/cloudflare-stream'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video' }, { status: 400 })
    }

    // Max 500MB
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 500MB)' }, { status: 413 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Cloudflare Stream
    const { videoId } = await uploadVideo(buffer, file.name)

    return NextResponse.json({
      success: true,
      videoId,
      embedUrl: `https://iframe.cloudflarestream.com/${videoId}`,
      thumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

### Step 3: Create `src/app/api/video/[videoId]/route.ts`

Get video playback URL (signed URL for security):

```ts
// src/app/api/video/[videoId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSignedPlaybackUrl, getVideoStatus } from '@/lib/cloudflare-stream'
import { supabase } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const courseId = searchParams.get('courseId')

  // Verify enrollment if userId and courseId provided
  if (userId && courseId) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .single()

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
    }
  }

  try {
    // Get video status
    const status = await getVideoStatus(videoId)

    if (status.status.state !== 'ready') {
      return NextResponse.json({ 
        error: 'Video not ready', 
        status: status.status.state 
      }, { status: 202 })
    }

    // Generate signed playback URL (expires in 2 hours)
    const { playbackUrl, expiresAt } = await getSignedPlaybackUrl(videoId, 120)

    return NextResponse.json({
      playbackUrl,
      embedUrl: `https://iframe.cloudflarestream.com/${videoId}`,
      thumbnailUrl: `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`,
      duration: status.duration,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

### Step 4: Update `src/components/course/SecureVideoPlayer.tsx`

Replace the basic `<video>` tag with Cloudflare Stream player:

The player should:
1. Fetch signed playback URL from `/api/video/[videoId]`
2. Use Cloudflare's iframe embed OR HLS.js for custom player
3. Overlay watermark on top
4. Track progress

Key changes:
- Add `videoId` prop (Cloudflare video ID instead of raw URL)
- Fetch signed URL on mount
- Use Cloudflare iframe embed for simplicity OR HLS.js for custom player
- Keep watermark overlay and progress tracking

### Step 5: Update `src/app/courses/[slug]/learn/CourseLearnClient.tsx`

Update the video rendering to pass `videoId` instead of raw URL:

```tsx
// When lesson has a Cloudflare video ID
{activeLesson.content_type === 'video' && activeLesson.video_id && (
  <SecureVideoPlayer
    videoId={activeLesson.video_id}
    lessonId={activeLesson.id}
    courseId={course.id}
    studentName={user?.user_metadata?.full_name || user?.email || 'Student'}
    studentEmail={user?.email || ''}
    onProgress={...}
  />
)}

// Fallback for lessons with raw URLs (legacy)
{activeLesson.content_type === 'video' && !activeLesson.video_id && activeLesson.video_url && (
  <SecureVideoPlayer
    videoUrl={activeLesson.video_url}
    ...
  />
)}
```

### Step 6: Update Database Schema

Add `video_id` column to lessons table:

```sql
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS video_id TEXT,
ADD COLUMN IF NOT EXISTS video_source TEXT DEFAULT 'cloudflare' CHECK (video_source IN ('cloudflare', 'youtube', 'url'));
```

### Step 7: Update Admin Content Pages

Update the lesson editor to support Cloudflare video upload:
- Add file upload button in lesson editor
- Upload to `/api/video/upload`
- Store returned `video_id` in lesson
- Show video preview using Cloudflare embed

### Step 8: Update `.env.local`

User adds:
```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=***
CLOUDFLARE_STREAM_DOMAIN=videodelivery.net
```

## DO NOT
- Do NOT run git push
- Do NOT expose Cloudflare API token in client code
- Do NOT store raw video files on the server (stream directly to Cloudflare)

## After Completion
- Run `npx tsc --noEmit` — zero errors
- Admin can upload videos to Cloudflare Stream
- Videos play via Cloudflare Stream player with signed URLs
- Watermark overlay shows during playback
- Progress tracking works with Cloudflare player events
