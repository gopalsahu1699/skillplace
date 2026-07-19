'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

const errorMessages: Record<string, { title: string; description: string; action?: { label: string; href: string } }> = {
  cancelled: {
    title: 'Enrollment Cancelled',
    description: 'Your enrollment was cancelled. No charges were made.',
    action: { label: 'Try Again', href: '/programs' },
  },
  timeout: {
    title: 'Enrollment Timed Out',
    description: 'The enrollment session timed out. Please try again.',
    action: { label: 'Try Again', href: '/programs' },
  },
  duplicate: {
    title: 'Already Enrolled',
    description: 'It looks like you are already enrolled in this program.',
    action: { label: 'Go to Dashboard', href: '/student/my-programs' },
  },
  verification_failed: {
    title: 'Verification Failed',
    description: 'We could not verify your enrollment. Please contact support.',
    action: { label: 'Contact Support', href: '/contact' },
  },
  gateway_down: {
    title: 'Payment Gateway Unavailable',
    description: 'The payment service is temporarily unavailable. Please try again later.',
    action: { label: 'Try Again', href: '/programs' },
  },
  webhook_pending: {
    title: 'Enrollment Processing',
    description: 'Your enrollment is being processed. This may take a few moments.',
  },
  default: {
    title: 'Enrollment Failed',
    description: 'Something went wrong during enrollment. Please try again.',
    action: { label: 'Try Again', href: '/programs' },
  },
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'default'
  const error = errorMessages[reason] || errorMessages.default

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile">
      <div className="text-center max-w-md">
        <div className="inline-flex h-20 w-20 rounded-2xl items-center justify-center mb-6 bg-red-50">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
          {error.title}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
          {error.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {error.action && (
            <Link href={error.action.href}>
              <Button className="gap-2 rounded-xl">
                <RefreshCw className="h-4 w-4" />
                {error.action.label}
              </Button>
            </Link>
          )}
          <Link href="/">
            <Button variant="outline" className="gap-2 rounded-xl border-border-subtle">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function EnrollErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  )
}
