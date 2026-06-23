'use client'
import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import VideoWatermark from './VideoWatermark'
import { useVideoSecurity } from '@/hooks/useVideoSecurity'

interface SecureVideoPlayerProps {
  src: string
  userEmail: string
}

export default function SecureVideoPlayer({ src, userEmail }: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  useVideoSecurity()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
      })
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Video loading failed. Please refresh.')
        }
      })
      return () => hls.destroy()
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.play().catch(() => {})
    }
  }, [src])

  return (
    <div className="video-container relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      />
      <VideoWatermark email={userEmail} />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
          {error}
        </div>
      )}
    </div>
  )
}
