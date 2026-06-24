'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Play, ChevronRight, ChevronDown, BookOpen, FileText,
  HelpCircle, CheckCircle, Download, Edit3, Save, Lock, ShoppingCart
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import SecureVideoPlayer from '@/components/course/SecureVideoPlayer'

interface Lesson {
  id: string
  title: string
  content_type: 'video' | 'pdf' | 'quiz' | 'text'
  video_url: string | null
  pdf_url: string | null
  text_content: string | null
  is_free: boolean
  duration_minutes: number | null
}

interface Module {
  id: string
  title: string
  description: string | null
  lessons: Lesson[]
}

interface QuizQuestion {
  id: string
  question: string
  question_type: string
  options: string[] | null
  correct_answer: string
}

export default function CourseLearnClient({ course, modules: initialModules, enrollmentCount }: {
  course: any
  modules: Module[]
  enrollmentCount: number
}) {
  const [modules] = useState<Module[]>(initialModules)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(initialModules?.[0]?.lessons?.[0] || null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(initialModules?.map((m: Module) => m.id) || []))
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [user, setUser] = useState<any>(null)
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)

  // Auth & enrollment check (all client-side using localStorage)
  useEffect(() => {
    async function checkAuth() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        // Check enrollment
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', currentUser.id)
          .eq('course_id', course.id)
          .limit(1)
        setEnrolled(!!enrollment)
      }

      setLoading(false)
    }

    checkAuth()

    // Listen for auth state changes (after login redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        // Re-check enrollment after login
        supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('course_id', course.id)
          .limit(1)
          .then(({ data }) => {
            setEnrolled(!!data)
            setLoading(false)
          })
      }
    })

    return () => subscription.unsubscribe()
  }, [course.id])

  // Fetch progress when user is available
  useEffect(() => {
    if (!user) return
    supabase
      .from('course_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .eq('completed', true)
      .then(({ data }) => {
        if (data) setCompletedLessons(new Set(data.map((d: any) => d.lesson_id)))
      })
  }, [user, course.id])

  // Fetch notes when active lesson changes
  useEffect(() => {
    if (!activeLesson || !user) return
    supabase
      .from('user_notes')
      .select('content')
      .eq('user_id', user.id)
      .eq('lesson_id', activeLesson.id)
      .single()
      .then(({ data }) => {
        if (data) setNotes(data.content)
      })
  }, [activeLesson?.id, user])

  // Fetch quiz questions
  useEffect(() => {
    if (!activeLesson || activeLesson.content_type !== 'quiz') {
      setQuizQuestions([])
      return
    }
    supabase
      .from('tests')
      .select('id')
      .eq('lesson_id', activeLesson.id)
      .eq('is_active', true)
      .single()
      .then(({ data: test }) => {
        if (test) {
          supabase
            .from('test_questions')
            .select('*')
            .eq('test_id', test.id)
            .order('order_index')
            .then(({ data }) => {
              if (data) setQuizQuestions(data)
            })
        }
      })
  }, [activeLesson?.id, activeLesson?.content_type])

  async function markComplete() {
    if (!activeLesson || !user) return
    await supabase.from('course_progress').upsert({
      user_id: user.id,
      course_id: course.id,
      lesson_id: activeLesson.id,
      completed: true,
      completed_at: new Date().toISOString(),
    })
    setCompletedLessons(prev => new Set([...prev, activeLesson.id]))
  }

  async function saveNotes() {
    if (!activeLesson || !user) return
    await supabase.from('user_notes').upsert({
      user_id: user.id,
      lesson_id: activeLesson.id,
      content: notes,
      updated_at: new Date().toISOString(),
    })
  }

  function submitQuiz() { setQuizSubmitted(true) }

  function getYouTubeEmbed(url: string) {
    const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0
  const allLessons = modules.flatMap(m => m.lessons)
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id)

  function toggleModule(moduleId: string) {
    setExpandedModules(prev => {
      const n = new Set(prev)
      if (n.has(moduleId)) n.delete(moduleId)
      else n.add(moduleId)
      return n
    })
  }

  // Auth guard — show overlay instead of redirecting
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
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
          <p className="text-xs text-slate-400 mt-4">Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Register</Link></p>
        </div>
      </div>
    )
  }

  // Enrollment guard — show overlay for paid courses
  if (!enrolled && course.price > 0) {
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
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 w-full"
            onClick={async () => {
              const { error } = await supabase.from('enrollments').insert({
                user_id: user.id,
                course_id: course.id,
                status: 'active',
                progress_percent: 0,
              })
              if (!error) {
                setEnrolled(true)
                window.location.reload()
              }
            }}
          >
            Enroll Now
          </Button>
          <Link href={`/courses/${course.slug}`}>
            <Button variant="ghost" size="sm" className="mt-3">Back to Course</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Main learning interface (user is logged in and enrolled or free course)
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">{course.title}</h1>
            <p className="text-sm text-slate-500">{activeLesson?.title || 'Select a lesson'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{completedLessons.size}/{totalLessons} completed</span>
            <div className="w-32"><Progress value={progressPercent} className="h-2" /></div>
          </div>
        </div>
      </div>

      <div className="flex" style={{ height: 'calc(100vh - 73px)' }}>
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0">
          {modules.map((module) => (
            <div key={module.id} className="border-b border-slate-100">
              <button className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50" onClick={() => toggleModule(module.id)}>
                <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${expandedModules.has(module.id) ? 'rotate-90' : ''}`} />
                <span className="text-sm font-semibold text-slate-800">{module.title}</span>
              </button>
              {expandedModules.has(module.id) && module.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className={`w-full flex items-center gap-3 px-6 py-2.5 text-left text-sm ${activeLesson?.id === lesson.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  onClick={() => setActiveLesson(lesson)}
                >
                  {completedLessons.has(lesson.id) ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> : <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />}
                  <span className="truncate">{lesson.title}</span>
                  {lesson.is_free && <Badge className="text-[10px] bg-green-100 text-green-700 border-0 h-4 ml-auto">Free</Badge>}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeLesson && (
            <div className="max-w-4xl mx-auto">
              {/* Video */}
              {activeLesson.content_type === 'video' && activeLesson.video_url && (
                <div className="mb-6">
                  <SecureVideoPlayer
                    videoUrl={activeLesson.video_url}
                    lessonId={activeLesson.id}
                    courseId={course.id}
                    studentName={user?.user_metadata?.full_name || user?.email || 'Student'}
                    studentEmail={user?.email || ''}
                    onProgress={(pct) => {
                      if (pct > 0) {
                        supabase.from('course_progress').upsert({
                          user_id: user.id,
                          course_id: course.id,
                          lesson_id: activeLesson.id,
                          completed: pct >= 90,
                          completed_at: pct >= 90 ? new Date().toISOString() : null,
                        })
                      }
                    }}
                  />
                </div>
              )}

              {/* PDF */}
              {activeLesson.content_type === 'pdf' && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-red-500" /><span className="font-medium">{activeLesson.title}</span></div>
                    {activeLesson.pdf_url && <a href={activeLesson.pdf_url} download className="text-sm text-blue-600 flex items-center gap-1"><Download className="h-4 w-4" /> Download</a>}
                  </div>
                  {activeLesson.pdf_url ? (
                    <iframe src={activeLesson.pdf_url} className="w-full border-0" style={{ height: '70vh' }} />
                  ) : (
                    <div className="p-12 text-center text-slate-500"><FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" /><p>No PDF uploaded for this lesson</p></div>
                  )}
                </div>
              )}

              {/* Quiz */}
              {activeLesson.content_type === 'quiz' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-6"><HelpCircle className="h-5 w-5 text-blue-600" /><h3 className="text-lg font-bold">{activeLesson.title || 'Quiz'}</h3></div>
                  {quizQuestions.length > 0 ? (
                    <div className="space-y-6">
                      {quizQuestions.map((q, idx) => (
                        <div key={q.id} className="border-b border-slate-100 pb-6">
                          <p className="font-medium mb-3"><span className="text-blue-600 mr-2">Q{idx + 1}.</span>{q.question}</p>
                          {q.options && (
                            <div className="space-y-2">
                              {JSON.parse(q.options as any).map((opt: string) => (
                                <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${quizSubmitted ? (opt === q.correct_answer ? 'border-green-500 bg-green-50' : quizAnswers[q.id] === opt ? 'border-red-500 bg-red-50' : 'border-slate-200') : quizAnswers[q.id] === opt ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                  <input type="radio" name={q.id} value={opt} checked={quizAnswers[q.id] === opt} onChange={() => !quizSubmitted && setQuizAnswers(p => ({ ...p, [q.id]: opt }))} disabled={quizSubmitted} className="sr-only" />
                                  <div className={`h-4 w-4 rounded-full border-2 ${quizAnswers[q.id] === opt ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`} />
                                  <span className="text-sm">{opt}</span>
                                  {quizSubmitted && opt === q.correct_answer && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {!quizSubmitted ? (
                        <Button onClick={submitQuiz} className="bg-blue-600 hover:bg-blue-700">Submit Quiz</Button>
                      ) : (
                        <div className="p-4 bg-blue-50 rounded-lg font-medium">
                          Score: {quizQuestions.filter(q => quizAnswers[q.id] === q.correct_answer).length}/{quizQuestions.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">No quiz questions available yet.</p>
                  )}
                </div>
              )}

              {/* Text */}
              {activeLesson.content_type === 'text' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                  <p className="text-slate-600">{activeLesson.text_content || 'No content available.'}</p>
                </div>
              )}

              {/* Notes */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                <button className="flex items-center gap-2 text-sm font-medium mb-3" onClick={() => setShowNotes(!showNotes)}>
                  <Edit3 className="h-4 w-4" /> {showNotes ? 'Hide Notes' : 'Personal Notes'}
                </button>
                {showNotes && (
                  <div>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write your notes..." className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <Button size="sm" onClick={saveNotes} className="mt-2 bg-blue-600 hover:bg-blue-700"><Save className="h-3 w-3 mr-1" /> Save</Button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <Button variant="outline" onClick={() => currentIndex > 0 && setActiveLesson(allLessons[currentIndex - 1])} disabled={currentIndex <= 0}>← Previous</Button>
                {!completedLessons.has(activeLesson?.id) && activeLesson?.content_type !== 'quiz' && (
                  <Button onClick={markComplete} className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-4 w-4 mr-2" /> Mark Complete</Button>
                )}
                <Button onClick={() => currentIndex < allLessons.length - 1 && setActiveLesson(allLessons[currentIndex + 1])} disabled={currentIndex >= allLessons.length - 1}>Next →</Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
