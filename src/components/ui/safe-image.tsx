'use client'

import { useState, useCallback, useMemo, type ImgHTMLAttributes } from 'react'
import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'

type SafeImageProps = Omit<ImageProps, 'onError'> & {
  /** Optional fallback element shown on error */
  fallback?: React.ReactNode
  /** Wrapper className when using fill mode */
  wrapperClassName?: string
}

type SafeImgProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Optional fallback element shown on error */
  fallback?: React.ReactNode
  /** Explicit width (required for CLS prevention) */
  width?: number
  /** Explicit height (required for CLS prevention) */
  height?: number
}

const isDev = process.env.NODE_ENV === 'development'

function logDevWarning(src: string | undefined, reason: string) {
  if (isDev && src) {
    logger.warn(`[SafeImage] ${reason}: ${src}`)
  }
}

/**
 * Validates whether a URL string points to a reachable image.
 * Returns false for null, undefined, empty, or obviously broken URLs.
 */
function isValidImageUrl(src: string | null | undefined): boolean {
  if (!src || typeof src !== 'string') return false
  const trimmed = src.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false
  try {
    const url = new URL(trimmed)
    if (!['http:', 'https:', 'blob:', 'data:'].includes(url.protocol)) return false
  } catch {
    return false
  }
  return true
}

/**
 * Skeleton loader displayed while the image is loading.
 */
function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]',
        className
      )}
      aria-hidden="true"
    />
  )
}

/**
 * Branded placeholder shown when an image fails to load.
 */
function ImagePlaceholder({ className, alt }: { className?: string; alt?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-400',
        className
      )}
      role="img"
      aria-label={alt || 'Image unavailable'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-1/3 h-1/3 opacity-40"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    </div>
  )
}

/**
 * SafeImage – wraps next/image with loading skeleton, fade-in, and error fallback.
 *
 * Features:
 * - Validates URLs before rendering
 * - Shows skeleton loader while loading
 * - Smooth fade-in after load
 * - Graceful fallback on error (no broken icons)
 * - Never crashes the page
 * - Logs warnings only in development
 */
export function SafeImage({
  src,
  alt,
  className,
  fill,
  sizes,
  priority,
  loading,
  placeholder,
  blurDataURL,
  fallback,
  wrapperClassName,
  width,
  height,
  ...rest
}: SafeImageProps) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading')

  const isValid = useMemo(() => isValidImageUrl(src as string), [src])

  const handleLoad = useCallback(() => {
    setLoadState('loaded')
  }, [])

  const handleError = useCallback(() => {
    setLoadState('error')
    logDevWarning(src as string, 'Failed to load image')
  }, [src])

  // Compute display state
  const isError = !isValid || loadState === 'error'
  const isLoaded = loadState === 'loaded'

  // Invalid URL → show placeholder immediately
  if (isError) {
    if (fallback) return <>{fallback}</>
    return (
      <ImagePlaceholder
        className={cn(
          fill ? 'absolute inset-0' : undefined,
          className
        )}
        alt={alt as string}
      />
    )
  }

  // Determine placeholder strategy
  const imagePlaceholder = placeholder === 'blur' && blurDataURL ? 'blur' as const : undefined

  const imageElement = (
    <Image
      src={src as string}
      alt={alt as string}
      width={fill ? undefined : (width as number)}
      height={fill ? undefined : (height as number)}
      fill={fill}
      sizes={sizes}
      priority={priority}
      loading={loading}
      placeholder={imagePlaceholder}
      blurDataURL={blurDataURL}
      className={cn(
        'transition-opacity duration-500',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      {...rest}
    />
  )

  if (fill) {
    return (
      <>
        {!isLoaded && (
          <ImageSkeleton className={cn('absolute inset-0', wrapperClassName)} />
        )}
        {imageElement}
      </>
    )
  }

  return (
    <div className={cn('relative', wrapperClassName)}>
      {!isLoaded && (
        <ImageSkeleton className="absolute inset-0" />
      )}
      {imageElement}
    </div>
  )
}

/**
 * SafeImg – a lighter alternative using a native <img> tag with error handling.
 * Use this when next/image optimization is not needed (e.g., very small icons).
 */
export function SafeImg({
  src,
  alt,
  className,
  fallback,
  onError,
  onLoad,
  width,
  height,
  ...rest
}: SafeImgProps) {
  const [hasLoadError, setHasLoadError] = useState(false)

  const isValid = useMemo(() => isValidImageUrl(src as string), [src])

  if (!isValid || hasLoadError) {
    if (fallback) return <>{fallback}</>
    return <ImagePlaceholder className={cn('rounded', className)} alt={alt as string} />
  }

  return (
    <img
      src={src as string}
      alt={alt as string}
      width={width}
      height={height}
      className={cn('transition-opacity duration-500', className)}
      loading="lazy"
      onError={(e) => {
        setHasLoadError(true)
        logDevWarning(src as string, 'Failed to load image')
        onError?.(e)
      }}
      onLoad={(e) => {
        onLoad?.(e)
      }}
      {...rest}
    />
  )
}

export default SafeImage
