import type { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Frequently Asked Questions | Skillplace Academy',
  description: 'Find answers to common questions about admissions, courses, fees, certifications, placement support, online/offline classes, and career guidance at Skillplace Academy.',
  path: '/faq',
})

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
