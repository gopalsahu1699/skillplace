'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ImageOff, VideoOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageFallbackProps {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  width?: number
  height?: number
}

export function ImageWithFallback({ src, alt, fallbackSrc, className, width, height }: ImageFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  if (hasError) {
    return (
      <div
        className={cn('flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl', className)}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <ImageOff className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500 mb-2">Image unavailable</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => { setHasError(false); setRetryKey((k) => k + 1) }}
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <img
      key={retryKey}
      src={fallbackSrc && hasError ? fallbackSrc : src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={() => {
        if (fallbackSrc && !hasError) {
          setHasError(true)
        } else {
          setHasError(true)
        }
      }}
      loading="lazy"
    />
  )
}

interface VideoFallbackProps {
  onRetry?: () => void
  className?: string
  message?: string
}

export function VideoUnavailable({ onRetry, className, message }: VideoFallbackProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center bg-slate-900 rounded-xl p-8 min-h-[300px]', className)}>
      <VideoOff className="h-12 w-12 text-slate-500 mb-4" />
      <p className="text-slate-300 text-sm mb-2">
        {message ?? 'This lecture is temporarily unavailable.'}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      )}
    </div>
  )
}
