'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Shield, AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, Loader2, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import Hls from 'hls.js'
import LectureComingSoon from './LectureComingSoon'
import { useCanvasWatermark } from '@/lib/use-canvas-watermark'
import { ForensicSampler } from '@/lib/video-forensics'
import { isDrmSupported, type DrmConfig, type DrmSession, createDrmSession, destroyDrmSession, getDrmConfig, getSupportedDrm } from '@/lib/video-drm'

interface SecureVideoPlayerProps {
  videoUrl?: string
  videoId?: string
  r2SourceKey?: string | null
  lessonId: string
  courseId: string
  studentName: string
  studentEmail: string
  studentId?: string
  courseName?: string
  onProgress?: (percent: number) => void
  resumePosition?: number
  drmConfig?: DrmConfig
}

interface PlaybackTokenResponse {
  token: string
  streamUrl: string
  lessonId: string
  courseId: string
  courseTitle?: string
  lessonTitle?: string
  expiresIn: number
  source: { type: 'stream' | 'r2' | 'none' }
}

export default function SecureVideoPlayer({
  videoUrl,
  videoId: _videoId,
  r2SourceKey: _r2SourceKey,
  lessonId,
  courseId,
  studentName,
  studentEmail,
  studentId,
  courseName,
  onProgress,
  resumePosition = 0,
  drmConfig,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const lastProgressRef = useRef(0)
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tokenRefreshInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const drmSessionRef = useRef<DrmSession | null>(null)
  const forensicRef = useRef<ForensicSampler | null>(null)

  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [playbackMode, setPlaybackMode] = useState<'hls' | 'direct' | 'none'>('none')
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noVideo, setNoVideo] = useState(false)
  const [showTabWarning, setShowTabWarning] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [courseTitle, setCourseTitle] = useState(courseName || '')

  const { canvasRef: watermarkCanvasRef, startWatermark, stopWatermark } = useCanvasWatermark(videoRef, {
    studentName,
    studentEmail,
    studentId,
    courseTitle: courseTitle || courseName,
  })

  const resolvePlaybackToken = useCallback(async (): Promise<PlaybackTokenResponse | null> => {
    try {
      const res = await fetch(`/api/video/playback-token?lessonId=${lessonId}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('Access denied. Please sign in and ensure you are enrolled.')
        } else {
          setError('Failed to load video')
        }
        setLoading(false)
        return null
      }
      const data: PlaybackTokenResponse & { error?: string } = await res.json()
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return null
      }
      if (data.courseTitle) setCourseTitle(data.courseTitle)
      return data
    } catch {
      setError('Failed to load video')
      setLoading(false)
      return null
    }
  }, [lessonId])

  useEffect(() => {
    let cancelled = false
    let retries = 0
    const MAX_RETRIES = 3
    const RETRY_DELAY = 2000

    async function fetchTokenWithRetry(): Promise<PlaybackTokenResponse | null> {
      while (retries < MAX_RETRIES) {
        if (cancelled) return null
        const data = await resolvePlaybackToken()
        if (data) return data
        retries++
        if (retries < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, RETRY_DELAY * retries))
        }
      }
      return null
    }

    async function initPlayback() {
      setLoading(true)
      setError('')
      setNoVideo(false)

      if (!lessonId) {
        setNoVideo(true)
        setLoading(false)
        return
      }

      if (videoUrl && !videoUrl.includes('r2.cloudflarestorage.com') && !videoUrl.startsWith('/api/')) {
        setStreamUrl(videoUrl)
        setPlaybackMode('direct')
        setLoading(false)
        return
      }

      const tokenData = await fetchTokenWithRetry()
      if (cancelled || !tokenData) return

      if (tokenData.source.type === 'none') {
        setNoVideo(true)
        setLoading(false)
        return
      }

      setStreamUrl(tokenData.streamUrl)
      setPlaybackMode(tokenData.source.type === 'stream' ? 'hls' : 'direct')
      setLoading(false)
    }

    initPlayback()

    tokenRefreshInterval.current = setInterval(async () => {
      if (cancelled) return
      retries = 0
      const tokenData = await fetchTokenWithRetry()
      if (!cancelled && tokenData) {
        setStreamUrl(tokenData.streamUrl)
      }
    }, 120000)

    return () => {
      cancelled = true
      if (tokenRefreshInterval.current) {
        clearInterval(tokenRefreshInterval.current)
        tokenRefreshInterval.current = null
      }
    }
  }, [lessonId, videoUrl, resolvePlaybackToken])

  useEffect(() => {
    if (playbackMode !== 'hls' || !streamUrl || !videoRef.current) {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      return
    }

    let destroyed = false
    const video = videoRef.current
    const url: string = streamUrl

    function loadHls() {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy()
        }
        const hls = new Hls({
          xhrSetup: (xhr) => {
            xhr.withCredentials = false
          },
        })
        hlsRef.current = hls
        hls.loadSource(url)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!destroyed) setLoading(false)
        })
        hls.on(Hls.Events.ERROR, (_event, errData) => {
          if (errData.fatal && !destroyed) {
            setError('Failed to load video stream')
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url
      }
    }

    loadHls()

    return () => {
      destroyed = true
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [playbackMode, streamUrl])

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

  useEffect(() => {
    if (playing) {
      startWatermark()
      if (!forensicRef.current) {
        forensicRef.current = new ForensicSampler(videoRef, lessonId, studentId || '')
        forensicRef.current.start()
      }
    } else {
      stopWatermark()
    }
    return () => {
      stopWatermark()
    }
  }, [playing, lessonId, studentId, startWatermark, stopWatermark])

  useEffect(() => {
    if (!drmConfig || !videoRef.current || playbackMode === 'none') return
    let cancelled = false
    ;(async () => {
      const session = await createDrmSession(videoRef.current!, drmConfig)
      if (!cancelled) {
        drmSessionRef.current = session
      }
    })()
    return () => {
      cancelled = true
      if (drmSessionRef.current) {
        destroyDrmSession(drmSessionRef.current)
        drmSessionRef.current = null
      }
    }
  }, [drmConfig, playbackMode])

  useEffect(() => {
    return () => {
      if (forensicRef.current) {
        forensicRef.current.stop()
        forensicRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventContext = (e: MouseEvent) => e.preventDefault()
    const preventKeys = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'u')
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

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    if (playing) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [playing])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return
    const dur = videoRef.current.duration
    const pct = dur > 0 ? Math.round((videoRef.current.currentTime / dur) * 100) : 0
    setProgress(Number.isFinite(pct) ? pct : 0)
    setCurrentTime(videoRef.current.currentTime)

    if (pct !== lastProgressRef.current) {
      lastProgressRef.current = pct
      onProgress?.(pct)
    }
  }, [onProgress])

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
    setLoading(false)
    if (resumePosition > 0 && videoRef.current.duration > resumePosition) {
      videoRef.current.currentTime = resumePosition
    }
  }, [resumePosition])

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

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const val = Number(e.target.value)
    videoRef.current.volume = val
    setVolume(val)
    if (val === 0) {
      videoRef.current.muted = true
      setMuted(true)
    } else if (muted) {
      videoRef.current.muted = false
      setMuted(false)
    }
  }, [muted])

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

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
      if (tokenRefreshInterval.current) clearInterval(tokenRefreshInterval.current)
    }
  }, [])

  if (noVideo) {
    return <LectureComingSoon contentType="video" />
  }

  if (error) {
    return (
      <div className="bg-slate-900 rounded-2xl aspect-video flex items-center justify-center">
        <div className="text-center text-white p-6">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-red-400" />
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 underline"
          >
            Try reloading
          </button>
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
        {playbackMode === 'direct' && streamUrl && (
          <source src={streamUrl} type="video/mp4" />
        )}
      </video>

      {loading && (
        <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-white animate-spin mx-auto mb-2" />
            <p className="text-xs text-white/60">Loading video...</p>
          </div>
        </div>
      )}

      {showTabWarning && (
        <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <EyeOff className="h-12 w-12 mx-auto mb-3 text-yellow-400" />
            <p className="font-bold text-lg mb-2">Video Paused</p>
            <p className="text-sm text-white/70 mb-4">Playback paused when you switched tabs.</p>
            <button
              onClick={() => {
                setShowTabWarning(false)
                videoRef.current?.play()
                setPlaying(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Resume Playing
            </button>
          </div>
        </div>
      )}

      {!playing && !loading && !showTabWarning && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 cursor-pointer" onClick={togglePlay}>
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
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              aria-label="Volume"
            />
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
  )
}
