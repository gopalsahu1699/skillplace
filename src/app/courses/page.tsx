import type { Metadata } from 'next'
import { getCourses } from '@/lib/supabase/queries'
import CoursesClient from './CoursesClient'
import JsonLd from '@/components/seo/JsonLd'
import { createMetadata } from '@/lib/seo/metadata'
import { breadcrumbSchema, pageSchema, itemListSchema } from '@/lib/seo/json-ld'

export const metadata: Metadata = createMetadata({
  title: 'Engineering Courses in Bilaspur - AutoCAD, Revit, SolidWorks, PLC | Skillplace Academy',
  description: 'Explore 30+ engineering courses in Bilaspur including AutoCAD, Revit Architecture, SolidWorks, PLC Programming, and more. Practical training with live projects, expert mentors, and certification.',
  path: '/courses',
  keywords: ['Engineering Training Bilaspur', 'Civil Engineering Training Bilaspur', 'Electrical Engineering Training Bilaspur', 'Mechanical Engineering Training Bilaspur', 'CAD courses', 'BIM training', 'PLC SCADA course', 'engineering software training'],
})

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const courses = await getCourses()

  const branches = Array.from(
    new Map(
      courses
        .filter((c: { branches?: unknown }) => c.branches)
        .map((c: { branches: { id: string } }) => [c.branches.id, c.branches])
    ).values()
  ) as { id: string; name: string; slug: string }[]

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Courses', url: '/courses' },
      ])} />
      <JsonLd data={pageSchema(
        '/courses',
        'Engineering Courses - AutoCAD, Revit, SolidWorks, PLC | Skillplace Academy',
        'Browse 30+ industry-relevant engineering courses at Skillplace Academy'
      )} />
      <JsonLd data={itemListSchema(
        courses.slice(0, 50) as { title: string; slug: string }[],
        'Course',
        (c) => c.title,
        (c) => `/courses/${c.slug}`
      )} />
      <CoursesClient courses={courses} categories={branches} />
    </>
  )
}
