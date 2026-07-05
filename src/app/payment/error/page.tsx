import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Payment Error | Skillplace Academy',
  description: 'There was an issue processing your payment. Please try again or contact our support team.',
  robots: { index: false, follow: false },
}

export default async function PaymentErrorPage(props: { searchParams: Promise<{ reason?: string }> }) {
  const searchParams = await props.searchParams
  const reason = searchParams.reason

  const errorMessages: Record<string, string> = {
    rate_limit: 'Too many requests. Please wait a moment and try again.',
    missing_order: 'No order reference was found. Please try enrolling again.',
    not_found: 'We couldn\'t find your payment record. Please contact support.',
    verification_failed: 'Payment verification failed. Your account may not have been credited yet.',
  }

  const message = reason ? errorMessages[reason] : null

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
          Payment Error
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
          {message || 'Something went wrong while processing your payment. Please try again or contact support.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/courses"
            className="bg-secondary text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all shadow-lg"
          >
            Browse Courses
          </Link>
          <Link
            href="/contact"
            className="bg-white border border-border-subtle text-on-surface px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-surface-container-low transition-all"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
