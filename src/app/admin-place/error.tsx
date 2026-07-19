'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { handleError } from '@/lib/errors/ErrorHandler'
import { AlertTriangle, RefreshCw, Home, Copy } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [referenceId, setReferenceId] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const appError = handleError(error, { route: '/admin-place' })
    setReferenceId(appError.referenceId)
  }, [error])

  const copyDetails = () => {
    navigator.clipboard.writeText(`Error: ${error.message}\nReference: ${referenceId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex h-16 w-16 bg-red-50 dark:bg-red-950/30 rounded-2xl items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Admin Panel Error</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Failed to load admin data. Please try again.</p>
        {referenceId && (
          <p className="text-xs text-slate-400 mb-4 font-mono">Ref: {referenceId}</p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} size="sm" className="gap-2 rounded-xl">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline" size="sm" className="gap-2 rounded-xl">
            <Home className="h-4 w-4" /> Go Home
          </Button>
          <Button onClick={copyDetails} variant="ghost" size="sm" className="gap-2 text-xs rounded-xl">
            <Copy className="h-3 w-3" /> {copied ? 'Copied' : 'Copy ID'}
          </Button>
        </div>
      </div>
    </div>
  )
}
