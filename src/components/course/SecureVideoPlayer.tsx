'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Shield, AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, Loader2, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import Hls from 'hls.js'
import LectureComingSoon from './LectureComingSoon'

interface SecureVideoPlayerProps {
  videoUrl?: string
  videoId?: string
  r2SourceKey?: string | null
  lessonId: string
  courseId: string
  studentName: string
  studentEmail: string
  onProgress?: (percent: number) => void
  resumePosition?: number
}

export default function SecureVideoPlayer({
  videoUrl,
  videoId,
  r2SourceKey,
  lessonId,
  courseId,
  studentName,
  studentEmail,
  onProgress,
  resumePosition = 0,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const lastProgressRef = useRef(0)
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [effectiveUrl, setEffectiveUrl] = useState<string | null>(null)
  const [playbackMode, setPlaybackMode] = useState<'hls' | 'direct' | 'none'>('none')
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [watermarkPos, setWatermarkPos] = useState({ x: 20, y: 20 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noVideo, setNoVideo] = useState(false)
  const [showTabWarning, setShowTabWarning] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // Resolve the video source URL
  useEffect(() => {
    if (videoId) {
      setPlaybackMode('hls')
      return
    }

    if (!lessonId) {
      setNoVideo(true)
      setLoading(false)
      return
    }

    let cancelled = false

    async function resolveUrl() {
      try {
        setLoading(true)
        setNoVideo(false)

        // If we have a direct non-R2 URL (e.g., YouTube), use it directly
        if (videoUrl && !videoUrl.includes('r2.cloudflarestorage.com') && !videoUrl.startsWith('/api/')) {
          setEffectiveUrl(videoUrl)
          setPlaybackMode('direct')
          setLoading(false)
          return
        }

        // For R2 videos or when no URL is provided, get a presigned URL from our API
        const res = await fetch(`/api/video/r2-playback?lessonId=${lessonId}`, {
          credentials: 'include',
        })

        if (cancelled) return

        if (res.ok) {
          const data = await res.json()
          if (data.playbackUrl) {
            setEffectiveUrl(data.playbackUrl)
            setPlaybackMode('direct')
            return
          }
        }

        if (res.status === 404) {
          setNoVideo(true)
        } else {
          setError('Failed to load video')
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load video')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    resolveUrl()

    return () => { cancelled = true }
  }, [videoId, lessonId, videoUrl])

  // HLS initialization
  useEffect(() => {
    if (playbackMode !== 'hls' || !videoId || !videoRef.current) return

    let destroyed = false
    const video = videoRef.current

    async function loadSignedUrl() {
      try {
        setLoading(true)
        const res = await fetch(`/api/video/${videoId}?courseId=${courseId}`, {
          credentials: 'include',
        })
        const data = await res.json()

        if (destroyed) return

        if (!res.ok || data.error) {
          setError(data.error || 'Failed to load video')
          return
        }

        const { playbackUrl } = data

        if (Hls.isSupported()) {
          const hls = new Hls({
            xhrSetup: (xhr) => {
              xhr.withCredentials = false
            },
          })
          hlsRef.current = hls
          hls.loadSource(playbackUrl)
          hls.attachMedia(video)
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false)
          })
          hls.on(Hls.Events.ERROR, (_event, errData) => {
            if (errData.fatal) {
              setError('Failed to load video stream')
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = playbackUrl
        }
      } catch {
        if (!destroyed) setError('Failed to load video')
      }
    }

    loadSignedUrl()

    return () => {
      destroyed = true
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [playbackMode, videoId, courseId])

  // Watermark animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        x: Math.random() * 60 + 10,
        y: Math.random() * 60 + 10,
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Tab switch detection
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

  // Security: disable context menu and devtools keys
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventContext = (e: MouseEvent) => e.preventDefault()
    const preventKeys = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key))
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
    const pct = Math.round((videoRef.current.currentTime / videoRef.current.duration) * 100)
    setProgress(pct)
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
      videoRef.current.play()
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
    const time = (Number(e.target.value) / 100) * videoRef.current.duration
    videoRef.current.currentTime = time
    setProgress(Number(e.target.value))
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [])

  // Cleanup controls timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    }
  }, [])

  // No video available
  if (noVideo) {
    return <LectureComingSoon contentType="video" />
  }

  // Error state
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

      <div className="absolute top-3 right-3 z-20 pointer-events-none text-white/20 text-xs font-mono">
        {new Date().toLocaleDateString()}
      </div>
      <div className="absolute bottom-20 left-3 z-20 pointer-events-none text-white/20 text-xs font-mono">
        {studentEmail}
      </div>

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
        {playbackMode === 'direct' && effectiveUrl && (
          <source src={effectiveUrl} type="video/mp4" />
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
