'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { handleError } from '@/lib/errors/ErrorHandler'
import { errorLogger } from '@/lib/errors/ErrorLogger'
import { isNetworkError } from '@/lib/network'
import { WifiOff, AlertTriangle, RefreshCw, Home, Copy, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [isOffline, setIsOffline] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)
  const [appError, setAppError] = useState<ReturnType<typeof handleError> | null>(null)

  useEffect(() => {
    setIsOffline(!navigator.onLine || isNetworkError(error))
    const classified = handleError(error, { route: window.location.pathname })
    setAppError(classified)
  }, [error])

  const referenceId = appError?.referenceId ?? error.digest ?? 'N/A'

  const copyDetails = () => {
    const details = [
      `Error: ${error.message}`,
      `Reference ID: ${referenceId}`,
      `URL: ${typeof window !== 'undefined' ? window.location.href : ''}`,
      `Timestamp: ${new Date().toISOString()}`,
    ].join('\n')

    navigator.clipboard.writeText(details).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="text-center max-w-md w-full">
        <div className={cn(
          'inline-flex h-20 w-20 rounded-2xl items-center justify-center mb-6',
          isOffline ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-red-50 dark:bg-red-950/30',
        )}>
          {isOffline ? (
            <WifiOff className="h-10 w-10 text-amber-500" />
          ) : (
            <ShieldAlert className="h-10 w-10 text-red-500" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {isOffline ? 'No Internet Connection' : 'Something went wrong'}
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {isOffline
            ? 'You appear to be offline. Please check your internet connection and try again.'
            : 'An unexpected error occurred. Please try again or contact support if the problem persists.'}
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <Button onClick={reset} className="gap-2 rounded-xl">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline" className="gap-2 rounded-xl border-slate-300 dark:border-slate-700">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
          <Button onClick={() => window.location.href = '/contact'} variant="ghost" className="gap-2 rounded-xl text-slate-500">
            Contact Support
          </Button>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
          <p>
            Reference ID:{' '}
            <span className="font-mono text-slate-500 dark:text-slate-400">{referenceId}</span>
          </p>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mt-2"
          >
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showDetails ? 'Hide' : 'Show'} error details
          </button>

          {showDetails && (
            <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-left max-w-sm mx-auto">
              <p className="font-mono text-xs text-slate-600 dark:text-slate-400 break-words mb-2">
                {error.message}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2 gap-1"
                onClick={copyDetails}
              >
                <Copy className="h-3 w-3" />
                {copied ? 'Copied!' : 'Copy Details'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
