'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LessonContentErrorProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export default function LessonContentError({
  message = 'Something went wrong while loading this lesson.',
  onRetry,
  className,
}: LessonContentErrorProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-2xl overflow-hidden',
        className
      )}
    >
      <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="inline-flex h-16 w-16 rounded-2xl items-center justify-center mb-5 bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Unable to Load Content
        </h3>

        <p className="text-sm text-slate-500 max-w-sm mb-5">{message}</p>

        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
