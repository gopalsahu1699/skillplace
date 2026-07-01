'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  Lock,
  Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import ErrorBoundary from '@/components/course/ErrorBoundary'
import { cn } from '@/lib/utils'

interface ProgramLesson {
  id: string
  title: string
  content_type: string
  order_index: number
  duration_minutes: number | null
}

interface ProgramModule {
  id: string
  title: string
  order_index: number
  lessons: ProgramLesson[]
}

interface CourseWithModules {
  id: string
  title: string
  slug: string
  modules: ProgramModule[]
}

interface ProgramLearnClientProps {
  programName: string
  programSlug: string
  courses: CourseWithModules[]
}

export default function ProgramLearnClient({
  programName,
  programSlug,
  courses,
}: ProgramLearnClientProps) {
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProgress() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const allLessonIds = courses.flatMap((c) =>
        c.modules.flatMap((m) => (m.lessons || []).map((l) => l.id))
      )

      if (allLessonIds.length === 0) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .in('lesson_id', allLessonIds)

      setCompletedLessonIds(new Set((data || []).map((d) => d.lesson_id)))
      setLoading(false)
    }

    fetchProgress()
  }, [courses])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <ErrorBoundary fallbackTitle="Program content error" fallbackMessage="Failed to load program content.">
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/programs/${programSlug}`}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Back to Program
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
            {programName}
          </h1>
          <p className="text-slate-500 mt-1">
            Select a course to start learning
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No Courses Available
            </h2>
            <p className="text-slate-500">
              This program does not have any courses yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course, index) => {
              const totalLessons = course.modules.reduce(
                (a, m) => a + (m.lessons?.length || 0),
                0
              )
              const completedCount = course.modules.reduce(
                (a, m) =>
                  a +
                  (m.lessons?.filter((l) => completedLessonIds.has(l.id))
                    .length || 0),
                0
              )
              const isComplete = totalLessons > 0 && completedCount === totalLessons
              const progressPercent =
                totalLessons > 0
                  ? Math.round((completedCount / totalLessons) * 100)
                  : 0

              const firstLesson = course.modules
                .slice()
                .sort((a, b) => a.order_index - b.order_index)
                .flatMap((m) =>
                  (m.lessons || [])
                    .slice()
                    .sort((a, b) => a.order_index - b.order_index)
                )[0]

              return (
                <Link
                  key={course.id}
                  href={
                    firstLesson
                      ? `/programs/${programSlug}/learn/${course.slug}`
                      : '#'
                  }
                  className={cn(
                    'block bg-white rounded-2xl border border-slate-200 p-6 transition-all hover:shadow-md hover:border-blue-200',
                    !firstLesson && 'opacity-60 cursor-not-allowed pointer-events-none'
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold',
                          isComplete
                            ? 'bg-green-100 text-green-600'
                            : 'bg-blue-100 text-blue-600'
                        )}
                      >
                        {isComplete ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{course.title}</h3>
                        <p className="text-xs text-slate-500">
                          {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 shrink-0 mt-1" />
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        isComplete ? 'bg-green-500' : 'bg-blue-600'
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {completedCount}/{totalLessons} completed
                    </span>
                    {isComplete && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                        Completed
                      </Badge>
                    )}
                    {!isComplete && progressPercent > 0 && (
                      <span className="text-blue-600 font-medium">
                        {progressPercent}%
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  )
}
