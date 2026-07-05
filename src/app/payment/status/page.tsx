import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Payment Status | Skillplace Academy',
  description: 'Check the status of your recent payment.',
  robots: { index: false, follow: false },
}

export default async function PaymentStatusPage(props: { searchParams: Promise<{ order_id?: string; status?: string }> }) {
  const searchParams = await props.searchParams
  const { order_id: orderId, status } = searchParams

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
          Payment {status === 'failed' ? 'Failed' : 'Pending'}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-2">
          {status === 'failed'
            ? 'Your payment was not completed. Please try again.'
            : 'Your payment is being processed. This may take a few moments.'}
        </p>
        {orderId && (
          <p className="text-sm text-on-surface-variant mb-8">
            Order ID: <span className="font-mono text-secondary">{orderId}</span>
          </p>
        )}
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
