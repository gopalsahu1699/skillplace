import type { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Contact Skillplace Academy | Admissions & Career Counseling | Bilaspur',
  description: 'Get in touch with Skillplace Academy. Visit our campus in Bilaspur, call +91 79878 14261, or email skillplaceacademy@gmail.com. Free career counseling available.',
  path: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
