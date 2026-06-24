'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Layers, FileText, HelpCircle, ChevronRight } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import type { Course, Module, Lesson, Test, Category } from '@/types'

interface CourseData extends Course {
  category?: Category
  modules: (Module & { lessons: Lesson[] })[]
  tests: Test[]
}

export default function CourseContentEditorPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCourse = useCallback(async () => {
    setLoading(true)
    const data = await getRecord('courses', courseId)

    if (data) {
      data.modules = (data.modules || [])
        .sort((a: Module, b: Module) => a.order_index - b.order_index)
        .map((m: Module & { lessons: Lesson[] }) => ({
          ...m,
          lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index),
        }))
    }
    setCourse(data)
    setLoading(false)
  }, [courseId])

  useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Course not found</p>
        <Link href="/admin-place/content">
          <Button variant="outline" className="mt-4 border-slate-300">Back to Content</Button>
        </Link>
      </div>
    )
  }

  const totalLessons = course.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin-place/content" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Content
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {course.category && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-0 text-xs">
                  {course.category.name}
                </Badge>
              )}
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
              <p className="text-2xl font-bold text-slate-900">{course.modules?.length || 0}</p>
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
              <p className="text-2xl font-bold text-slate-900">{course.tests?.length || 0}</p>
              <p className="text-xs text-slate-500">Tests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-slate-900 mb-2">Modules</h3>
          {course.modules?.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No modules yet</p>
          ) : (
            course.modules?.map((mod) => (
              <Link
                key={mod.id}
                href={`/admin-place/content/${courseId}/modules`}
                className="block p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <p className="font-medium text-slate-900 text-sm">{mod.title}</p>
                <p className="text-xs text-slate-400 mt-1">{mod.lessons?.length || 0} lessons</p>
              </Link>
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
          {course.modules?.flatMap(m => m.lessons || []).slice(0, 5).length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No lessons yet</p>
          ) : (
            course.modules?.flatMap(m => m.lessons || []).slice(0, 5).map((lesson) => (
              <Link
                key={lesson.id}
                href={`/admin-place/content/${courseId}/lessons/${lesson.id}`}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mb-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{lesson.title}</p>
                  <p className="text-xs text-slate-400">{lesson.content_type}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
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
          {course.tests?.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No tests yet</p>
          ) : (
            course.tests?.map((test) => (
              <Link
                key={test.id}
                href={`/admin-place/content/${courseId}/tests/${test.id}`}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mb-2"
              >
                <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                  <HelpCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{test.title}</p>
                  <p className="text-xs text-slate-400">{test.passing_score}% pass</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
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
