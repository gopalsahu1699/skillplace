'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

const errorMessages: Record<string, { title: string; description: string; action?: { label: string; href: string } }> = {
  cancelled: {
    title: 'Payment Cancelled',
    description: 'Your payment was cancelled. No charges were made.',
    action: { label: 'Try Again', href: '/programs' },
  },
  timeout: {
    title: 'Payment Timed Out',
    description: 'The payment session timed out. Please try again.',
    action: { label: 'Try Again', href: '/programs' },
  },
  duplicate: {
    title: 'Duplicate Payment',
    description: 'It looks like this payment was already processed. Please check your enrollments.',
    action: { label: 'View Enrollments', href: '/student/my-programs' },
  },
  verification_failed: {
    title: 'Payment Verification Failed',
    description: 'We could not verify your payment. Please contact support if you were charged.',
    action: { label: 'Contact Support', href: '/contact' },
  },
  gateway_down: {
    title: 'Payment Gateway Unavailable',
    description: 'The payment service is temporarily unavailable. Please try again later.',
    action: { label: 'Try Again', href: '/programs' },
  },
  webhook_pending: {
    title: 'Payment Processing',
    description: 'Your payment is being processed. This may take a few moments.',
  },
  default: {
    title: 'Payment Failed',
    description: 'Something went wrong while processing your payment. Please try again.',
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

export default function PaymentErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  )
}
