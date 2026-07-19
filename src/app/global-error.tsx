'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { isNetworkError } from '@/lib/network'
import { generateReferenceId } from '@/lib/errors/BaseAppError'
import { WifiOff, ShieldAlert, RefreshCw, Home, Copy } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [isOffline, setIsOffline] = useState(false)
  const [copied, setCopied] = useState(false)
  const [referenceId] = useState(() => error.digest ?? generateReferenceId())

  useEffect(() => {
    setIsOffline(typeof navigator !== 'undefined' && (!navigator.onLine || isNetworkError(error)))
  }, [error])

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
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
          <div className="text-center max-w-md w-full">
            <div className={`inline-flex h-20 w-20 rounded-2xl items-center justify-center mb-6 ${
              isOffline ? 'bg-amber-50' : 'bg-red-50'
            }`}>
              {isOffline ? (
                <WifiOff className="h-10 w-10 text-amber-500" />
              ) : (
                <ShieldAlert className="h-10 w-10 text-red-500" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {isOffline ? 'No Internet Connection' : 'Critical Error'}
            </h1>

            <p className="text-slate-500 mb-6 leading-relaxed">
              {isOffline
                ? 'You appear to be offline. Please check your internet connection and try again.'
                : 'A critical error occurred. Please try reloading the page or contact support.'}
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Button onClick={reset} className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline" className="gap-2 rounded-xl border-slate-300">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p>
                Reference ID:{' '}
                <span className="font-mono text-slate-500">{referenceId}</span>
              </p>

              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2 gap-1 mt-2"
                onClick={copyDetails}
              >
                <Copy className="h-3 w-3" />
                {copied ? 'Copied!' : 'Copy Error Details'}
              </Button>
            </div>
          </div>
        </div>

        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc; 
            color: #1e293b; 
          }
          .min-h-screen { min-height: 100vh; }
          .flex { display: flex; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .text-center { text-align: center; }
          .max-w-md { max-width: 28rem; }
          .w-full { width: 100%; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .inline-flex { display: inline-flex; }
          .h-20 { height: 5rem; }
          .w-20 { width: 5rem; }
          .rounded-2xl { border-radius: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .text-2xl { font-size: 1.5rem; }
          .font-bold { font-weight: 700; }
          .text-slate-900 { color: #1e293b; }
          .text-slate-500 { color: #64748b; }
          .text-slate-400 { color: #94a3b8; }
          .leading-relaxed { line-height: 1.625; }
          .flex-wrap { flex-wrap: wrap; }
          .gap-3 { gap: 0.75rem; }
          .gap-2 { gap: 0.5rem; }
          .gap-1 { gap: 0.25rem; }
          .justify-center { justify-content: center; }
          .text-xs { font-size: 0.75rem; }
          .font-mono { font-family: 'SF Mono', Monaco, monospace; }
          .mt-2 { margin-top: 0.5rem; }
          .h-4 { height: 1rem; }
          .w-4 { width: 1rem; }
          .h-7 { height: 1.75rem; }
          .inline-flex { display: inline-flex; }
          .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          button { cursor: pointer; font-family: inherit; }
          .bg-amber-50 { background: #fffbeb; }
          .bg-red-50 { background: #fef2f2; }
          .text-amber-500 { color: #f59e0b; }
          .text-red-500 { color: #ef4444; }
          .space-y-1 > * + * { margin-top: 0.25rem; }
          svg { display: inline-block; vertical-align: middle; }
        `}</style>
      </body>
    </html>
  )
}
