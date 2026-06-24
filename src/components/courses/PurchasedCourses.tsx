'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import type { Enrollment } from '@/types'

interface EnrollmentWithCourse extends Enrollment {
  courses: {
    title: string
    slug: string
    thumbnail_url: string | null
  } | null
}

export default function PurchasedCourses() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    async function fetchEnrollments() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setLoading(false)
        return
      }

      setUser(currentUser)

      const { data } = await supabase
        .from('enrollments')
        .select('*, courses(title, slug, thumbnail_url)')
        .eq('user_id', currentUser.id)
        .order('enrolled_at', { ascending: false })

      if (data) {
        setEnrollments(data as EnrollmentWithCourse[])
      }
      setLoading(false)
    }

    fetchEnrollments()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-32 bg-slate-100 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-slate-100 rounded animate-pulse mb-2" />
              <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-border">
        <p className="text-muted-foreground mb-4">Log in to see your purchased courses</p>
        <Link href="/login">
          <Button>Log In</Button>
        </Link>
      </div>
    )
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-border">
        <p className="text-muted-foreground mb-4">You haven&apos;t enrolled in any courses yet</p>
        <Link href="/courses">
          <Button>Browse Courses</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {enrollments.map((enrollment) => (
        <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
          <div className="h-32 bg-slate-100 flex items-center justify-center">
            {enrollment.courses?.thumbnail_url ? (
              <img
                src={enrollment.courses.thumbnail_url}
                alt={enrollment.courses.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-muted-foreground text-sm">No thumbnail</span>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="secondary"
                className={
                  enrollment.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }
              >
                {enrollment.status}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground mb-3 line-clamp-1">
              {enrollment.courses?.title}
            </h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">{enrollment.progress_percent}%</span>
              </div>
              <Progress value={enrollment.progress_percent} />
            </div>
            <Link href={`/courses/${enrollment.courses?.slug}`}>
              <Button className="w-full" variant={enrollment.progress_percent === 100 ? 'outline' : 'default'}>
                {enrollment.progress_percent === 100 ? 'Review Course' : 'Continue Learning'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
