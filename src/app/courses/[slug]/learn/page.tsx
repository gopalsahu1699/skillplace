import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import CourseLearnClient from './CourseLearnClient'

export const dynamic = 'force-dynamic'

export default async function CourseLearnServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Fetch course (public data, no auth needed)
  const { data: course } = await adminSupabase
    .from('courses')
    .select('*, categories(*)')
    .eq('slug', slug)
    .single()

  if (!course) {
    notFound()
  }

  // Fetch modules with lessons (public data)
  const { data: modules } = await adminSupabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  const sortedModules = (modules || []).map(m => ({
    ...m,
    lessons: (m.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index),
  }))

  // Fetch enrollment count (public data)
  const { count: enrollmentCount } = await adminSupabase
    .from('enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', course.id)

  return <CourseLearnClient course={course} modules={sortedModules} enrollmentCount={enrollmentCount || 0} />
}
