import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Skillplace Academy',
  description: 'The page you are looking for does not exist. Browse our engineering courses or contact our support team for assistance.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile">
      <div className="text-center max-w-lg">
        <div className="text-[120px] md:text-[160px] font-extrabold text-primary-container/10 leading-none mb-4">404</div>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
          Page Not Found
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-secondary text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all shadow-lg"
          >
            Go Home
          </Link>
          <Link
            href="/courses"
            className="bg-white border border-border-subtle text-on-surface px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-surface-container-low transition-all"
          >
            Browse Courses
          </Link>
          <Link
            href="/contact"
            className="bg-white border border-border-subtle text-on-surface px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-surface-container-low transition-all"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
