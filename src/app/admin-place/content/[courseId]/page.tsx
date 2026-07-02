'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Layers, FileText, HelpCircle, ChevronRight } from 'lucide-react'
import { getRecord } from '@/lib/admin-api'

interface DbLesson {
  id: string
  module_id: string
  title: string
  content: string | null
  video_url: string | null
  duration_minutes: number | null
  order_index: number | null
  is_free: boolean | null
  is_active: boolean | null
  created_at: string | null
}

interface DbModule {
  id: string
  course_id: string
  title: string
  description: string | null
  order_index: number | null
  is_active: boolean | null
  created_at: string | null
  lessons?: DbLesson[]
}

interface DbTest {
  id: string
  course_id: string
  title: string
  description: string | null
  passing_score: number | null
  time_limit_minutes: number | null
  is_active: boolean | null
  created_at: string | null
}

interface DbCourse {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  price: number
  discount_price: number | null
  duration_hours: number | null
  level: string
  branch_id: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  modules?: DbModule[]
  tests?: DbTest[]
}

export default function CourseContentEditorPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<DbCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRecord('courses', courseId, '*,modules(*,lessons(*)),tests(*)')

      if (data) {
        data.modules = [...(data.modules || [])]
          .sort((a: DbModule, b: DbModule) => (a.order_index || 0) - (b.order_index || 0))
          .map((m: DbModule) => ({
            ...m,
            lessons: [...(m.lessons || [])].sort((a: DbLesson, b: DbLesson) => (a.order_index || 0) - (b.order_index || 0)),
          }))
      }
      setCourse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    Promise.resolve().then(() => fetchCourse())
  }, [fetchCourse])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">{error || 'Course not found'}</p>
        <Link href="/admin-place/content">
          <Button variant="outline" className="mt-4 border-slate-300">Back to Content</Button>
        </Link>
      </div>
    )
  }

  const totalLessons = (course.modules || []).reduce(
    (sum, m) => sum + (m.lessons || []).length, 0
  )

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin-place/content"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Content
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={`border-0 text-xs ${
                  course.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {course.is_active ? 'Active' : 'Draft'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{(course.modules || []).length}</p>
              <p className="text-xs text-slate-500">Modules</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalLessons}</p>
              <p className="text-xs text-slate-500">Lessons</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{(course.tests || []).length}</p>
              <p className="text-xs text-slate-500">Tests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-slate-900 mb-2">Modules</h3>
          {(course.modules || []).length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No modules yet</p>
          ) : (
            (course.modules || []).map((mod) => (
              <React.Fragment key={mod.id}>
                <Link
                  href={`/admin-place/content/${courseId}/modules`}
                  className="block p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <p className="font-medium text-slate-900 text-sm">{mod.title}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {(mod.lessons || []).length} lesson{(mod.lessons || []).length !== 1 ? 's' : ''}
                  </p>
                </Link>
              </React.Fragment>
            ))
          )}
          <Link href={`/admin-place/content/${courseId}/modules`}>
            <Button variant="outline" size="sm" className="w-full border-slate-300 mt-2">
              Manage Modules
            </Button>
          </Link>
        </div>

        <div className="lg:col-span-1">
          <h3 className="font-semibold text-slate-900 mb-2">Recent Lessons</h3>
          {(course.modules || [])
            .flatMap((m) => (m.lessons || []))
            .slice(0, 5).length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No lessons yet</p>
          ) : (
            (course.modules || [])
              .flatMap((m) => (m.lessons || []))
              .slice(0, 5)
              .map((lesson) => (
                <React.Fragment key={lesson.id}>
                  <Link
                    href={`/admin-place/content/${courseId}/lessons/${lesson.id}`}
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mb-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{lesson.title}</p>
                      <p className="text-xs text-slate-400">
                        {lesson.duration_minutes || 0} min
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </React.Fragment>
              ))
          )}
          <Link href={`/admin-place/content/${courseId}/lessons`}>
            <Button variant="outline" size="sm" className="w-full border-slate-300 mt-2">
              Manage Lessons
            </Button>
          </Link>
        </div>

        <div className="lg:col-span-1">
          <h3 className="font-semibold text-slate-900 mb-2">Tests</h3>
          {(course.tests || []).length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No tests yet</p>
          ) : (
            (course.tests || []).map((test) => (
              <React.Fragment key={test.id}>
                <Link
                  href={`/admin-place/content/${courseId}/tests/${test.id}`}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mb-2"
                >
                  <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                    <HelpCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{test.title}</p>
                    <p className="text-xs text-slate-400">{test.passing_score || 70}% pass</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </Link>
              </React.Fragment>
            ))
          )}
          <Link href={`/admin-place/content/${courseId}/tests`}>
            <Button variant="outline" size="sm" className="w-full border-slate-300 mt-2">
              Manage Tests
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
