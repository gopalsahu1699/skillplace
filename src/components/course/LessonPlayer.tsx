'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  AlertCircle,
  FileText,
  Download,
  Loader2,
  Shield,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { notify } from '@/lib/notifications'
import { cn } from '@/lib/utils'
import LectureComingSoon from './LectureComingSoon'
import { useCanvasWatermark } from '@/lib/use-canvas-watermark'
import { ForensicSampler } from '@/lib/video-forensics'
import { isDrmSupported, type DrmConfig, type DrmSession, createDrmSession, destroyDrmSession } from '@/lib/video-drm'

interface LessonData {
  id: string
  title: string
  content_type: string
  video_url: string | null
  video_id: string | null
  r2_source_key: string | null
  pdf_url: string | null
  text_content: string | null
  duration_minutes: number | null
}

interface LessonPlayerProps {
  lesson: LessonData
  courseId: string
  userId: string
  userName: string
  userEmail: string
  isCompleted: boolean
  onComplete: (lessonId: string) => void
  courseName?: string
  drmConfig?: DrmConfig
}

export default function LessonPlayer({
  lesson,
  courseId,
  userId,
  userName,
  userEmail,
  isCompleted,
  onComplete,
  courseName,
  drmConfig,
}: LessonPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastProgressRef = useRef(0)
  const tokenRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const drmSessionRef = useRef<DrmSession | null>(null)
  const forensicRef = useRef<ForensicSampler | null>(null)
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState(false)
  const [showControls, setShowControls] = useState(true)

  const { canvasRef: watermarkCanvasRef, startWatermark, stopWatermark } = useCanvasWatermark(videoRef, {
    studentName: userName,
    studentEmail: userEmail,
    studentId: userId,
    courseTitle: courseName || lesson.title,
    lessonTitle: lesson.title,
  })

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
      if (tokenRefreshRef.current) clearInterval(tokenRefreshRef.current)
    }
  }, [])

  const fetchPlaybackUrl = useCallback(async () => {
    if (!lesson.id) return null
    try {
      const res = await fetch(`/api/video/playback-token?lessonId=${lesson.id}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        setVideoError(true)
        return null
      }
      const data = await res.json()
      return data.streamUrl as string
    } catch {
      setVideoError(true)
      return null
    }
  }, [lesson.id])

  useEffect(() => {
    if (lesson.content_type !== 'video') return
    let cancelled = false
    let retries = 0
    const MAX_RETRIES = 3
    const RETRY_DELAY = 2000

    setStreamUrl(null)
    setVideoError(false)
    setLoading(true)

    async function fetchWithRetry(): Promise<string | null> {
      while (retries < MAX_RETRIES) {
        if (cancelled) return null
        const url = await fetchPlaybackUrl()
        if (url) return url
        retries++
        if (retries < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, RETRY_DELAY * retries))
        }
      }
      return null
    }

    ;(async () => {
      const url = await fetchWithRetry()
      if (!cancelled && url) {
        setStreamUrl(url)
      }
    })()

    tokenRefreshRef.current = setInterval(async () => {
      if (cancelled) return
      retries = 0
      const url = await fetchWithRetry()
      if (!cancelled && url) {
        setStreamUrl(url)
      }
    }, 45000)

    return () => {
      cancelled = true
    }
  }, [lesson.id, lesson.content_type, fetchPlaybackUrl])

  useEffect(() => {
    if (playing) {
      startWatermark()
      if (!forensicRef.current) {
        forensicRef.current = new ForensicSampler(videoRef, lesson.id, userId)
        forensicRef.current.start()
      }
    } else {
      stopWatermark()
    }
    return () => stopWatermark()
  }, [playing, lesson.id, userId, startWatermark, stopWatermark])

  useEffect(() => {
    if (!drmConfig || !videoRef.current || !streamUrl) return
    let cancelled = false
    ;(async () => {
      const session = await createDrmSession(videoRef.current!, drmConfig)
      if (!cancelled) drmSessionRef.current = session
    })()
    return () => {
      cancelled = true
      if (drmSessionRef.current) {
        destroyDrmSession(drmSessionRef.current)
        drmSessionRef.current = null
      }
    }
  }, [drmConfig, streamUrl])

  useEffect(() => {
    return () => {
      if (forensicRef.current) {
        forensicRef.current.stop()
        forensicRef.current = null
      }
    }
  }, [])

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    if (playing) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [playing])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return
    const ct = videoRef.current.currentTime
    const dur = videoRef.current.duration
    const pct = dur > 0 ? Math.round((ct / dur) * 100) : 0
    setProgress(Number.isFinite(pct) ? pct : 0)
    setCurrentTime(ct)

    if (pct !== lastProgressRef.current) {
      lastProgressRef.current = pct
      if (pct >= 90 && !isCompleted) {
        ;(async () => {
          try {
            await supabase.from('lesson_progress').upsert({
              user_id: userId,
              lesson_id: lesson.id,
              is_completed: true,
              watched_seconds: Math.round(ct),
              completed_at: new Date().toISOString(),
            }, { onConflict: 'user_id,lesson_id' })
            onComplete(lesson.id)
          } catch {}
        })()
      } else if (pct > 0 && pct % 25 === 0) {
        supabase.from('lesson_progress').upsert({
          user_id: userId,
          lesson_id: lesson.id,
          is_completed: false,
          watched_seconds: Math.round(ct),
        }, { onConflict: 'user_id,lesson_id' })
      }
    }
  }, [isCompleted, userId, lesson.id, onComplete])

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
    setLoading(false)
  }, [])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {})
      setPlaying(true)
      resetControlsTimeout()
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }, [resetControlsTimeout])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setMuted(videoRef.current.muted)
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const val = Number(e.target.value)
    if (!Number.isFinite(val)) return
    const time = (val / 100) * videoRef.current.duration
    videoRef.current.currentTime = time
    setProgress(val)
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [])

  const markComplete = useCallback(async () => {
    try {
      await supabase.from('lesson_progress').upsert(
        {
          user_id: userId,
          lesson_id: lesson.id,
          is_completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )
      notify.lessonComplete(lesson.title)
      onComplete(lesson.id)
    } catch {
      notify.genericError('Failed to mark lesson complete')
    }
  }, [userId, lesson.id, lesson.title, onComplete])

  if (lesson.content_type === 'video') {
    const hasVideo = !!(lesson.video_id || lesson.video_url || lesson.r2_source_key)

    if (!hasVideo) {
      return <LectureComingSoon contentType="video" lessonTitle={lesson.title} />
    }

    return (
      <div>
        <div
          className="relative bg-slate-900 rounded-2xl overflow-hidden select-none group"
          onMouseMove={resetControlsTimeout}
          role="region"
          aria-label="Video player"
        >
          <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Shield className="h-3 w-3" />
            Protected
          </div>

          <canvas
            ref={watermarkCanvasRef}
            className="absolute inset-0 z-20 pointer-events-none"
            aria-hidden="true"
          />

          {videoError && (
            <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col items-center justify-center text-center p-6">
              <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
              <p className="text-white font-semibold mb-1">Failed to load video</p>
              <p className="text-slate-400 text-sm mb-4">The video could not be loaded. Please try again.</p>
              <button
                onClick={() => {
                  setVideoError(false)
                  setLoading(true)
                  setStreamUrl(null)
                  fetchPlaybackUrl().then((url) => {
                    if (url) setStreamUrl(url)
                  })
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Try reloading
              </button>
            </div>
          )}

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
            onClick={togglePlay}
          >
            {streamUrl && (
              <source src={streamUrl} type="video/mp4" />
            )}
          </video>

          {loading && (
            <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
          )}

          {!playing && !loading && !videoError && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 cursor-pointer"
              onClick={togglePlay}
            >
              <div className="h-16 w-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all">
                <Play className="h-7 w-7 text-slate-900 ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
              showControls ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="mb-3">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
                aria-label="Video progress"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors" aria-label={playing ? 'Pause' : 'Play'}>
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors" aria-label={muted ? 'Unmute' : 'Mute'}>
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <span className="text-white/70 text-xs font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-xs">{progress}%</span>
                <button onClick={() => videoRef.current?.requestFullscreen()} className="text-white hover:text-blue-400 transition-colors" aria-label="Fullscreen">
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    )
  }

  if (lesson.content_type === 'pdf') {
    if (!lesson.pdf_url) {
      return <LectureComingSoon contentType="pdf" lessonTitle={lesson.title} />
    }

    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-500" />
            <span className="font-medium text-slate-900">{lesson.title}</span>
          </div>
          <a
            href={lesson.pdf_url}
            download
            className="text-sm text-blue-600 flex items-center gap-1 hover:underline"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
        <iframe
          src={lesson.pdf_url}
          className="w-full h-[70vh] border-0"
          title={lesson.title}
        />
      </div>
    )
  }

  if (lesson.content_type === 'quiz') {
    return <LectureComingSoon contentType="quiz" lessonTitle={lesson.title} />
  }

  if (!lesson.text_content) {
    return <LectureComingSoon contentType="text" lessonTitle={lesson.title} />
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
        {lesson.text_content}
      </p>
    </div>
  )
}
