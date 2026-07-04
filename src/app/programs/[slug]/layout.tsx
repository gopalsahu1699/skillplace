import type { Metadata } from 'next'
import { getTrainingPrograms } from '@/lib/supabase/queries'
import JsonLd from '@/components/seo/JsonLd'
import { createMetadata } from '@/lib/seo/metadata'
import { breadcrumbSchema, educationalOccupationalProgramSchema, pageSchema } from '@/lib/seo/json-ld'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const programs = await getTrainingPrograms()
  const program = programs.find((p: { slug: string }) => p.slug === slug)

  if (!program) {
    return createMetadata({
      title: 'Program Not Found | Skillplace Academy',
      description: 'The requested program could not be found.',
      path: `/programs/${slug}`,
    })
  }

  return createMetadata({
    title: `${program.name} - Engineering Program with Placement | Skillplace Academy`,
    description: program.short_description || program.description || `Join the ${program.name} program at Skillplace Academy. Comprehensive engineering training with hands-on projects and placement assistance.`,
    path: `/programs/${slug}`,
    keywords: [`${program.name}`, 'engineering training', 'placement program', 'skill development'],
  })
}

export default async function ProgramDetailLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const programs = await getTrainingPrograms()
  const program = programs.find((p: { slug: string }) => p.slug === slug)

  return (
    <>
      {program && (
        <>
          <JsonLd data={breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Programs', url: '/programs' },
            { name: program.name, url: `/programs/${program.slug}` },
          ])} />
          <JsonLd data={educationalOccupationalProgramSchema(program)} />
          <JsonLd data={pageSchema(
            `/programs/${program.slug}`,
            `${program.name} - Engineering Program with Placement | Skillplace Academy`,
            program.short_description || program.description || `Join the ${program.name} program at Skillplace Academy.`
          )} />
        </>
      )}
      {children}
    </>
  )
}
