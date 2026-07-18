import type { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbSchema, pageSchema } from '@/lib/seo/json-ld'

export const metadata: Metadata = createMetadata({
  title: 'Student Projects | Skillplace Academy',
  description: 'Explore real-world engineering projects completed by Skillplace Academy students. See practical applications of AutoCAD, Revit, SolidWorks, and more.',
  path: '/projects',
  keywords: ['engineering student projects', 'CAD projects', 'portfolio', 'student work showcase'],
})

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Projects', url: '/projects' },
      ])} />
      <JsonLd data={pageSchema(
        '/projects',
        'Student Projects | Skillplace Academy',
        'Explore real-world engineering projects by Skillplace Academy students.'
      )} />
      {children}
    </>
  )
}
