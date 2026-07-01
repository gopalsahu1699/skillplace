'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  HelpCircle,
  CheckCircle,
  BookOpen,
  Menu,
  X,
  Clock,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayoutLesson {
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

interface LayoutModule {
  id: string
  title: string
  order_index: number
  lessons: LayoutLesson[]
}

interface CourseWithModules {
  id: string
  title: string
  slug: string
  modules: LayoutModule[]
}

interface LearningLayoutProps {
  programName: string
  programSlug: string
  courses: CourseWithModules[]
  currentCourseSlug: string
  currentLessonId: string | null
  completedLessonIds: Set<string>
  onLessonClick: (lesson: LayoutLesson, courseSlug: string) => void
  children: React.ReactNode
}

function getLessonIcon(type: string, isCompleted: boolean) {
  if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-600" />
  switch (type) {
    case 'video':
      return <Play className="h-4 w-4" />
    case 'pdf':
      return <FileText className="h-4 w-4" />
    case 'quiz':
      return <HelpCircle className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

export default function LearningLayout({
  programName,
  programSlug,
  courses,
  currentCourseSlug,
  currentLessonId,
  completedLessonIds,
  onLessonClick,
  children,
}: LearningLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    () => new Set([currentCourseSlug])
  )
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const activeLessonRef = useRef<HTMLButtonElement | null>(null)
  const sidebarRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (activeLessonRef.current && sidebarRef.current) {
      const sidebar = sidebarRef.current
      const el = activeLessonRef.current
      const sidebarRect = sidebar.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()

      if (elRect.top < sidebarRect.top || elRect.bottom > sidebarRect.bottom) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentLessonId])

  const toggleCourse = useCallback((slug: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }, [])

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }, [])

  const totalLessons = courses.reduce(
    (acc, c) => acc + c.modules.reduce((a, m) => a + (m.lessons?.length || 0), 0),
    0
  )
  const completedCount = completedLessonIds.size
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 shrink-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5 text-slate-600" />
              ) : (
                <Menu className="h-5 w-5 text-slate-600" />
              )}
            </button>
            <Link
              href={`/programs/${programSlug}`}
              className="hidden md:inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 shrink-0 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm md:text-lg font-bold text-slate-900 truncate">
                {programName}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-500 hidden sm:inline">
              {completedCount}/{totalLessons}
            </span>
            <div className="w-24 md:w-32">
              <Progress value={progressPercent} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-[calc(100vh-53px)]">
        <aside
          ref={sidebarRef}
          className={cn(
            'fixed md:static inset-y-0 left-0 z-30 w-80 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0 transition-transform duration-300 md:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          role="navigation"
          aria-label="Course content"
        >
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">Course Content</h3>
            <p className="text-xs text-slate-500 mt-1">
              {courses.length} course{courses.length !== 1 ? 's' : ''} · {completedCount}/{totalLessons} completed
            </p>
          </div>

          <div className="p-2">
            {courses.map((course) => {
              const isExpanded = expandedCourses.has(course.slug)
              const isCurrentCourse = course.slug === currentCourseSlug
              const courseLessons = course.modules.reduce(
                (a, m) => a + (m.lessons?.length || 0),
                0
              )
              const courseCompleted = course.modules.reduce(
                (a, m) =>
                  a +
                  (m.lessons?.filter((l) => completedLessonIds.has(l.id)).length || 0),
                0
              )

              return (
                <div key={course.id} className="mb-1">
                  <button
                    onClick={() => toggleCourse(course.slug)}
                    className={cn(
                      'w-full flex items-center gap-2 p-2.5 rounded-xl transition-colors text-left',
                      isCurrentCourse
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-slate-100'
                    )}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <BookOpen className="h-4 w-4 text-slate-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-semibold truncate',
                          isCurrentCourse ? 'text-blue-700' : 'text-slate-900'
                        )}
                      >
                        {course.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {courseCompleted}/{courseLessons} lessons
                      </p>
                    </div>
                    {courseCompleted > 0 && courseCompleted === courseLessons && (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="ml-4 space-y-0.5 mt-1">
                      {course.modules
                        .slice()
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((mod) => {
                          const modExpanded = expandedModules.has(mod.id)
                          const lessons = mod.lessons || []

                          return (
                            <div key={mod.id}>
                              <button
                                onClick={() => toggleModule(mod.id)}
                                className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-slate-50 transition-colors"
                                aria-expanded={modExpanded}
                              >
                                {modExpanded ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                )}
                                <span className="text-xs font-medium text-slate-700 truncate">
                                  {mod.title}
                                </span>
                              </button>

                              {modExpanded && (
                                <div className="ml-5 space-y-0.5">
                                  {lessons
                                    .slice()
                                    .sort((a, b) => a.order_index - b.order_index)
                                    .map((lesson) => {
                                      const isCompleted = completedLessonIds.has(lesson.id)
                                      const isCurrent = lesson.id === currentLessonId

                                      return (
                                        <button
                                          key={lesson.id}
                                          ref={isCurrent ? activeLessonRef : undefined}
                                          onClick={() => {
                                            onLessonClick(lesson, course.slug)
                                            setSidebarOpen(false)
                                          }}
                                          className={cn(
                                            'w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all',
                                            isCurrent &&
                                              'bg-blue-50 border border-blue-200 font-medium text-blue-700',
                                            !isCurrent &&
                                              'text-slate-600 hover:bg-slate-50'
                                          )}
                                          aria-current={isCurrent ? 'page' : undefined}
                                        >
                                          <div className="shrink-0">
                                            {getLessonIcon(
                                              lesson.content_type,
                                              isCompleted
                                            )}
                                          </div>
                                          <span className="truncate flex-1">
                                            {lesson.title}
                                          </span>
                                          {lesson.duration_minutes != null &&
                                            lesson.duration_minutes > 0 && (
                                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5 shrink-0">
                                                <Clock className="h-3 w-3" />
                                                {lesson.duration_minutes}m
                                              </span>
                                            )}
                                        </button>
                                      )
                                    })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
