import type { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Placement Assistance | 95% Placement Rate | Skillplace Academy',
  description: 'Skillplace Academy\'s dedicated placement cell helps you land your dream engineering job. 200+ hiring partners, mock interviews, resume building, and career guidance included.',
  path: '/placements',
  keywords: ['engineering placements', 'job assistance program', 'campus placement', 'interview preparation', 'hiring partners India'],
})

export default function PlacementsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
