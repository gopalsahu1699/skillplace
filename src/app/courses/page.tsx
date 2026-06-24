import { getCourses, getCategories } from '@/lib/supabase/queries'
import CoursesClient from './CoursesClient'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const [courses, categories] = await Promise.all([getCourses(), getCategories()])

  return <CoursesClient courses={courses} categories={categories} />
}
