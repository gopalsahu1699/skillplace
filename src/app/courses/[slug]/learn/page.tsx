import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import CourseLearnClient from './CourseLearnClient'
import type { Course, Module, Lesson } from '@/types'

export const dynamic = 'force-dynamic'

interface LessonRow extends Omit<Lesson, 'content_type'> {
  content_type: string
  r2_source_key: string | null
  r2_original_filename: string | null
  stream_status: string | null
  is_active: boolean
}

interface ModuleRow extends Omit<Module, 'lessons'> {
  lessons: LessonRow[]
}

export default async function CourseLearnServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: course, error: courseError } = await adminSupabase
    .from('courses')
    .select('*, branches(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (courseError || !course) {
    notFound()
  }

  const { data: modules } = await adminSupabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  const sortedModules: (Module & { lessons: Lesson[] })[] = (modules || []).map((m: ModuleRow) => ({
    id: m.id,
    course_id: m.course_id,
    title: m.title,
    description: m.description,
    thumbnail_url: null,
    order_index: m.order_index,
    lessons: (m.lessons || [])
      .filter((l) => l.is_active !== false)
      .sort((a, b) => a.order_index - b.order_index)
      .map((l) => {
        let contentType = l.content_type as 'video' | 'pdf' | 'quiz' | 'text' | null
        if (!contentType) {
          if (l.video_url || l.video_id) contentType = 'video'
          else if (l.pdf_url) contentType = 'pdf'
          else if (l.text_content) contentType = 'text'
          else contentType = 'video'
        }
        return {
          id: l.id,
          module_id: l.module_id,
          title: l.title,
          description: l.description,
          content_type: contentType,
          video_url: l.video_url,
          video_id: l.video_id,
          r2_source_key: l.r2_source_key || null,
          video_duration: l.video_duration,
          pdf_url: l.pdf_url,
          text_content: l.text_content,
          duration_minutes: l.duration_minutes,
          is_downloadable: l.is_downloadable,
          order_index: l.order_index,
          is_free: l.is_free,
        }
      }),
  }))

  return <CourseLearnClient course={course} modules={sortedModules} enrollmentCount={0} />
}
