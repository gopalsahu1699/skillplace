import type { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Student Projects | Skillplace Academy',
  description: 'Explore real-world engineering projects completed by Skillplace Academy students. See practical applications of AutoCAD, Revit, SolidWorks, and more.',
  path: '/projects',
  keywords: ['engineering student projects', 'CAD projects', 'portfolio', 'student work showcase'],
})

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
