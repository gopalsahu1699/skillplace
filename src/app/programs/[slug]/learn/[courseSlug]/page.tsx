import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import CourseLearnClient from './CourseLearnClient'

export const dynamic = 'force-dynamic'

export default async function CourseLearnPage({
  params,
}: {
  params: Promise<{ slug: string; courseSlug: string }>
}) {
  const { slug, courseSlug } = await params

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirectedFrom=/programs/${slug}/learn/${courseSlug}`)
  }

  const { data: program } = await adminSupabase
    .from('training_programs')
    .select('id, name, slug')
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

  // Also check course-level enrollment
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

  const { data: course } = await adminSupabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', courseSlug)
    .single()

  if (!course) {
    notFound()
  }

  const { data: modules } = await adminSupabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  const sortedModules = (modules || []).map((m: Record<string, unknown>) => ({
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
        content_type: l.content_type as 'video' | 'pdf' | 'quiz' | 'text',
        video_url: (l.video_url as string) || null,
        video_id: (l.video_id as string) || null,
        video_duration: (l.video_duration as number) || null,
        pdf_url: (l.pdf_url as string) || null,
        text_content: (l.text_content as string) || null,
        duration_minutes: (l.duration_minutes as number) || null,
        order_index: (l.order_index as number) || 0,
        is_free: (l.is_free as boolean) || false,
        description: (l.description as string) || null,
        is_downloadable: (l.is_downloadable as boolean) || false,
      }))
      .sort((a, b) => a.order_index - b.order_index),
  }))

  return (
    <CourseLearnClient
      programSlug={slug}
      programName={program.name}
      course={course}
      modules={sortedModules}
      userId={user.id}
    />
  )
}
