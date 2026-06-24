'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  url: string
  title?: string
  onProgress?: (seconds: number) => void
  initialTime?: number
  className?: string
}

function getVideoType(url: string): 'youtube' | 'vimeo' | 'direct' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('vimeo.com')) return 'vimeo'
  return 'direct'
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  return match ? match[1] : null
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export default function VideoPlayer({ url, title, onProgress, initialTime = 0, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(initialTime)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null)

  const videoType = getVideoType(url)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      onProgress?.(time)
    }
  }, [onProgress])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = val
      setVolume(val)
      setIsMuted(val === 0)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        container.requestFullscreen()
      }
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current)
    }
  }, [])

  if (videoType === 'youtube') {
    const videoId = getYouTubeId(url)
    if (!videoId) return <div className="bg-slate-100 rounded-2xl aspect-video flex items-center justify-center text-slate-500">Invalid YouTube URL</div>
    return (
      <div className={cn('relative rounded-2xl overflow-hidden bg-black aspect-video', className)}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title || 'Video'}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (videoType === 'vimeo') {
    const videoId = getVimeoId(url)
    if (!videoId) return <div className="bg-slate-100 rounded-2xl aspect-video flex items-center justify-center text-slate-500">Invalid Vimeo URL</div>
    return (
      <div className={cn('relative rounded-2xl overflow-hidden bg-black aspect-video', className)}>
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?byline=0&portrait=0`}
          title={title || 'Video'}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div
      className={cn('relative rounded-2xl overflow-hidden bg-black aspect-video group', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration)
            videoRef.current.currentTime = initialTime
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Play overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div className="h-16 w-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Play className="h-7 w-7 text-slate-900 ml-1" fill="currentColor" />
          </div>
        </button>
      )}

      {/* Controls */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
        showControls ? 'opacity-100' : 'opacity-0'
      )}>
        {/* Progress bar */}
        <div className="mb-3">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" fill="currentColor" />}
          </button>

          <span className="text-white/80 text-xs font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-2 ml-2">
            <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>

          <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors ml-auto">
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
