import type { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Job-Oriented Engineering Programs | 100% Placement Assistance | Skillplace Academy',
  description: 'Comprehensive 12-48 week engineering programs in Civil, Mechanical, Electrical & Electronics. Hands-on training, industry certification, and guaranteed placement support.',
  path: '/programs',
  keywords: ['engineering training program', 'job guarantee course', 'placement program India', 'engineering upskilling', 'career transition program'],
})

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
