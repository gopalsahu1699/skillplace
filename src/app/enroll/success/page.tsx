import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Enrollment Successful | Skillplace Academy',
  description: 'Your enrollment has been confirmed. Welcome to Skillplace Academy!',
  robots: { index: false, follow: false },
}

export default function EnrollSuccessPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
          Enrollment Successful!
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
          Welcome to Skillplace Academy! Your enrollment has been confirmed. You can now access your course materials and start learning.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/courses"
            className="bg-secondary text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all shadow-lg"
          >
            My Courses
          </Link>
          <Link
            href="/programs"
            className="bg-white border border-border-subtle text-on-surface px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-surface-container-low transition-all"
          >
            View Programs
          </Link>
        </div>
      </div>
    </div>
  )
}
