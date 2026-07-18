import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register | Skillplace Academy',
  description: 'Create your Skillplace Academy account and start your journey towards a successful engineering career. Enroll in courses, track progress, and earn certificates.',
  alternates: { canonical: 'https://www.skillplace.in/register' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Register | Skillplace Academy',
    description: 'Create your Skillplace Academy account.',
    url: 'https://www.skillplace.in/register',
    siteName: 'Skillplace Academy',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
