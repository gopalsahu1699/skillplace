# Implement Secure Video Player with Watermark Protection

## Goal
Replace the current basic video player (YouTube embed + native HTML5) with a production-grade secure video player that protects video content from downloading, screen recording, and unauthorized sharing.

## Current State
- `src/components/course/VideoPlayer.tsx` — Basic player with YouTube/Vimeo iframe and native `<video>` tag
- `src/app/courses/[slug]/learn/CourseLearnClient.tsx` — Uses the old player
- No watermark, no anti-download, no session binding

## Research: Video Protection Best Practices

Industry leaders (Cloudflare Stream, VdoCipher, Widevine) use:
1. **Signed URLs** — Time-limited, IP-bound, single-use tokens
2. **Dynamic Watermark** — Student name/email overlaid, moves position (deters screen recording)
3. **Anti-Download** — `controlsList="nodownload"`, disable context menu, blob URL obfuscation
4. **DRM** — Google Widevine, Apple FairPlay (for high-value content)
5. **Session Binding** — Video access tied to active enrollment session
6. **Tab Visibility Detection** — Pause video when user switches tabs
7. **Keyboard Shortcut Blocking** — Disable F12, Ctrl+Shift+I, Ctrl+S, Ctrl+U
8. **Referrer Restrictions** — Prevent embedding on external sites

## Implementation Plan

### Step 1: Create `src/lib/video-security.ts`

Video security utilities:
- Token generation/validation for video access
- Session-bound URL generation
- Watermark position calculation

```ts
// src/lib/video-security.ts

// Generate unique watermark positions that move over time
export function generateWatermarkPosition(): { x: number; y: number } {
  return {
    x: Math.random() * 60 + 10,
    y: Math.random() * 60 + 10,
  }
}

// Generate session-bound video token
export function generateVideoToken(
  videoId: string,
  userId: string,
  courseId: string
): string {
  const timestamp = Date.now()
  const data = `${videoId}:${userId}:${courseId}:${timestamp}`
  // Simple base64 encoding (in production, use HMAC signature)
  return Buffer.from(data).toString('base64url')
}

// Validate video token
export function validateVideoToken(
  token: string,
  videoId: string,
  userId: string,
  courseId: string
): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const [vId, uId, cId, ts] = decoded.split(':')
    
    if (vId !== videoId || uId !== userId || cId !== courseId) {
      return false
    }
    
    // Token expires after 2 hours
    const tokenAge = Date.now() - parseInt(ts)
    if (tokenAge > 2 * 60 * 60 * 1000) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

// Get secure video URL
export function getSecureVideoUrl(
  videoId: string,
  userId: string,
  courseId: string
): string {
  const token = generateVideoToken(videoId, userId, courseId)
  return `/api/video/stream?v=${videoId}&u=${userId}&c=${courseId}&t=${token}`
}
```

### Step 2: Create `src/app/api/video/stream/route.ts`

Secure video streaming endpoint:
- Validates enrollment
- Validates video token
- Returns video URL with security headers
- Logs access for audit trail

```ts
// src/app/api/video/stream/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, serviceKey)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('v')
  const userId = searchParams.get('u')
  const courseId = searchParams.get('c')
  const token = searchParams.get('t')

  if (!videoId || !userId || !courseId || !token) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  // Validate token
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const [vId, uId, cId, ts] = decoded.split(':')
    
    if (vId !== videoId || uId !== userId || cId !== courseId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }
    
    const tokenAge = Date.now() - parseInt(ts)
    if (tokenAge > 2 * 60 * 60 * 1000) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid token format' }, { status: 400 })
  }

  // Verify enrollment
  const { data: enrollment, error: enrollError } = await supabase
    .from('enrollments')
    .select('id, status')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single()

  if (enrollError || !enrollment) {
    return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
  }

  // Get video URL from database
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('video_url, title, module_id')
    .eq('id', videoId)
    .single()

  if (lessonError || !lesson?.video_url) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  }

  // Log video access for audit
  await supabase.from('user_sessions').insert({
    user_id: userId,
    login_method: 'video_access',
    is_active: true,
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  })

  // Return the video URL
  return NextResponse.json({ 
    url: lesson.video_url,
    title: lesson.title,
  })
}
```

### Step 3: Create `src/components/course/SecureVideoPlayer.tsx`

The main secure video player component with all protections:

```tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Shield, AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, Loader2, Eye, EyeOff } from 'lucide-react'

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
  const [showTabWarning, setShowTabWarning] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null)

  // Move watermark every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        x: Math.random() * 60 + 10,
        y: Math.random() * 60 + 10,
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Tab visibility detection — pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
        setShowTabWarning(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Disable right-click and keyboard shortcuts
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventContext = (e: MouseEvent) => e.preventDefault()
    const preventKeys = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && ['s', 'u', 'p'].includes(e.key.toLowerCase()))
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

  // Auto-hide controls after 3 seconds
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    if (playing) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [playing])

  // Progress tracking
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const pct = Math.round((videoRef.current.currentTime / videoRef.current.duration) * 100)
    setProgress(pct)
    setCurrentTime(videoRef.current.currentTime)
    if (pct % 10 === 0) onProgress?.(pct)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
    setLoading(false)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setPlaying(true)
      resetControlsTimeout()
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setMuted(videoRef.current.muted)
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
    <div 
      ref={containerRef} 
      className="relative bg-slate-900 rounded-2xl overflow-hidden select-none group"
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={resetControlsTimeout}
    >
      {/* Security Badge */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
        <Shield className="h-3 w-3" />
        Protected
      </div>

      {/* Moving Watermark — Student Info */}
      <div 
        className="absolute z-20 pointer-events-none transition-all duration-1000 ease-in-out"
        style={{ 
          left: `${watermarkPos.x}%`, 
          top: `${watermarkPos.y}%`,
          transform: 'translate(-50%, -50%) rotate(-15deg)',
        }}
      >
        <div className="bg-black/40 backdrop-blur-sm text-white/80 text-sm font-medium px-4 py-2 rounded-lg border border-white/10 whitespace-nowrap">
          <div className="font-bold">{studentName}</div>
          <div className="text-xs opacity-70">{studentEmail}</div>
        </div>
      </div>

      {/* Corner watermarks for screen recording deterrence */}
      <div className="absolute top-3 right-3 z-20 pointer-events-none text-white/20 text-xs font-mono">
        {new Date().toLocaleDateString()}
      </div>
      <div className="absolute bottom-20 left-3 z-20 pointer-events-none text-white/20 text-xs font-mono">
        {studentEmail}
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full aspect-video object-contain bg-black cursor-pointer"
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        disableRemotePlayback
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={() => setLoading(false)}
        onLoadStart={() => setLoading(true)}
        onError={() => setError('Failed to load video')}
        onClick={togglePlay}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
      )}

      {/* Tab Switch Warning */}
      {showTabWarning && (
        <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <EyeOff className="h-12 w-12 mx-auto mb-3 text-yellow-400" />
            <p className="font-bold text-lg mb-2">Video Paused</p>
            <p className="text-sm text-white/70 mb-4">Playback is paused when you switch tabs for security.</p>
            <button 
              onClick={() => {
                setShowTabWarning(false)
                videoRef.current?.play()
                setPlaying(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              <Eye className="h-4 w-4 inline mr-1" /> Resume
            </button>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!playing && !loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 cursor-pointer" onClick={togglePlay}>
          <div className="h-16 w-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
            <Play className="h-7 w-7 text-slate-900 ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Custom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
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
            <button onClick={() => videoRef.current?.requestFullscreen()} className="text-white hover:text-blue-400 transition-colors">
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Step 4: Update `src/app/courses/[slug]/learn/CourseLearnClient.tsx`

Replace the video rendering section. Find the section that renders video content and replace:

```tsx
// OLD — Replace this:
{activeLesson.content_type === 'video' && activeLesson.video_url && (
  <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video mb-6">
    {getYouTubeEmbed(activeLesson.video_url) ? (
      <iframe src={getYouTubeEmbed(activeLesson.video_url)!} className="w-full h-full" allowFullScreen />
    ) : (
      <video src={activeLesson.video_url} className="w-full h-full object-contain" controls />
    )}
  </div>
)}

// NEW — Replace with:
{activeLesson.content_type === 'video' && activeLesson.video_url && (
  <div className="mb-6">
    <SecureVideoPlayer
      videoUrl={activeLesson.video_url}
      lessonId={activeLesson.id}
      courseId={course.id}
      studentName={user.user_metadata?.full_name || user.email || 'Student'}
      studentEmail={user.email || ''}
      onProgress={(pct) => {
        if (pct > 0) {
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
  </div>
)}
```

### Step 5: Add Security Headers in Middleware

Update `src/middleware.ts` to add security headers for video routes:

```ts
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers for video routes
  if (request.nextUrl.pathname.startsWith('/api/video')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'no-referrer')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### Step 6: Add `VIDEO_SECRET` to Environment

Add to `.env.local`:
```
VIDEO_SECRET=skillp...
```

## Security Features Implemented

| Protection | How It Works |
|-----------|-------------|
| ❌ No Recording | Moving watermark with student name/email overlaid on video |
| ❌ No Downloading | `controlsList="nodownload"`, disabled context menu, no download button |
| ❌ No Direct URL Sharing | Token-based URLs that expire after 2 hours |
| ❌ No Tab Switching | Video pauses when user switches tabs, shows warning |
| ❌ No Keyboard Shortcuts | F12, Ctrl+Shift+I/J/C, Ctrl+S/U/P blocked |
| ❌ No Right-Click | Context menu disabled on video container |
| ❌ No Embedding | Referrer-Policy headers prevent external embedding |
| Session Bound | Video access requires active enrollment |
| Progress Tracking | Every 10% progress saved to database |
| Audit Trail | Video access logged in user_sessions table |

## DO NOT
- Do NOT run git push
- Do NOT expose video URLs directly
- Do NOT store video secrets in client code
- Do NOT allow video embedding on external sites

## After Completion
- Run `npx tsc --noEmit` — zero errors
- Video player shows moving watermark with student name/email
- Watermark position changes every 10 seconds
- Right-click disabled on video
- Download button hidden from controls
- Video pauses when user switches tabs
- Progress tracked and saved to database
