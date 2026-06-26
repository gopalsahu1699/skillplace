import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import ProgramLearnClient from './ProgramLearnClient'

export const dynamic = 'force-dynamic'

interface CourseSummary {
  id: string
  title: string
  slug: string
}

interface LessonSummary {
  id: string
  module_id: string
  title: string
  content_type: string
  order_index: number
  duration_minutes: number | null
}

interface ModuleSummary {
  id: string
  course_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  order_index: number
  lessons: LessonSummary[]
}

interface CourseWithModules {
  id: string
  title: string
  slug: string
  modules: ModuleSummary[]
}

export default async function ProgramLearnPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirectedFrom=/programs/${slug}/learn`)
  }

  const { data: program } = await adminSupabase
    .from('training_programs')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .single()

  if (!program) {
    notFound()
  }

  // Check enrollment: either at program level or course level
  const { data: enrollment } = await adminSupabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('program_id', program.id)
    .in('status', ['active', 'completed'])
    .maybeSingle()

  // Also check if user enrolled in any course of this program
  const { data: courseEnrollment } = !enrollment ? await adminSupabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .in('status', ['active', 'completed'])
    .in('course_id', (
      await adminSupabase
        .from('program_courses')
        .select('course_id')
        .eq('program_id', program.id)
    ).data?.map((pc: any) => pc.course_id) || []
    ).maybeSingle() : { data: null }

  if (!enrollment && !courseEnrollment) {
    redirect(`/programs/${slug}`)
  }

  const { data: programCourses } = await adminSupabase
    .from('program_courses')
    .select('courses(*), course_id')
    .eq('program_id', program.id)
    .order('order_index', { ascending: true })

  const courses: CourseSummary[] = (programCourses || [])
    .map((pc: { courses: Record<string, unknown> | Record<string, unknown>[] | null }) => {
      if (!pc.courses) return null
      const c = Array.isArray(pc.courses) ? pc.courses[0] : pc.courses
      if (!c) return null
      return { id: c.id as string, title: c.title as string, slug: c.slug as string }
    })
    .filter(Boolean) as CourseSummary[]

  const courseIds = courses.map((c) => c.id)

  let modulesData: ModuleSummary[] = []

  if (courseIds.length > 0) {
    const { data: mods } = await adminSupabase
      .from('modules')
      .select('*, lessons(*)')
      .in('course_id', courseIds)
      .order('order_index', { ascending: true })

    modulesData = (mods || []).map((m: Record<string, unknown>) => ({
      id: m.id as string,
      course_id: m.course_id as string,
      title: m.title as string,
      description: (m.description as string) || null,
      thumbnail_url: (m.thumbnail_url as string) || null,
      order_index: (m.order_index as number) || 0,
      lessons: ((m.lessons as Record<string, unknown>[]) || [])
        .map((l) => ({
          id: l.id as string,
          module_id: l.module_id as string,
          title: l.title as string,
          content_type: l.content_type as string,
          order_index: (l.order_index as number) || 0,
          duration_minutes: (l.duration_minutes as number) || null,
        }))
        .sort((a, b) => a.order_index - b.order_index),
    }))
  }

  const coursesWithModules: CourseWithModules[] = courses.map((course) => ({
    ...course,
    modules: modulesData.filter((m) => m.course_id === course.id),
  }))

  return (
    <ProgramLearnClient
      programName={program.name}
      programSlug={program.slug}
      courses={coursesWithModules}
    />
  )
}
