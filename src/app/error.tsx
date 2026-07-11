'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { isNetworkError } from '@/lib/network'
import { WifiOff, AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    console.error('Application error:', error)
    setIsOffline(!navigator.onLine || isNetworkError(error))
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className={`inline-flex h-16 w-16 ${isOffline ? 'bg-amber-50' : 'bg-red-50'} rounded-full items-center justify-center mb-6`}>
          {isOffline ? (
            <WifiOff className="h-8 w-8 text-amber-500" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-red-500" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          {isOffline ? 'No Internet Connection' : 'Something went wrong'}
        </h2>
        <p className="text-slate-500 mb-6">
          {isOffline
            ? 'You appear to be offline. Please check your internet connection and try again.'
            : 'An unexpected error occurred. Please try again or contact support if the problem persists.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go Home
          </Button>
        </div>
        {error.digest && !isOffline && (
          <p className="mt-4 text-xs text-slate-400">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
