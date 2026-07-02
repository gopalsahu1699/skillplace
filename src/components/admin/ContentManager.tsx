'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, BookOpen, Layers, FileText, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Course, Module, Lesson, Test } from '@/types'

interface CourseWithContent extends Course {
  modules: (Module & { lessons: Lesson[] })[]
}

export default function ContentManager() {
  const [courses, setCourses] = useState<CourseWithContent[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('courses')
      .select('*, modules(*, lessons(*))')
      .order('created_at', { ascending: false })

    if (data) {
      const sorted = data.map((c) => ({
        ...c,
        modules: (c.modules || [])
          .sort((a: Module, b: Module) => a.order_index - b.order_index)
          .map((m: Module & { lessons: Lesson[] }) => ({
            ...m,
            lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index),
          })),
      }))
      setCourses(sorted)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => fetchCourses())
  }, [fetchCourses])

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const totalModules = courses.reduce((sum, c) => sum + (c.modules?.length || 0), 0)
  const totalLessons = courses.reduce(
    (sum, c) => sum + (c.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0),
    0
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage courses, modules, lessons, and tests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Courses', value: courses.length, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
          { label: 'Modules', value: totalModules, icon: Layers, color: 'bg-purple-50 text-purple-600' },
          { label: 'Lessons', value: totalLessons, icon: FileText, color: 'bg-green-50 text-green-600' },
        ].map((stat) => (
          <Card key={stat.label} className="border-slate-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course list */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search courses..."
              className="pl-10 border-slate-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No courses found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredCourses.map((course) => {
              const lessonCount = course.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0
              return (
                <Link
                  key={course.id}
                  href={`/admin-place/content/${course.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{course.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 text-xs">
                        {course.modules?.length || 0} modules
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 text-xs">
                        {lessonCount} lessons
                      </Badge>
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
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
