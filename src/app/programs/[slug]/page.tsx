'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Check, Clock, Wifi, Users, MapPin, BookOpen } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface ProgramDetail {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  program_type: string
  branch_id: string
  price: number
  discount_price: number | null
  duration_weeks: number
  features: string[]
  branches: { name: string; slug: string } | null
}

interface Course {
  id: string
  title: string
  slug: string
  duration_hours: number
  level: string
}

const programTypeConfig = {
  online: { label: 'Online', icon: Wifi, color: 'bg-purple-100 text-purple-700' },
  offline: { label: 'Offline', icon: Users, color: 'bg-blue-100 text-blue-700' },
  hybrid: { label: 'Hybrid', icon: MapPin, color: 'bg-amber-100 text-amber-700' },
}

export default function ProgramDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [program, setProgram] = useState<ProgramDetail | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [user, setUser] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
    fetchProgram()
  }, [slug])

  async function fetchUser() {
    const { data: { user: u } } = await supabase.auth.getUser()
    setUser(u)
  }

  async function fetchProgram() {
    setLoading(true)
    setError(null)
    try {
      // Public read - use anon client (no auth required for viewing program details)
      const { data: programs } = await supabase
        .from('training_programs')
        .select('*,branches(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (!programs) { setLoading(false); return }
      setProgram(programs)

      // Fetch courses (public)
      const { data: programCourses } = await supabase
        .from('program_courses')
        .select('courses(*)')
        .eq('program_id', programs.id)
        .order('sort_order', { ascending: true })

      setCourses((programCourses || []).map((pc: any) => pc.courses).filter(Boolean))
    } catch {
      setError('Failed to load program. Please try again.')
    }
    setLoading(false)
  }

  // Check enrollment when user is loaded
  useEffect(() => {
    if (user && program) {
      checkEnrollment()
    }
  }, [user, program])

  async function checkEnrollment() {
    const { data } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('program_id', program!.id)
      .single()
    setEnrollment(data)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <Link href="/programs">
            <Button>Back to Programs</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Program Not Found</h2>
          <Link href="/programs">
            <Button>Back to Programs</Button>
          </Link>
        </div>
      </div>
    )
  }

  const config = programTypeConfig[program.program_type as keyof typeof programTypeConfig]
  const Icon = config?.icon || BookOpen

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Programs
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${config?.color || ''} border-0`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config?.label || program.program_type}
                </Badge>
                <Badge className="bg-slate-100 text-slate-600 border-0">
                  {program.branches?.name}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{program.name}</h1>
              <p className="text-slate-600 text-lg">{program.description}</p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">What You Get</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(program.features || []).map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses Included */}
            {courses.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Courses Included ({courses.length})
                </h2>
                <div className="space-y-3">
                  {courses.map((course, i) => (
                    <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{course.title}</p>
                        <p className="text-xs text-slate-500">{course.duration_hours}h · {course.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Enroll Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
              <div className="text-center mb-6">
                {program.discount_price ? (
                  <>
                    <p className="text-sm text-slate-400 line-through">₹{program.price.toLocaleString()}</p>
                    <p className="text-4xl font-bold text-slate-900">₹{program.discount_price.toLocaleString()}</p>
                  </>
                ) : (
                  <p className="text-4xl font-bold text-slate-900">₹{program.price.toLocaleString()}</p>
                )}
                <p className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {program.duration_weeks} weeks
                </p>
              </div>

              {user && enrollment?.status === 'active' ? (
                <Link href={`/programs/${program.slug}/learn`}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg">
                    Go to Program
                  </Button>
                </Link>
              ) : user && enrollment?.status === 'pending' ? (
                <Button disabled className="w-full py-6 text-lg bg-amber-100 text-amber-700">
                  Enrollment Pending
                </Button>
              ) : user ? (
                <Link href={`/programs/${program.slug}/enroll`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg">
                    Enroll Now
                  </Button>
                </Link>
              ) : (
                <Link href={`/login?redirectedFrom=/programs/${program.slug}/enroll`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg">
                    Sign in to Enroll
                  </Button>
                </Link>
              )}

              <p className="text-xs text-slate-400 text-center mt-3">
                Secure payment · Instant access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
