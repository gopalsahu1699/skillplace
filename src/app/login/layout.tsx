import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Skillplace Academy',
  description: 'Sign in to your Skillplace Academy account to access your courses, programs, certificates, and learning dashboard.',
  alternates: { canonical: 'https://www.skillplace.in/login' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Login | Skillplace Academy',
    description: 'Sign in to your Skillplace Academy account.',
    url: 'https://www.skillplace.in/login',
    siteName: 'Skillplace Academy',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
