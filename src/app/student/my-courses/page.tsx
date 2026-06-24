'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { BookOpen } from 'lucide-react'

interface Enrollment {
  id: string
  status: 'active' | 'completed' | 'expired'
  progress_percent: number
  courses: {
    title: string
    slug: string
    thumbnail_url: string | null
  } | null
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('enrollments')
      .select('*, courses(title, slug, thumbnail_url)')
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false })

    setCourses(data || [])
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Courses</h1>
      {loading ? (
        <p className="text-slate-500">Loading courses...</p>
      ) : courses.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex h-16 w-16 bg-slate-100 rounded-2xl items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No courses enrolled yet.</p>
          <Link href="/courses">
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((enrollment) => (
            <div key={enrollment.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-6 hover:shadow-md transition-all duration-300">
              <div className="h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl shrink-0 overflow-hidden flex items-center justify-center">
                {enrollment.courses?.thumbnail_url ? (
                  <img src={enrollment.courses.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-slate-900">{enrollment.courses?.title || 'Unknown Course'}</h3>
                  <Badge variant={enrollment.status === 'completed' ? 'default' : 'secondary'} className={
                    enrollment.status === 'completed' ? 'bg-green-100 text-green-700 border-0' :
                    enrollment.status === 'active' ? 'bg-blue-100 text-blue-700 border-0' :
                    'bg-red-100 text-red-700 border-0'
                  }>
                    {enrollment.status}
                  </Badge>
                </div>
                <Progress value={enrollment.progress_percent} className="h-2 mb-1.5" />
                <p className="text-sm text-slate-500">{enrollment.progress_percent}% complete</p>
              </div>
              <Link href={`/courses/${enrollment.courses?.slug || ''}`}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  {enrollment.status === 'completed' ? 'Review' : 'Continue'}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
