import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import ProgramLearnClient from './ProgramLearnClient'

export const dynamic = 'force-dynamic'

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

  const { data: enrollment } = await adminSupabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('program_id', program.id)
    .in('status', ['active', 'completed'])
    .maybeSingle()

  if (!enrollment) {
    const { data: courseIds } = await adminSupabase
      .from('program_courses')
      .select('course_id')
      .eq('program_id', program.id)

    if (courseIds && courseIds.length > 0) {
      const { data: courseEnrollment } = await adminSupabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['active', 'completed'])
        .in('course_id', courseIds.map((pc) => pc.course_id))
        .maybeSingle()

      if (!courseEnrollment) {
        redirect(`/programs/${slug}`)
      }
    } else {
      redirect(`/programs/${slug}`)
    }
  }

  const { data: programCourseLinks } = await adminSupabase
    .from('program_courses')
    .select('course_id')
    .eq('program_id', program.id)
    .order('order_index', { ascending: true })

  const courseIds = (programCourseLinks || []).map((pc) => pc.course_id).filter(Boolean)

  const { data: coursesData } = courseIds.length > 0
    ? await adminSupabase
        .from('courses')
        .select('id, title, slug')
        .in('id', courseIds)
    : { data: null }

  const courses = (coursesData || [])
    .map((c) => ({ id: c.id, title: c.title, slug: c.slug }))

  let modulesData: {
    id: string
    course_id: string
    title: string
    description: string | null
    thumbnail_url: string | null
    order_index: number
    lessons: {
      id: string
      module_id: string
      title: string
      content_type: string
      order_index: number
      duration_minutes: number | null
    }[]
  }[] = []

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

  const coursesWithModules = courses.map((course) => ({
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
