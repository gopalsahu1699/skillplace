'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LessonContentErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export default function LessonContentError({
  title = 'This lecture is currently unavailable',
  message = 'An error occurred while loading this lesson. Please try again.',
  onRetry,
}: LessonContentErrorProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 text-center">
      <div className="inline-flex h-12 w-12 bg-red-50 dark:bg-red-950/30 rounded-xl items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="border-slate-300 dark:border-slate-700 gap-2 rounded-xl">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}
