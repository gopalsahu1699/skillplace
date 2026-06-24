import { useState, useRef, useEffect, useCallback } from 'react'
import { Shield, AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, Loader2, EyeOff } from 'lucide-react'

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
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Tab visibility detection
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

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    if (playing) {
      controlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [playing])

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const pct = Math.round((videoRef.current.currentTime / videoRef.current.duration) * 100)
    setProgress(pct)
    setCurrentTime(videoRef.current.currentTime)
    if (pct > 0 && pct % 10 === 0) onProgress?.(pct)
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

      {/* Moving Watermark */}
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

      {/* Corner watermarks */}
      <div className="absolute top-3 right-3 z-20 pointer-events-none text-white/20 text-xs font-mono">
        {new Date().toLocaleDateString()}
      </div>
      <div className="absolute bottom-20 left-3 z-20 pointer-events-none text-white/20 text-xs font-mono">
        {studentEmail}
      </div>

      {/* Video */}
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

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
      )}

      {/* Tab Warning */}
      {showTabWarning && (
        <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <EyeOff className="h-12 w-12 mx-auto mb-3 text-yellow-400" />
            <p className="font-bold text-lg mb-2">Video Paused</p>
            <p className="text-sm text-white/70 mb-4">Playback paused for security when you switch tabs.</p>
            <button 
              onClick={() => {
                setShowTabWarning(false)
                videoRef.current?.play()
                setPlaying(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {/* Play Overlay */}
      {!playing && !loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 cursor-pointer" onClick={togglePlay}>
          <div className="h-16 w-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
            <Play className="h-7 w-7 text-slate-900 ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls */}
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
