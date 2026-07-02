'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { notify } from '@/lib/notifications'
import LearningLayout from '@/components/course/LearningLayout'
import LessonPlayer from '@/components/course/LessonPlayer'
import TestPlayer from '@/components/course/TestPlayer'
import LectureComingSoon from '@/components/course/LectureComingSoon'
import ErrorBoundary from '@/components/course/ErrorBoundary'
import { cn } from '@/lib/utils'
import type { Test } from '@/types'

interface ModuleLesson {
  id: string
  module_id: string
  title: string
  content_type: string
  video_url: string | null
  video_id: string | null
  r2_source_key: string | null
  video_duration: number | null
  pdf_url: string | null
  text_content: string | null
  duration_minutes: number | null
  is_downloadable: boolean
  order_index: number
  is_free: boolean
  description: string | null
}

interface ModuleWithLessons {
  id: string
  course_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  order_index: number
  lessons: ModuleLesson[]
}

interface CourseLearnClientProps {
  programSlug: string
  programName: string
  course: { id: string; title: string; slug: string }
  modules: ModuleWithLessons[]
  userId: string
  userName?: string
  userEmail?: string
}

export default function CourseLearnClient({
  programSlug,
  programName,
  course,
  modules,
  userId,
  userName = 'Student',
  userEmail = '',
}: CourseLearnClientProps) {
  const [activeLesson, setActiveLesson] = useState<ModuleLesson | null>(
    modules?.[0]?.lessons?.[0] || null
  )
  const [activeCourseSlug, setActiveCourseSlug] = useState(course.slug)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(
    new Set()
  )
  const [completedTestIds, setCompletedTestIds] = useState<Set<string>>(
    new Set()
  )
  const [currentTest, setCurrentTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProgress() {
      try {
        const allLessonIds = modules.flatMap((m) =>
          (m.lessons || []).map((l) => l.id)
        )

        if (allLessonIds.length === 0) {
          setLoading(false)
          return
        }

        const { data } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('is_completed', true)
          .in('lesson_id', allLessonIds)

        setCompletedLessonIds(new Set((data || []).map((d) => d.lesson_id)))

        const { data: attempts } = await supabase
          .from('test_attempts')
          .select('test_id')
          .eq('user_id', userId)
          .eq('passed', true)

        if (attempts && attempts.length > 0) {
          const { data: tests } = await supabase
            .from('tests')
            .select('id')
            .in('lesson_id', allLessonIds)

          if (tests) {
            const passedTestIds = tests
              .filter((t) => attempts.some((a) => a.test_id === t.id))
              .map((t) => t.id)
            setCompletedTestIds(new Set(passedTestIds))
          }
        }
      } catch {
        // Silent fail for progress loading
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [modules, userId])

  useEffect(() => {
    if (!activeLesson) return

    if (activeLesson.content_type === 'quiz') {
      ;(async () => {
        try {
          const { data } = await supabase
            .from('tests')
            .select('*')
            .eq('course_id', course.id)
            .eq('is_active', true)
            .single()
          setCurrentTest(data)
        } catch {}
      })()
    } else {
      Promise.resolve().then(() => setCurrentTest(null))
    }
  }, [activeLesson, course.id])

  const allLessons = modules.flatMap((m) =>
    (m.lessons || []).slice().sort((a, b) => a.order_index - b.order_index)
  )
  const currentIndex = allLessons.findIndex(
    (l) => l.id === activeLesson?.id
  )

  const handleLessonClick = useCallback((lesson: ModuleLesson, courseSlug: string) => {
    setActiveLesson(lesson)
    setActiveCourseSlug(courseSlug)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleLessonComplete = useCallback((lessonId: string) => {
    setCompletedLessonIds((prev) => new Set([...prev, lessonId]))
  }, [])

  const handleTestComplete = useCallback((passed: boolean, _score: number) => {
    if (passed && activeLesson) {
      setCompletedTestIds((prev) => new Set([...prev, activeLesson.id]))
      handleLessonComplete(activeLesson.id)
    }
  }, [activeLesson?.id, handleLessonComplete])

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setActiveLesson(allLessons[currentIndex - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentIndex, allLessons])

  const handleNext = useCallback(() => {
    if (currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentIndex, allLessons])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading course content...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary fallbackTitle="Course content error" fallbackMessage="Failed to load course content.">
      <LearningLayout
        programName={programName}
        programSlug={programSlug}
        courses={[
          {
            ...course,
            modules: modules.map((m) => ({
              ...m,
              thumbnail_url: m.thumbnail_url || null,
              lessons: m.lessons || [],
            })),
          },
        ]}
        currentCourseSlug={activeCourseSlug}
        currentLessonId={activeLesson?.id || null}
        completedLessonIds={completedLessonIds}
        onLessonClick={handleLessonClick}
      >
        {activeLesson ? (
          <div className="max-w-4xl mx-auto">
            {activeLesson.content_type === 'quiz' ? (
              currentTest ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-6">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900">
                      {activeLesson.title || 'Quiz'}
                    </h3>
                    {completedTestIds.has(activeLesson.id) && (
                      <Badge className="bg-green-100 text-green-700 border-0 ml-2">
                        Passed
                      </Badge>
                    )}
                  </div>
                  <TestPlayer
                    test={currentTest}
                    lessonId={activeLesson.id}
                    onComplete={handleTestComplete}
                  />
                </div>
              ) : (
                <LectureComingSoon contentType="quiz" lessonTitle={activeLesson.title} />
              )
            ) : (
              <LessonPlayer
                lesson={activeLesson}
                courseId={course.id}
                userId={userId}
                userName={userName}
                userEmail={userEmail}
                isCompleted={completedLessonIds.has(activeLesson.id)}
                onComplete={handleLessonComplete}
                onPrev={handlePrev}
                onNext={handleNext}
                hasPrev={currentIndex > 0}
                hasNext={currentIndex < allLessons.length - 1}
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-6 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                className="border-slate-300"
              >
                Previous Lesson
              </Button>

              {!completedLessonIds.has(activeLesson.id) &&
                activeLesson.content_type !== 'quiz' && (
                  <Button
                    size="sm"
                    onClick={() =>
                      activeLesson && handleLessonComplete(activeLesson.id)
                    }
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Complete
                  </Button>
                )}

              {completedLessonIds.has(activeLesson.id) && activeLesson.content_type !== 'quiz' && (
                <Badge className="bg-green-100 text-green-700 border-0 gap-1">
                  <CheckCircle className="h-3 w-3" /> Completed
                </Badge>
              )}

              <Button
                onClick={handleNext}
                disabled={currentIndex >= allLessons.length - 1}
                size="sm"
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Next Lesson
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <LectureComingSoon contentType="video" />
          </div>
        )}
      </LearningLayout>
    </ErrorBoundary>
  )
}
