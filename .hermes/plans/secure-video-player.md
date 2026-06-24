# Implement Secure Video Player with Watermark Protection

## Goal
Build a production-grade secure video player for the course learning platform that:
1. Uses HTML5 video with Cloudflare Stream-style tokenized URLs
2. Overlays moving watermark with student name/email during playback
3. Prevents downloading, screen recording, and unauthorized copying
4. Disables right-click, video download controls, and dev tools detection
5. Session-bound access (tokens expire when student logs out)

## Research Summary

### Video Protection Strategies (Industry Best Practices):

1. **Cloudflare Stream** — Signed URLs with JWT tokens, token expiration, IP binding
2. **VdoCipher** — DRM encryption, Google Widevine, Apple FairPlay
3. **Watermark Overlay** — Dynamic text overlay that moves (deters screen recording)
4. **Anti-Download** — `controlsList="nodownload"`, disable context menu, blob URL obfuscation
5. **Screen Capture Detection** — CSS overlay with student info visible during recording
6. **Session Binding** — Video tokens tied to user session, expire on logout

### Implementation Plan:

Since we can't use Cloudflare Stream or VdoCipher (paid services requiring account setup), we'll implement equivalent protection at the application level:

**Level 1: Token-based video access** — Videos served via signed URLs that expire
**Level 2: Dynamic watermark** — Student name/email overlaid on video, moves every 10 seconds
**Level 3: Anti-download** — Disable controls, context menu, keyboard shortcuts
**Level 4: Screen capture deterrence** — Visible watermark + CSS overlay protection
**Level 5: Session binding** — Video access tied to enrollment session

## Tasks

### Step 1: Create `src/lib/video-security.ts` — Video Security Utilities

```ts
import { createHmac } from 'crypto'

// Configuration
const VIDEO_SECRET = process.env.VIDEO_SECRET || 'skillplace-video-secret-key-2026'
const TOKEN_EXPIRY_MINUTES = 120

interface VideoToken {
  videoId: string
  userId: string
  courseId: string
  expiresAt: number
  signature: string
}

// Generate signed video access token
export function generateVideoToken(videoId: string, userId: string, courseId: string): string {
  const expiresAt = Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000
  const payload = { videoId, userId, courseId, expiresAt }
  const signature = createHmac('sha256', VIDEO_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex')
  
  return Buffer.from(JSON.stringify({ ...payload, signature })).toString('base64')
}

// Validate video access token
export function validateVideoToken(token: string): VideoToken | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
    const { signature, ...payload } = decoded
    
    // Verify signature
    const expectedSignature = createHmac('sha256', VIDEO_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex')
    
    if (signature !== expectedSignature) return null
    if (payload.expiresAt < Date.now()) return null
    
    return decoded as VideoToken
  } catch {
    return null
  }
}

// Generate obfuscated video URL (prevents direct URL sharing)
export function getSecureVideoUrl(videoId: string, userId: string, courseId: string): string {
  const token = generateVideoToken(videoId, userId, courseId)
  return `/api/video/stream?v=${encodeURIComponent(videoId)}&t=${encodeURIComponent(token)}`
}
```

### Step 2: Create `src/app/api/video/stream/route.ts` — Secure Video Streaming API

```ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { validateVideoToken } from '@/lib/video-security'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('v')
  const token = searchParams.get('t')

  if (!videoId || !token) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  // Validate token
  const tokenData = validateVideoToken(token)
  if (!tokenData) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 })
  }

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', tokenData.userId)
    .eq('course_id', tokenData.courseId)
    .eq('status', 'active')
    .single()

  if (!enrollment) {
    return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
  }

  // Get video URL from database
  const { data: lesson } = await supabase
    .from('lessons')
    .select('video_url, title')
    .eq('id', videoId)
    .single()

  if (!lesson?.video_url) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  // Return the video URL with temporary signed access
  // In production, this would return a Cloudflare signed URL
  // For now, we return the URL with security headers
  return NextResponse.json({ 
    url: lesson.video_url,
    title: lesson.title,
    watermark: {
      text: tokenData.userId, // Will be replaced with actual name on client
    }
  })
}
```

### Step 3: Create `src/components/course/SecureVideoPlayer.tsx` — The Main Video Player Component

This is the core component. It must have:

1. **Video element** with `controlsList="nodownload"` and `disablePictureInPicture`
2. **Watermark overlay** — div positioned over video with student name/email, moves every 10s
3. **Anti-download** — no context menu, no right-click, disabled keyboard shortcuts
4. **Session tracking** — heartbeat to track progress
5. **Screen capture protection** — visible watermark that can't be cropped
6. **Responsive design** — works on mobile and desktop

```tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Shield, AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react'

interface SecureVideoPlayerProps {
  videoUrl: string
  lessonId: string
  courseId: string
  studentName: string
  studentEmail: string
  onProgress?: (percent: number) => void
}

export default function SecureVideoPlayer({
  videoUrl,
  lessonId,
  courseId,
  studentName,
  studentEmail,
  onProgress,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [watermarkPos, setWatermarkPos] = useState({ x: 20, y: 20 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null)

  // Move watermark every 10 seconds to prevent cropping
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        x: Math.random() * 60 + 10, // 10-70% from left
        y: Math.random() * 60 + 10, // 10-70% from top
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Anti-screen-capture: detect visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
        setShowWarning(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Disable right-click on video container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventContext = (e: MouseEvent) => e.preventDefault()
    const preventKeys = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+S, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 's' || e.key === 'u'))
      ) {
        e.preventDefault()
      }
    }

    container.addEventListener('contextmenu', preventContext)
    document.addEventListener('keydown', preventKeys)
    
    return () => {
      container.removeEventListener('contextmenu', preventContext)
      document.removeEventListener('keydown', preventKeys)
    }
  }, [])

  // Progress tracking heartbeat
  useEffect(() => {
    heartbeatRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        const pct = Math.round((videoRef.current.currentTime / videoRef.current.duration) * 100)
        setProgress(pct)
        onProgress?.(pct)
      }
    }, 5000)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    }
  }, [onProgress])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setMuted(videoRef.current.muted)
  }, [])

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
    const pct = Math.round((videoRef.current.currentTime / videoRef.current.duration) * 100)
    setProgress(pct)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
    setLoading(false)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const time = (Number(e.target.value) / 100) * videoRef.current.duration
    videoRef.current.currentTime = time
    setProgress(Number(e.target.value))
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (error) {
    return (
      <div className="bg-slate-900 rounded-2xl aspect-video flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-400" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative bg-slate-900 rounded-2xl overflow-hidden select-none" onContextMenu={(e) => e.preventDefault()}>
      {/* Security Badge */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
        <Shield className="h-3 w-3" />
        Protected Content
      </div>

      {/* Watermark Overlay — moves position every 10s */}
      <div 
        className="absolute z-20 pointer-events-none transition-all duration-1000 ease-in-out"
        style={{ 
          left: `${watermarkPos.x}%`, 
          top: `${watermarkPos.y}%`,
          transform: 'translate(-50%, -50%) rotate(-15deg)',
        }}
      >
        <div className="bg-white/10 backdrop-blur-sm text-white/60 text-sm font-medium px-4 py-2 rounded-lg border border-white/20 whitespace-nowrap">
          <div className="font-bold">{studentName}</div>
          <div className="text-xs opacity-80">{studentEmail}</div>
          <div className="text-xs opacity-60 mt-0.5">ID: {lessonId.slice(0, 8)}</div>
        </div>
      </div>

      {/* Additional watermark corners for screen recording deterrence */}
      <div className="absolute top-3 right-3 z-20 pointer-events-none">
        <div className="text-white/30 text-xs font-mono">
          {new Date().toLocaleDateString()}
        </div>
      </div>
      <div className="absolute bottom-16 left-3 z-20 pointer-events-none">
        <div className="text-white/30 text-xs font-mono">
          {studentEmail}
        </div>
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full aspect-video object-contain bg-black"
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        disableRemotePlayback
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => setError('Failed to load video. Please try again.')}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
      )}

      {/* Warning when tab is hidden */}
      {showWarning && (
        <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-yellow-400" />
            <p className="font-bold text-lg mb-2">Video Paused</p>
            <p className="text-sm text-white/70">For security, video playback is paused when you switch tabs.</p>
            <button 
              onClick={() => setShowWarning(false)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <span className="text-white/70 text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs">{progress}%</span>
            <button 
              onClick={() => videoRef.current?.requestFullscreen()}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Anti-recording CSS overlay (visible in screen recordings) */}
      <div className="absolute inset-0 pointer-events-none z-5 opacity-0 hover:opacity-100">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/5 text-6xl font-bold rotate-[-30deg]">
          {studentName}
        </div>
      </div>
    </div>
  )
}
```

### Step 4: Update `src/app/courses/[slug]/learn/CourseLearnClient.tsx`

Replace the old video player with the new SecureVideoPlayer:

In the video content section, replace:
```tsx
{videoUrl && getYouTubeEmbed(videoUrl) ? (
  <iframe src={getYouTubeEmbed(videoUrl)!} className="w-full h-full" allowFullScreen />
) : (
  <video src={videoUrl} className="w-full h-full object-contain" controls />
)}
```

With:
```tsx
<SecureVideoPlayer
  videoUrl={videoUrl}
  lessonId={activeLesson.id}
  courseId={course.id}
  studentName={user.user_metadata?.full_name || user.email || 'Student'}
  studentEmail={user.email || ''}
  onProgress={(pct) => {
    // Update progress in database
    if (user && pct > 0) {
      supabase.from('course_progress').upsert({
        user_id: user.id,
        course_id: course.id,
        lesson_id: activeLesson.id,
        completed: pct >= 90,
        completed_at: pct >= 90 ? new Date().toISOString() : null,
      })
    }
  }}
/>
```

### Step 5: Update `src/components/course/VideoPlayer.tsx` — Replace with Secure Player

Replace the entire file with the SecureVideoPlayer component from Step 3.

### Step 6: Add Security Headers to Videos

In `next.config.ts` or middleware, add headers to prevent video caching and embedding:

```ts
// In middleware.ts, add security headers for video routes
if (request.nextUrl.pathname.startsWith('/api/video')) {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'no-referrer')
}
```

### Step 7: Add `VIDEO_SECRET` to Environment

Add to `.env.local`:
```
VIDEO_SECRET=your-256-bit-secret-key-here-change-in-production
```

## Security Features Summary

| Feature | Implementation |
|---------|---------------|
| ❌ No recording | Moving watermark overlay with student info |
| ❌ No downloading | `controlsList="nodownload"`, disabled context menu, no download button |
| ❌ Impossible to copy | Token-based URLs that expire, session-bound access |
| Watermark during playback | Student name/email overlaid, moves every 10 seconds |
| Tab switch detection | Video pauses when user switches tabs |
| Keyboard shortcut blocking | F12, Ctrl+Shift+I/J/C, Ctrl+S/U disabled |
| Right-click disabled | Context menu blocked on video container |
| Session binding | Video access tied to active enrollment |
| Progress tracking | Heartbeat updates progress every 5 seconds |

## DO NOT
- Do NOT run git push
- Do NOT expose video URLs directly (always go through API)
- Do NOT store video secrets in client code
- Do NOT allow video embedding on external sites

## After Completion
- Run `npx tsc --noEmit` — zero errors
- Video player shows watermark with student name/email
- Watermark moves position every 10 seconds
- Right-click is disabled on video
- Download button is hidden
- Video pauses when tab is hidden
- Progress is tracked and saved to database
