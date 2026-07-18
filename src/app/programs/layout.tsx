import type { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'
import { getTrainingPrograms } from '@/lib/supabase/queries'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbSchema, pageSchema, itemListSchema } from '@/lib/seo/json-ld'

export const metadata: Metadata = createMetadata({
  title: 'Job-Oriented Engineering Programs | 100% Placement Assistance | Skillplace Academy',
  description: 'Comprehensive 12-48 week engineering programs in Civil, Mechanical, Electrical & Electronics. Hands-on training, industry certification, and guaranteed placement support.',
  path: '/programs',
  keywords: ['engineering training program', 'job guarantee course', 'placement program India', 'engineering upskilling', 'career transition program'],
})

export default async function ProgramsLayout({ children }: { children: React.ReactNode }) {
  const programs = await getTrainingPrograms()

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Programs', url: '/programs' },
      ])} />
      <JsonLd data={pageSchema(
        '/programs',
        'Job-Oriented Engineering Programs | 100% Placement Assistance | Skillplace Academy',
        'Comprehensive engineering programs with hands-on training, industry certification, and placement assistance.'
      )} />
      {programs.length > 0 && (
        <JsonLd data={itemListSchema(
          programs.slice(0, 50) as { name: string; slug: string }[],
          'EducationalOccupationalProgram',
          (p) => p.name,
          (p) => `/programs/${p.slug}`
        )} />
      )}
      {children}
    </>
  )
}
