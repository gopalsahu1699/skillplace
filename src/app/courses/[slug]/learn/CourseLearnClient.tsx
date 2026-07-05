'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  ChevronRight, FileText,
  HelpCircle, CheckCircle, Download, Edit3, Save, Lock, ShoppingCart, Menu, X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { notify } from '@/lib/notifications'
import { openCashfreeCheckout } from '@/lib/cashfree-client'
import SecureVideoPlayer from '@/components/course/SecureVideoPlayer'
import LectureComingSoon from '@/components/course/LectureComingSoon'
import ErrorBoundary from '@/components/course/ErrorBoundary'
import { cn } from '@/lib/utils'
import type { Course, Module, Lesson, Test, TestQuestion } from '@/types'

interface CourseLearnClientProps {
  course: Course & { branches?: unknown }
  modules: (Module & { lessons: Lesson[] })[]
}

export default function CourseLearnClient({ course, modules: initialModules }: CourseLearnClientProps) {
  const modules = initialModules

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    initialModules?.[0]?.lessons?.[0] || null
  )
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(initialModules?.map((m) => m.id) || [])
  )
  const [notes, setNotes] = useState('')
  const [notesDirty, setNotesDirty] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<TestQuestion[]>([])
  const [currentTest, setCurrentTest] = useState<Test | null>(null)
  const [user, setUser] = useState<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, setAuthChecked] = useState(false)
  const [, setResumePosition] = useState(0)

  const notesSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeLessonIdRef = useRef<string | null>(null)
  const paymentOrderRef = useRef<{ orderId: string; paymentSessionId: string; env: 'sandbox' | 'production' } | null>(null)

  useEffect(() => {
    activeLessonIdRef.current = activeLesson?.id || null
  }, [activeLesson?.id])

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        if (error || !currentUser) {
          setUser(null)
          setAuthChecked(true)
          setLoading(false)
          return
        }

        setUser(currentUser)

        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('user_id', currentUser.id)
          .eq('course_id', course.id)
          .maybeSingle()

        setEnrolled(!!enrollment)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
        setAuthChecked(true)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user || null
      setUser(newUser)
      if (newUser) {
        try {
          const { data } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('user_id', newUser.id)
            .eq('course_id', course.id)
            .maybeSingle()
          setEnrolled(!!data)
        } catch {
          // ignore
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [course.id])

  useEffect(() => {
    if (!user) return

    const allLessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id))
    if (allLessonIds.length === 0) return

    ;(async () => {
      try {
        const { data } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .in('lesson_id', allLessonIds)
        if (data) setCompletedLessons(new Set(data.map((d) => d.lesson_id)))
      } catch {}
    })()
  }, [user, modules])

  useEffect(() => {
    if (!activeLesson || !user) {
      Promise.resolve().then(() => {
        setNotes('')
        setNotesDirty(false)
      })
      return
    }

    const lessonId = activeLesson.id
    let cancelled = false

    ;(async () => {
      try {
        const { data } = await supabase
          .from('user_notes')
          .select('content')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .maybeSingle()
        if (!cancelled && activeLessonIdRef.current === lessonId) {
          setNotes(data?.content || '')
          setNotesDirty(false)
        }
      } catch {}
    })()

    return () => { cancelled = true }
  }, [activeLesson, user])

  useEffect(() => {
    if (!activeLesson || activeLesson.content_type !== 'quiz') {
      Promise.resolve().then(() => {
        setQuizQuestions([])
        setCurrentTest(null)
      })
      return
    }

    ;(async () => {
      try {
        const { data: test } = await supabase
          .from('tests')
          .select('*')
          .eq('lesson_id', activeLesson.id)
          .eq('is_active', true)
          .maybeSingle()
        if (!test) return
        setCurrentTest(test)
        const { data } = await supabase
          .from('test_questions')
          .select('*')
          .eq('test_id', test.id)
          .order('order_index', { ascending: true })
        if (data) setQuizQuestions(data)
      } catch {}
    })()
  }, [activeLesson])

  useEffect(() => {
    if (!activeLesson || !user || activeLesson.content_type !== 'video') {
      Promise.resolve().then(() => setResumePosition(0))
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const { data } = await supabase
          .from('lesson_progress')
          .select('watched_seconds')
          .eq('user_id', user.id)
          .eq('lesson_id', activeLesson.id)
          .maybeSingle()
        if (!cancelled && data?.watched_seconds) {
          setResumePosition(data.watched_seconds)
        }
      } catch {}
    })()

    return () => { cancelled = true }
  }, [activeLesson, user])

  useEffect(() => {
    return () => {
      if (notesSaveTimeoutRef.current) {
        clearTimeout(notesSaveTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (enrolled || !user || course.price <= 0) {
      paymentOrderRef.current = null
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course.id, userId: user.id }),
        })
        const data = await res.json()
        if (!cancelled && data.orderId && data.paymentSessionId) {
          paymentOrderRef.current = { orderId: data.orderId, paymentSessionId: data.paymentSessionId, env: (data.env || 'sandbox') as 'sandbox' | 'production' }
        }
      } catch {
        if (!cancelled) paymentOrderRef.current = null
      }
    })()
    return () => {
      cancelled = true
      paymentOrderRef.current = null
    }
  }, [user, course.id, enrolled])

  const saveNotesImmediate = useCallback(async (content: string) => {
    if (!activeLesson || !user) return
    try {
      await supabase.from('user_notes').upsert({
        user_id: user.id,
        lesson_id: activeLesson.id,
        content,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' })
    } catch {
      // Silent fail for notes
    }
  }, [activeLesson, user])

  const debouncedSaveNotes = useCallback((content: string) => {
    setNotesDirty(true)
    if (notesSaveTimeoutRef.current) {
      clearTimeout(notesSaveTimeoutRef.current)
    }
    notesSaveTimeoutRef.current = setTimeout(() => {
      saveNotesImmediate(content)
      setNotesDirty(false)
    }, 1500)
  }, [saveNotesImmediate])

  const markComplete = useCallback(async () => {
    if (!activeLesson || !user) return
    try {
      await supabase.from('lesson_progress').upsert({
        user_id: user.id,
        lesson_id: activeLesson.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,lesson_id' })
      setCompletedLessons((prev) => new Set([...prev, activeLesson.id]))
      notify.lessonComplete(activeLesson.title)
    } catch {
      notify.genericError('Failed to mark lesson complete')
    }
  }, [activeLesson, user])

  const handleSaveNotes = useCallback(async () => {
    if (notesSaveTimeoutRef.current) {
      clearTimeout(notesSaveTimeoutRef.current)
    }
    setNotesDirty(false)
    await saveNotesImmediate(notes)
    notify.noteSaved()
  }, [notes, saveNotesImmediate])

  const submitQuiz = useCallback(async () => {
    if (!activeLesson || !user || quizSubmitted) return

    const total = quizQuestions.length
    const correct = quizQuestions.filter((q) => quizAnswers[q.id] === q.correct_answer).length
    const score = total > 0 ? Math.round((correct / total) * 100) : 0
    const passed = score >= (currentTest?.passing_score || 60)

    try {
      await supabase.from('test_attempts').insert({
        user_id: user.id,
        test_id: currentTest?.id || '',
        answers: quizAnswers,
        score,
        passed,
        completed_at: new Date().toISOString(),
      })

      setQuizSubmitted(true)
      setQuizScore({ correct, total })

      if (passed) {
        notify.quizSubmitted(score)
        markComplete()
      } else {
        notify.quizFailed()
      }
    } catch {
      notify.genericError('Failed to submit quiz')
    }
  }, [activeLesson, user, quizQuestions, quizAnswers, quizSubmitted, currentTest?.id, currentTest?.passing_score, markComplete])

  const allLessons = modules.flatMap((m) => m.lessons)
  const totalLessons = allLessons.length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0
  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id)

  // Infer content_type from available fields when content_type is null/undefined
  const getContentType = useCallback((lesson: Lesson): string => {
    if (lesson.content_type) return lesson.content_type
    if (lesson.video_url || lesson.video_id) return 'video'
    if (lesson.pdf_url) return 'pdf'
    if (lesson.text_content) return 'text'
    return 'video' // default to video
  }, [])

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const n = new Set(prev)
      if (n.has(moduleId)) n.delete(moduleId)
      else n.add(moduleId)
      return n
    })
  }, [])

  const goToLesson = useCallback((lesson: Lesson) => {
    if (notesSaveTimeoutRef.current) {
      clearTimeout(notesSaveTimeoutRef.current)
      if (notesDirty && activeLessonIdRef.current) {
        saveNotesImmediate(notes)
      }
    }
    setActiveLesson(lesson)
    setSidebarOpen(false)
    setQuizAnswers({})
    setQuizSubmitted(false)
    setQuizScore(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [notesDirty, notes, saveNotesImmediate])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md shadow-sm">
          <div className="inline-flex h-16 w-16 bg-blue-50 rounded-2xl items-center justify-center mb-5">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to Start Learning</h2>
          <p className="text-slate-500 mb-6">Access videos, notes, quizzes, and track your progress</p>
          <Link href={`/login?redirectedFrom=/courses/${course.slug}/learn`}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full">Sign In</Button>
          </Link>
          <p className="text-xs text-slate-400 mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
          </p>
        </div>
      </div>
    )
  }

  if (!enrolled && course.price > 0) {
    const finalPrice = course.discount_price || course.price

    const handlePayment = async () => {
      try {
        const preOrder = paymentOrderRef.current

        let sessionData = preOrder

        if (!sessionData || !sessionData.paymentSessionId) {
          const res = await fetch('/api/payments/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId: course.id, userId: user.id }),
          })

          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || `Server error (${res.status})`)
          }

          const data = await res.json()

          if (data.free) {
            window.location.href = data.redirectUrl
            return
          }

          if (!data.paymentSessionId) {
            notify.paymentError('Unexpected response from payment server')
            return
          }

          sessionData = { orderId: data.orderId, paymentSessionId: data.paymentSessionId, env: (data.env || 'sandbox') as 'sandbox' | 'production' }
        }

        const returnUrl = `${window.location.origin}/api/payments/verify?order_id=${sessionData.orderId}&course_slug=${course.slug}`

        await openCashfreeCheckout(sessionData.env, {
          paymentSessionId: sessionData.paymentSessionId,
          returnUrl,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Payment failed. Please try again.'
        notify.paymentError(message)
      }
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md shadow-sm">
          <div className="inline-flex h-16 w-16 bg-blue-50 rounded-2xl items-center justify-center mb-5">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Enroll to Access This Course</h2>
          <p className="text-slate-500 mb-2">Get full access to videos, notes, quizzes, and certificates</p>
          <p className="text-2xl font-bold text-slate-900 mb-6">
            {course.discount_price ? (
              <>₹{course.discount_price.toLocaleString()} <span className="text-sm text-slate-400 line-through">₹{course.price.toLocaleString()}</span></>
            ) : (
              <>₹{course.price.toLocaleString()}</>
            )}
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 w-full" onClick={handlePayment}>
            Enroll Now — ₹{finalPrice.toLocaleString()}
          </Button>
          <Link href={`/courses/${course.slug}`}>
            <Button variant="ghost" size="sm" className="mt-3">Back to Course</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary fallbackTitle="Course content error" fallbackMessage="Failed to load course content. Please try again.">
      <div className="bg-slate-50 min-h-screen">
        <div className="bg-white border-b border-slate-200 px-3 md:px-6 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 shrink-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {sidebarOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
              </button>
              <div className="min-w-0">
                <Link href={`/courses/${course.slug}`} className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
                  {course.title}
                </Link>
                <p className="text-sm font-semibold text-slate-900 truncate">{activeLesson?.title || 'Select a lesson'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <span className="text-xs md:text-sm text-slate-500 hidden sm:inline">
                {completedLessons.size}/{totalLessons} completed
              </span>
              <div className="w-20 md:w-32"><Progress value={progressPercent} className="h-2" /></div>
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="flex" style={{ height: 'calc(100vh - 53px)' }}>
          <aside className={cn(
            "fixed md:static inset-y-0 left-0 z-30 w-80 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0 transition-transform duration-300 md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="p-3 border-b border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500">PROGRESS</span>
                <span className="text-xs font-bold text-blue-600">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>

            {modules.map((module) => {
              const moduleCompleted = module.lessons.filter((l) => completedLessons.has(l.id)).length
              return (
                <div key={module.id} className="border-b border-slate-100">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    onClick={() => toggleModule(module.id)}
                    aria-expanded={expandedModules.has(module.id)}
                  >
                    <ChevronRight className={cn(
                      "h-4 w-4 text-slate-400 transition-transform shrink-0",
                      expandedModules.has(module.id) && "rotate-90"
                    )} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-slate-800 block truncate">{module.title}</span>
                      <span className="text-xs text-slate-400">{moduleCompleted}/{module.lessons.length} lessons</span>
                    </div>
                  </button>
                  {expandedModules.has(module.id) && (
                    <div className="pb-1">
                      {module.lessons.map((lesson) => {
                        const isActive = activeLesson?.id === lesson.id
                        const isComplete = completedLessons.has(lesson.id)
                        return (
                          <button
                            key={lesson.id}
                            className={cn(
                              "w-full flex items-center gap-3 px-6 py-2.5 text-left text-sm transition-all",
                              isActive
                                ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600'
                                : 'text-slate-600 hover:bg-slate-50'
                            )}
                            onClick={() => goToLesson(lesson)}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {isComplete ? (
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              <div className={cn(
                                "h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                                isActive ? 'border-blue-600' : 'border-slate-300'
                              )}>
                                {isActive && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                              </div>
                            )}
                            <span className="truncate flex-1">{lesson.title}</span>
                            {lesson.is_free && (
                              <Badge className="text-[10px] bg-green-100 text-green-700 border-0 h-4 ml-auto">Free</Badge>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </aside>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeLesson ? (
              <div className="max-w-4xl mx-auto">
                {(getContentType(activeLesson) === 'video') && (
                  <div className="mb-6">
                    {activeLesson.video_id || activeLesson.video_url || activeLesson.r2_source_key ? (
                      <SecureVideoPlayer
                        videoId={activeLesson.video_id || undefined}
                        videoUrl={activeLesson.video_url || undefined}
                        r2SourceKey={activeLesson.r2_source_key}
                        lessonId={activeLesson.id}
                        courseId={course.id}
                        studentName={user?.user_metadata?.full_name || user?.email || 'Student'}
                        studentEmail={user?.email || ''}
                        studentId={user?.id}
                        courseName={course.title}
                        onProgress={async (pct) => {
                          if (pct > 0) {
                            try {
                              await supabase.from('lesson_progress').upsert({
                                user_id: user.id,
                                lesson_id: activeLesson.id,
                                is_completed: pct >= 90,
                                watched_seconds: Math.round((pct / 100) * 600),
                                completed_at: pct >= 90 ? new Date().toISOString() : null,
                              }, { onConflict: 'user_id,lesson_id' })
                            } catch {}

                            if (pct >= 90) {
                              setCompletedLessons((prev) => new Set([...prev, activeLesson.id]))
                            }
                          }
                        }}
                      />
                    ) : (
                      <LectureComingSoon contentType="video" lessonTitle={activeLesson.title} />
                    )}
                  </div>
                )}

                {getContentType(activeLesson) === 'pdf' && (
                  <div className="mb-6">
                    {activeLesson.pdf_url ? (
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-500" />
                            <span className="font-medium">{activeLesson.title}</span>
                          </div>
                          <a href={activeLesson.pdf_url} download className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
                            <Download className="h-4 w-4" /> Download
                          </a>
                        </div>
                        <iframe src={activeLesson.pdf_url} className="w-full border-0" style={{ height: '70vh' }} title={activeLesson.title} />
                      </div>
                    ) : (
                      <LectureComingSoon contentType="pdf" lessonTitle={activeLesson.title} />
                    )}
                  </div>
                )}

                {getContentType(activeLesson) === 'quiz' && (
                  <div className="mb-6">
                    {quizQuestions.length > 0 ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                          <HelpCircle className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-bold">{activeLesson.title || 'Quiz'}</h3>
                          {quizSubmitted && quizScore && (
                            <Badge className={cn(
                              "ml-2 border-0",
                              (quizScore.correct / quizScore.total) >= (currentTest?.passing_score || 60) / 100
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            )}>
                              {quizScore.correct}/{quizScore.total}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-6">
                          {quizQuestions.map((q, idx) => {
                            let options: string[] = []
                            try {
                              options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || [])
                            } catch {
                              options = []
                            }
                            return (
                              <div key={q.id} className="border-b border-slate-100 pb-6 last:border-0">
                                <p className="font-medium mb-3">
                                  <span className="text-blue-600 mr-2">Q{idx + 1}.</span>
                                  {q.question}
                                </p>
                                <div className="space-y-2">
                                  {options.map((opt: string) => (
                                    <label
                                      key={opt}
                                      className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                        quizSubmitted
                                          ? opt === q.correct_answer
                                            ? 'border-green-500 bg-green-50'
                                            : quizAnswers[q.id] === opt
                                              ? 'border-red-500 bg-red-50'
                                              : 'border-slate-200'
                                          : quizAnswers[q.id] === opt
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        name={q.id}
                                        value={opt}
                                        checked={quizAnswers[q.id] === opt}
                                        onChange={() => !quizSubmitted && setQuizAnswers((p) => ({ ...p, [q.id]: opt }))}
                                        disabled={quizSubmitted}
                                        className="sr-only"
                                      />
                                      <div className={cn(
                                        "h-4 w-4 rounded-full border-2 shrink-0",
                                        quizAnswers[q.id] === opt ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                      )} />
                                      <span className="text-sm">{opt}</span>
                                      {quizSubmitted && opt === q.correct_answer && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                          <div className="flex items-center gap-3 pt-2">
                            {!quizSubmitted ? (
                              <Button
                                onClick={submitQuiz}
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                              >
                                Submit Quiz
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setQuizAnswers({})
                                  setQuizSubmitted(false)
                                  setQuizScore(null)
                                }}
                                className="border-slate-300"
                              >
                                Retake Quiz
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <LectureComingSoon contentType="quiz" lessonTitle={activeLesson.title} />
                    )}
                  </div>
                )}

                {getContentType(activeLesson) === 'text' && (
                  <div className="mb-6">
                    {activeLesson.text_content ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-6">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{activeLesson.text_content}</p>
                      </div>
                    ) : (
                      <LectureComingSoon contentType="text" lessonTitle={activeLesson.title} />
                    )}
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                  <button
                    className="flex items-center gap-2 text-sm font-medium mb-3 text-slate-700 hover:text-blue-600 transition-colors"
                    onClick={() => setShowNotes(!showNotes)}
                    aria-expanded={showNotes}
                  >
                    <Edit3 className="h-4 w-4" />
                    {showNotes ? 'Hide Notes' : 'Personal Notes'}
                    {notesDirty && <span className="h-2 w-2 rounded-full bg-amber-400" />}
                  </button>
                  {showNotes && (
                    <div>
                      <textarea
                        value={notes}
                        onChange={(e) => {
                          setNotes(e.target.value)
                          debouncedSaveNotes(e.target.value)
                        }}
                        placeholder="Write your notes here... (auto-saves)"
                        className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label="Lesson notes"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">
                          {notesDirty ? 'Saving...' : 'Auto-saved'}
                        </span>
                        <Button size="sm" onClick={handleSaveNotes} className="bg-blue-600 hover:bg-blue-700" disabled={!notesDirty}>
                          <Save className="h-3 w-3 mr-1" /> Save Now
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => currentIndex > 0 && goToLesson(allLessons[currentIndex - 1])}
                    disabled={currentIndex <= 0}
                    className="border-slate-300"
                  >
                    ← Previous
                  </Button>
                  {!completedLessons.has(activeLesson.id) && activeLesson.content_type !== 'quiz' && (
                    <Button size="sm" onClick={markComplete} className="bg-green-600 hover:bg-green-700 gap-2">
                      <CheckCircle className="h-4 w-4" /> Mark Complete
                    </Button>
                  )}
                  {completedLessons.has(activeLesson.id) && activeLesson.content_type !== 'quiz' && (
                    <Badge className="bg-green-100 text-green-700 border-0 gap-1">
                      <CheckCircle className="h-3 w-3" /> Completed
                    </Badge>
                  )}
                  <Button
                    onClick={() => currentIndex < allLessons.length - 1 && goToLesson(allLessons[currentIndex + 1])}
                    disabled={currentIndex >= allLessons.length - 1}
                    size="sm"
                  >
                    Next →
                  </Button>
                </div>

                {progressPercent === 100 && (
                  <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-green-800 mb-1">Course Completed!</h3>
                    <p className="text-sm text-green-600 mb-4">Congratulations on completing all lessons.</p>
                    <Link href={`/courses/${course.slug}`}>
                      <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                        View Certificate
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <LectureComingSoon contentType="video" />
              </div>
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
