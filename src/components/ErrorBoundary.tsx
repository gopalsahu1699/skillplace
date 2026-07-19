'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { handleError } from '@/lib/errors/ErrorHandler'
import { AlertTriangle, RefreshCw, Home, Copy } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  referenceId: string
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, referenceId: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    const appError = handleError(error)
    return { hasError: true, error, referenceId: appError.referenceId }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, referenceId: '' })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="h-14 w-14 bg-red-100 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Something went wrong</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          {this.state.referenceId && (
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Ref: {this.state.referenceId}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button onClick={this.handleReset} className="gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline" className="gap-2 border-slate-300 dark:border-slate-700 rounded-xl">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
