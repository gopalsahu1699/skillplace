'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { ShoppingCart, Play, LogIn } from 'lucide-react'

interface EnrollmentButtonProps {
  courseId: string
  courseSlug: string
  price: number
  size?: 'default' | 'sm' | 'lg'
}

export default function EnrollmentButton({ courseId, courseSlug, price, size = 'default' }: EnrollmentButtonProps) {
  const router = useRouter()
  const [enrolled, setEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    async function checkEnrollment() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (!currentUser) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('course_id', courseId)
        .limit(1)

      setEnrolled(!!data)
      setLoading(false)
    }

    checkEnrollment()

    // Listen for auth state changes (after login redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !user) {
        setUser(session.user)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [courseId])

  async function handleEnroll() {
    if (!user) {
      router.push('/login?redirectedFrom=/courses/' + courseSlug)
      return
    }

    setEnrolling(true)

    const { error } = await supabase.from('enrollments').insert({
      user_id: user.id,
      course_id: courseId,
      status: 'active',
      progress_percent: 0,
    })

    if (!error) {
      setEnrolled(true)
      window.location.href = '/courses/' + courseSlug + '/learn'
    }

    setEnrolling(false)
  }

  if (loading) {
    return (
      <Button size={size} disabled className="bg-slate-200">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400 mr-2" />
        Loading...
      </Button>
    )
  }

  if (enrolled) {
    return (
      <Link href={`/courses/${courseSlug}/learn`}>
        <Button size={size} className="bg-green-600 hover:bg-green-700 w-full">
          <Play className="h-4 w-4 mr-2" />
          Continue Learning
        </Button>
      </Link>
    )
  }

  if (!user) {
    return (
      <Button size={size} onClick={handleEnroll} className="bg-blue-600 hover:bg-blue-700 w-full">
        <LogIn className="h-4 w-4 mr-2" />
        Sign In to Enroll
      </Button>
    )
  }

  return (
    <Button size={size} onClick={handleEnroll} disabled={enrolling} className="bg-blue-600 hover:bg-blue-700 w-full">
      <ShoppingCart className="h-4 w-4 mr-2" />
      {enrolling ? 'Enrolling...' : price === 0 ? 'Enroll Free' : 'Enroll Now'}
    </Button>
  )
}
