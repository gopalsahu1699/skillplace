import { Metadata } from 'next'
import { getCourses } from '@/lib/supabase/queries'
import CoursesClient from './CoursesClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Civil, Mechanical, Electrical | Skillplace Academy',
  description: 'Browse our comprehensive range of engineering courses. Learn AutoCAD, Revit, SolidWorks, PLC, and more with live classes and projects.',
  openGraph: {
    title: 'Engineering Courses | Skillplace Academy',
    description: 'Browse our comprehensive range of engineering courses.',
    type: 'website',
  },
}

export default async function CoursesPage() {
  const courses = await getCourses()

  const branches = Array.from(
    new Map(
      courses
        .map((c) => c.branches)
        .filter((b): b is NonNullable<typeof b> => b != null)
        .map((b) => [b.id, b] as [string, typeof b])
    ).values()
  )

  return <CoursesClient courses={courses} categories={branches} />
}
