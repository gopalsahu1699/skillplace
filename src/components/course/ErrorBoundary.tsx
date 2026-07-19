'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { handleError } from '@/lib/errors/ErrorHandler'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallbackTitle?: string
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error: Error | null
  referenceId: string
}

export default class CourseErrorBoundary extends Component<Props, State> {
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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="inline-flex h-16 w-16 bg-red-50 dark:bg-red-950/30 rounded-2xl items-center justify-center mb-5">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              {this.props.fallbackMessage || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            {this.state.referenceId && (
              <p className="text-xs text-slate-400 mb-4 font-mono">Ref: {this.state.referenceId}</p>
            )}
            <div className="flex items-center justify-center gap-3">
              <Button onClick={this.handleReset} className="rounded-xl gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="border-slate-300 dark:border-slate-700 rounded-xl">
                Reload Page
              </Button>
              <Link href="/">
                <Button variant="ghost" className="rounded-xl">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
