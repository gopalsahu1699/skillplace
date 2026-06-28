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
      const { data: programs } = await supabase
        .from('training_programs')
        .select('*,branches(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (!programs) { setLoading(false); return }
      setProgram(programs)

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
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
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
          <h2 className="text-xl font-bold text-slate-900 mb-2">Program Not Found</h2>
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
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Programs
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900">{program.name}</h1>
                    <Badge className={`${config.color} border-0`}>{config.label}</Badge>
                  </div>
                  {program.branches?.name && (
                    <p className="text-sm text-slate-500">{program.branches.name}</p>
                  )}
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">{program.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {program.duration_weeks} weeks
                </span>
              </div>
            </div>

            {program.features && program.features.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-3">What You'll Get</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {program.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-blue-600 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {courses.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Courses Included</h3>
                <div className="space-y-2">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <span className="text-sm font-medium text-slate-700">{course.title}</span>
                      <span className="text-xs text-slate-500">{course.duration_hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-20">
              <div className="text-center mb-4">
                {program.discount_price ? (
                  <>
                    <p className="text-sm text-slate-400 line-through">₹{program.price.toLocaleString()}</p>
                    <p className="text-3xl font-bold text-slate-900">₹{program.discount_price.toLocaleString()}</p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-slate-900">₹{program.price.toLocaleString()}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">{program.duration_weeks} weeks</p>
              </div>

              {user && enrollment?.status === 'active' ? (
                <Link href={`/programs/${program.slug}/learn`}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Go to Program
                  </Button>
                </Link>
              ) : user && enrollment?.status === 'pending' ? (
                <Button disabled className="w-full bg-amber-100 text-amber-700">
                  Enrollment Pending
                </Button>
              ) : user ? (
                <Link href={`/programs/${program.slug}/enroll`}>
                  <Button className="w-full">
                    Enroll Now
                  </Button>
                </Link>
              ) : (
                <Link href={`/login?redirectedFrom=/programs/${program.slug}/enroll`}>
                  <Button className="w-full">
                    Sign in to Enroll
                  </Button>
                </Link>
              )}

              <p className="text-xs text-slate-400 text-center mt-2">
                Secure payment · Instant access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
