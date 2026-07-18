'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getProgramImage, getSupabaseImageUrl } from '@/lib/utils'
import PhoneInput from '@/components/ui/phone-input'
import { sanitizePhone } from '@/lib/validation/phone'
import { SafeImg } from '@/components/ui/safe-image'

interface ProgramFee {
  id: string
  program_id: string
  program_type: string
  price: number
  discount_price: number | null
  is_active: boolean
  is_popular: boolean
  display_order: number
}

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
  program_fees?: ProgramFee[]
}

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  duration_hours: number
  level: string
}

export default function ProgramDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [program, setProgram] = useState<ProgramDetail | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [enrollment, setEnrollment] = useState<{ id: string; status: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [inquireName, setInquireName] = useState('')
  const [inquirePhone, setInquirePhone] = useState('')
  const [inquireSubmitted, setInquireSubmitted] = useState(false)

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

      const { data: fees } = await supabase
        .from('program_fees')
        .select('*')
        .eq('program_id', programs.id)
        .eq('is_active', true)

      setProgram({ ...programs, program_fees: fees || [] })

      const { data: programCourses } = await supabase
        .from('program_courses')
        .select('course_id')
        .eq('program_id', programs.id)
        .order('order_index', { ascending: true })

      const courseIds = (programCourses || []).map((pc: { course_id: string }) => pc.course_id).filter(Boolean)
      if (courseIds.length > 0) {
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, slug, description, short_description, duration_hours, level')
          .in('id', courseIds)

        const courseMap = new Map((coursesData || []).map((c) => [c.id, c]))
        setCourses(courseIds.map((id) => courseMap.get(id)).filter(Boolean) as Course[])
      }
    } catch {
      setError('Failed to load program. Please try again.')
    }
    setLoading(false)
  }

  async function checkEnrollment() {
    if (!user || !program) return
    const { data } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('program_id', program.id)
      .single()
    setEnrollment(data)
  }

  useEffect(() => {
    fetchUser()
    fetchProgram()
  }, [])

  useEffect(() => {
    if (user && program) {
      Promise.resolve().then(() => checkEnrollment())
    }
  }, [user, program])

  async function handleInquire(e: React.FormEvent) {
    e.preventDefault()
    if (!inquireName || !inquirePhone) return
    const sanitized = sanitizePhone(inquirePhone)
    await supabase.from('leads').insert({
      name: inquireName,
      phone: sanitized || inquirePhone,
      message: `Inquiry for Program: ${program?.name}`,
      source: 'program_detail_inquiry'
    })
    setInquireSubmitted(true)
  }

  if (loading) {
    return (
      <div className="bg-surface min-h-screen">
        <section className="relative min-h-[640px] flex items-center bg-gray-800 overflow-hidden py-16 md:py-24">
          <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-12 bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                <div className="h-3 w-3 bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer rounded-full" aria-hidden="true" />
                <div className="h-3 w-16 bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                <div className="h-3 w-3 bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer rounded-full" aria-hidden="true" />
                <div className="h-3 w-24 bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
              </div>
              <div className="h-6 w-48 bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer rounded-full" aria-hidden="true" />
              <div className="h-12 w-full max-w-lg bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
              <div className="h-6 w-full max-w-md bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-16 bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                    <div className="h-6 w-20 bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <div className="h-14 w-44 bg-gradient-to-r from-blue-500/50 via-blue-400/50 to-blue-500/50 bg-[length:200%_100%] animate-shimmer rounded-xl" aria-hidden="true" />
                <div className="h-14 w-40 bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer rounded-xl" aria-hidden="true" />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="aspect-square rounded-3xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-white/20 via-white/10 to-white/20 bg-[length:200%_100%] animate-shimmer" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-4">
              <div className="h-8 w-64 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
              <div className="h-1 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded-full" aria-hidden="true" />
              <div className="h-4 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
              <div className="h-4 w-5/6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
              <div className="h-4 w-3/4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
            </div>
            <div className="lg:col-span-5">
              <div className="bg-white border border-border p-8 rounded-3xl space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-8 w-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded shrink-0" aria-hidden="true" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                      <div className="h-3 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <div className="h-8 w-64 mx-auto bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
            <div className="h-4 w-96 mx-auto bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-border p-6 rounded-3xl space-y-4 min-h-[200px]">
                  <div className="h-10 w-10 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                  <div className="h-5 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                  <div className="h-3 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                  <div className="h-3 w-3/4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile">
        <div className="text-center bg-white p-8 rounded-2xl tonal-card max-w-md w-full">
          <span className="material-symbols-outlined text-4xl text-error mb-3">error</span>
          <h2 className="text-headline-md font-bold text-on-surface mb-2">{error || 'Program Not Found'}</h2>
          <p className="text-on-surface-variant text-body-md mb-6">We couldn&apos;t locate the program you requested.</p>
          <Link href="/programs" className="px-6 py-3 bg-secondary text-white font-label-md rounded-lg block text-center">
            Back to Programs
          </Link>
        </div>
      </div>
    )
  }

  const renderEnrollButton = (mode?: string) => {
    const enrollPath = mode
      ? `/programs/${program.slug}/enroll?mode=${mode}`
      : `/programs/${program.slug}/enroll`
    if (user && enrollment?.status === 'active') {
      return (
        <Link href={`/programs/${program.slug}/learn`} className="bg-success-green text-white px-10 py-4 rounded-xl font-label-md hover:bg-opacity-90 transition-all shadow-lg text-center block w-full sm:w-auto">
          Go to Program
        </Link>
      )
    }
    if (user && enrollment?.status === 'pending') {
      return (
        <button disabled className="bg-tertiary-fixed text-on-tertiary-fixed px-10 py-4 rounded-xl font-label-md opacity-80 cursor-not-allowed w-full sm:w-auto">
          Enrollment Pending
        </button>
      )
    }
    if (user) {
      return (
        <Link href={enrollPath} className="bg-secondary text-white px-10 py-4 rounded-xl font-label-md hover:bg-secondary-container transition-all shadow-lg text-center block w-full sm:w-auto">
          Enroll Now
        </Link>
      )
    }
    return (
      <Link href={`/login?redirectedFrom=${encodeURIComponent(enrollPath)}`} className="bg-secondary text-white px-10 py-4 rounded-xl font-label-md hover:bg-secondary-container transition-all shadow-lg text-center block w-full sm:w-auto">
        Enroll Now
      </Link>
    )
  }

  return (
    <>
      <div className="bg-surface font-body-md text-on-surface selection:bg-secondary/20 selection:text-secondary">

        <section className="relative min-h-[640px] flex items-center bg-primary-container overflow-hidden py-16 md:py-24">
          <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <nav aria-label="Breadcrumb" className="text-sm text-on-primary-container/70">
                <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <Link href="/programs" className="hover:text-secondary transition-colors">Programs</Link>
                <span className="mx-2">/</span>
                <span className="text-white">{program.name}</span>
              </nav>

          

              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-primary leading-tight">
                {program.name}
              </h1>

              <p className="font-headline-md text-headline-md text-primary-fixed-dim/80">
                {program.short_description || `${program.branches?.name || 'Engineering'} with 100% Job Assistance`}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-on-primary-container text-caption font-semibold">DURATION</span>
                  <span className="text-on-primary font-bold text-headline-md">{program.duration_weeks} Weeks</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-on-primary-container text-caption font-semibold">PLACEMENT ASSISTANCE</span>
                  <span className="text-on-primary font-bold text-headline-md">100%</span>
                </div>
             
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                {renderEnrollButton()}
                <a href="/contact" className="border border-outline-variant text-on-primary px-8 py-4 rounded-xl font-label-md hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-center w-full sm:w-auto">
                  <span className="material-symbols-outlined text-xl">edit_note</span>
                  Inquire Now
                </a>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-3 border-2 border-white/10">
                <SafeImg
                  className="w-full h-full object-cover"
                  alt={program.name}
                  src={getProgramImage(program.branches?.slug || '')}
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-surface-bright p-6 rounded-2xl shadow-xl flex items-center gap-4 -rotate-3 border border-border-subtle">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-on-primary shrink-0">
                  <span className="material-symbols-outlined">engineering</span>
                </div>
                <div>
                  <p className="text-on-surface font-bold text-body-md">Practical Mastery</p>
                  <p className="text-on-surface-variant text-caption">Industry-Standard Tools</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-surface">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Bridging the Industry Gap</h2>
                <div className="w-20 h-1 bg-secondary rounded-full"></div>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  {program.short_description  || 'Our program is meticulously designed to transform graduates into industry-ready professionals. We address the critical disconnect between academic syllabus and real-world project execution through our Academic Precision curriculum.'}
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-surface-container-low border border-border-subtle p-8 rounded-3xl space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary text-3xl shrink-0">verified</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-body-md">Academic Precision</h4>
                      <p className="text-on-surface-variant text-caption mt-1">Strict adherence to national building codes and precision standards in every module.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 pt-4 border-t border-border-subtle">
                    <span className="material-symbols-outlined text-secondary text-3xl shrink-0">terminal</span>
                    <div>
                      <h4 className="font-bold text-on-surface text-body-md">Tech-First Approach</h4>
                      <p className="text-on-surface-variant text-caption mt-1">Integrated learning of industry-leading BIM and CAD software suites.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-surface-container-low">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Program Benefits</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto font-body-md">Designed by industry experts to provide a comprehensive roadmap for your professional growth.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="md:col-span-2 bento-card bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle flex flex-col justify-between min-h-[220px]">
                <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>work_history</span>
                <div>
                  <h3 className="font-headline-md text-headline-md mb-2 text-on-surface">100% Job Assistance</h3>
                  <p className="text-on-surface-variant text-body-md">Dedicated placement cell and regular interview drives with top construction & engineering firms.</p>
                </div>
              </div>

              <div className="bento-card bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle flex flex-col justify-between min-h-[220px]">
                <span className="material-symbols-outlined text-secondary text-4xl">communication</span>
                <div>
                  <h3 className="font-bold text-on-surface mb-2 text-body-md">Soft Skills</h3>
                  <p className="text-on-surface-variant text-caption">Communication and leadership training for site management.</p>
                </div>
              </div>

              {/* <div className="bento-card bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle flex flex-col justify-between min-h-[220px]">
                <span className="material-symbols-outlined text-secondary text-4xl">domain</span>
                <div>
                  <h3 className="font-bold text-on-surface mb-2 text-body-md">Site Visits</h3>
                  <p className="text-on-surface-variant text-caption">Regular educational visits to active industrial project sites.</p>
                </div>
              </div> */}

              <div className="bento-card bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle flex flex-col justify-between min-h-[220px]">
                <span className="material-symbols-outlined text-secondary text-4xl">groups</span>
                <div>
                  <h3 className="font-bold text-on-surface mb-2 text-body-md">Mentor Support</h3>
                  <p className="text-on-surface-variant text-caption">One-on-one sessions with industry veterans.</p>
                </div>
              </div>

              <div className="md:col-span-2 bento-card bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle flex items-center gap-8 min-h-[220px] overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="font-headline-md text-headline-md mb-2 text-on-surface">Hands-on Practical</h3>
                  <p className="text-on-surface-variant text-body-md">Work on actual industry projects and case studies using the latest technology stack.</p>
                </div>
                <div className="hidden sm:block absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
                  <span className="material-symbols-outlined text-[180px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
                </div>
              </div>

              <div className="bento-card bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle flex flex-col justify-between min-h-[220px]">
                <span className="material-symbols-outlined text-secondary text-4xl">build</span>
                <div>
                  <h3 className="font-bold text-on-surface mb-2 text-body-md">Technical Proficiency</h3>
                  <p className="text-on-surface-variant text-caption">Mastery over high-precision measurement tools.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-surface">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
              <div className="lg:sticky lg:top-32 space-y-6">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Curriculum Highlights</h2>
                <p className="text-on-surface-variant font-body-lg">Our comprehensive modules cover everything from fundamental drafting to advanced BIM modeling and project management.</p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3 text-secondary font-bold font-label-md">
                    <span className="material-symbols-outlined">check_circle</span>
                    Industry Integrated Learning
                  </div>
                  <div className="flex items-center gap-3 text-secondary font-bold font-label-md">
                    <span className="material-symbols-outlined">check_circle</span>
                    Project-Based Evaluation
                  </div>
                </div>

                <div className="pt-6">
                  <img
                    className="rounded-2xl border border-border-subtle shadow-sm w-full object-cover max-h-72"
                    alt="Curriculum CAD Illustration"
                    src={getSupabaseImageUrl('program-detail.jpg')}
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="space-y-4 w-full">
                {courses.length > 0 ? (
                  courses.map((c, idx) => (
                    <Link
                      key={c.id}
                      href={`#`}
                      // href={`/courses/${c.slug}`}
                      className="bg-surface-container-low p-6 rounded-2xl border-l-4 border-secondary flex items-center justify-between group hover:bg-surface-container transition-colors block"
                    >
                      <div className="flex items-center gap-6">
                        <span className="text-headline-md font-bold text-outline">0{idx + 1}</span>
                        <div>
                          <h4 className="font-bold text-on-surface text-body-md group-hover:text-secondary transition-colors">{c.title}</h4>
                          {/* <p className="text-caption text-on-surface-variant mt-0.5">{c.duration_hours} Hours &middot; {c.level} level</p> */}
                          <p className="text-caption text-on-surface-variant mt-0.5">  {c.short_description || c.description} </p>
                        </div>
                      </div>
                      {/* <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-2 transition-transform">arrow_forward</span> */}
                    </Link>
                  ))
                ) : (
                  ['AutoCAD 2D/3D Drafting', 'Revit Architecture & BIM', 'Quantity Estimation & Measurement', 'BOQ Preparation & Costing', 'Site Execution & Safety Norms'].map((title, idx) => (
                    <div key={title} className="bg-surface-container-low p-6 rounded-2xl border-l-4 border-secondary flex items-center justify-between group hover:bg-surface-container transition-colors">
                      <div className="flex items-center gap-6">
                        <span className="text-headline-md font-bold text-outline">0{idx + 1}</span>
                        <div>
                          <h4 className="font-bold text-on-surface text-body-md">{title}</h4>
                          <p className="text-caption text-on-surface-variant">Core module included in program</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-2 transition-transform">arrow_forward</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {program.program_fees && program.program_fees.length > 0 && (
          <section className="py-section-gap bg-surface">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="text-center mb-16">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Choose Your Learning Mode</h2>
                <p className="text-on-surface-variant max-w-2xl mx-auto font-body-md mt-4">
                  Select the mode that best fits your schedule and learning style. Fees vary by mode.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...program.program_fees]
                  .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                  .map((fee) => {
                  const modeConfig = {
                    online: {
                      icon: 'online_prediction',
                      label: 'Online',
                      desc: 'Learn from anywhere with live recorded sessions',
                      features: ['Recorded lectures', 'Live Q&A sessions', 'Digital study material', 'Online assessments', 'Remote mentor support'],
                      gradient: 'from-purple-500 to-purple-700',
                    },
                    offline: {
                      icon: 'groups',
                      label: 'Offline',
                      desc: 'In-person classroom training at our campus',
                      features: ['Classroom lectures', 'Hands-on labs', 'In-person mentorship', 'On-campus facilities', 'Networking events'],
                      gradient: 'from-blue-500 to-blue-700',
                    },
                    hybrid: {
                      icon: 'layers',
                      label: 'Hybrid',
                      desc: 'Blend of online flexibility with offline practice',
                      features: ['Recorded lectures + labs', 'Flexible schedule', 'In-person workshops', 'Campus access', 'Hybrid mentor support'],
                      gradient: 'from-amber-500 to-amber-700',
                    },
                  }[fee.program_type] || { icon: 'school', label: fee.program_type, desc: '', features: [], gradient: 'from-slate-500 to-slate-700' }

                  return (
                    <div
                      key={fee.id}
                      className={`relative bg-white border-2 rounded-3xl p-6 flex flex-col transition-all hover:shadow-xl ${
                        fee.is_popular ? 'border-secondary shadow-lg ring-2 ring-secondary/20' : 'border-border-subtle'
                      }`}
                    >
                      {fee.is_popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-on-primary text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                          Popular
                        </div>
                      )}
                      <div className={`w-14 h-14 bg-gradient-to-br ${modeConfig.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
                        <span className="material-symbols-outlined text-white text-2xl">{modeConfig.icon}</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{modeConfig.label}</h3>
                      <p className="text-on-surface-variant text-sm mb-4">{modeConfig.desc}</p>
                      {/* <div className="mb-6">
                        {fee.discount_price && fee.discount_price < fee.price ? (
                          <>
                            <p className="text-sm text-on-surface-variant line-through">₹{fee.price.toLocaleString()}</p>
                            <p className="text-3xl font-bold text-on-surface">₹{fee.discount_price.toLocaleString()}</p>
                            <p className="text-xs text-success-green font-medium mt-1">Save ₹{(fee.price - fee.discount_price).toLocaleString()}</p>
                          </>
                        ) : (
                          <p className="text-3xl font-bold text-on-surface">₹{fee.price.toLocaleString()}</p>
                        )}
                        {fee.price > 0 && <p className="text-xs text-on-surface-variant mt-1">Including applicable taxes</p>}
                     
                      </div> */}
                   <div className="mb-6">
  <div className="flex items-center gap-3">
    <p className="text-4xl font-extrabold text-primary">
      ₹29,000
    </p>

    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      28% OFF
    </span>
  </div>

  <div className="mt-2 flex items-center gap-2">
    <p className="text-lg text-on-surface-variant line-through">
      ₹40,000
    </p>

    <span className="text-sm font-medium text-green-600">
      You Save ₹11,000
    </span>
  </div>
</div>
                      <ul className="space-y-3 mb-8 flex-grow">
                        {modeConfig.features.map((f) => (
                          <li key={f} className="flex items-start gap-3 text-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-secondary text-lg shrink-0">check_circle</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto">
                        {user && enrollment?.status === 'active' ? (
                          <Link
                            href={`/programs/${program.slug}/learn`}
                            className="w-full py-3 rounded-xl font-label-md text-center block bg-success-green text-white hover:bg-opacity-90 transition-all"
                          >
                            Go to Program
                          </Link>
                        ) : (
                          <Link
                            href={`/programs/${program.slug}/enroll?mode=${fee.program_type}`}
                            className="w-full py-3 rounded-xl font-label-md text-center block bg-secondary text-white hover:bg-secondary/90 transition-all shadow-md"
                          >
                            Enroll Now — ₹{(fee.discount_price || fee.price).toLocaleString()}
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        <section className="py-section-gap bg-surface-container-lowest">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
            <h2 className="font-headline-lg text-headline-lg mb-12 text-on-surface">Certification &amp; Outcomes</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-10 bg-white border border-border-subtle rounded-3xl shadow-sm hover:shadow-md transition-shadow tonal-card">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary">
                  <span className="material-symbols-outlined text-4xl">workspace_premium</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-2 text-on-surface">Training Certificate</h3>
                <p className="text-on-surface-variant text-body-md">Recognizing your mastery of {program.duration_weeks} weeks of rigorous technical training.</p>
              </div>

              <div className="p-10 bg-white border border-border-subtle rounded-3xl shadow-sm hover:shadow-md transition-shadow tonal-card">
                <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary">
                  <span className="material-symbols-outlined text-4xl">assignment_turned_in</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-2 text-on-surface">Project Certificate</h3>
                <p className="text-on-surface-variant text-body-md">Validation of your hands-on experience in completing real-world engineering projects.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-surface-container-lowest">
  <div className="max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop">

    <div className="text-center mb-14">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
        Your Transformation Journey
      </h2>

      <p className="max-w-3xl mx-auto text-on-surface-variant text-body-lg">
        SkillPlace Academy doesn't just teach software—we transform engineering
        students into confident, industry-ready professionals.
      </p>
    </div>

    <div className="grid lg:grid-cols-2 gap-10">

      {/* Before */}
      <div className="rounded-3xl border border-red-100 bg-red-50 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-600 text-3xl">
              sentiment_dissatisfied
            </span>
          </div>

          <div>
            <p className="text-sm uppercase tracking-wider text-red-600 font-semibold">
              Before Joining
            </p>
            <h3 className="text-3xl font-bold text-on-surface">
              Limited Industry Exposure
            </h3>
          </div>
        </div>

        <div className="space-y-5">

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500">close</span>
            <p>Theoretical knowledge with limited practical application.</p>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500">close</span>
            <p>Little or no experience with industry-standard software.</p>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500">close</span>
            <p>No professional engineering project portfolio.</p>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500">close</span>
            <p>Low confidence during technical interviews.</p>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500">close</span>
            <p>Uncertain about industry expectations and career direction.</p>
          </div>

        </div>
      </div>

      {/* After */}
      <div className="rounded-3xl border border-green-100 bg-green-50 p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 text-3xl">
              emoji_events
            </span>
          </div>

          <div>
            <p className="text-sm uppercase tracking-wider text-green-600 font-semibold">
              After Completion
            </p>
            <h3 className="text-3xl font-bold text-on-surface">
              Industry-Ready Engineer
            </h3>
          </div>
        </div>

        <div className="space-y-5">

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <p>Hands-on expertise with industry-standard engineering software.</p>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <p>Real-world engineering projects that strengthen your portfolio.</p>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <p>Professional resume, portfolio, and career guidance.</p>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <p>Improved technical and HR interview confidence.</p>
          </div>

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <p>Industry-recognized certification and job-ready practical skills.</p>
          </div>

        </div>
      </div>

    </div>

  </div>
</section>


<section className="py-section-gap bg-surface-container-lowest">
  <div className="max-w-6xl mx-auto px-margin-mobile md:px-margin-desktop">

    <div className="text-center mb-14">
      <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
        What You'll Achieve
      </h2>

      <p className="max-w-3xl mx-auto text-on-surface-variant text-body-lg">
        By the end of our Job Oriented Training Program, you'll graduate with the
        practical skills, confidence, and experience needed to start your
        engineering career.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border-subtle hover:shadow-lg transition-all">
        <span className="material-symbols-outlined text-primary text-3xl">
          verified
        </span>
        <div>
          <h3 className="font-semibold text-lg mb-1">Master Industry Software</h3>
          <p className="text-sm text-on-surface-variant">
            Gain hands-on expertise in professional engineering software used by top companies.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border-subtle hover:shadow-lg transition-all">
        <span className="material-symbols-outlined text-primary text-3xl">
          engineering
        </span>
        <div>
          <h3 className="font-semibold text-lg mb-1">Build Real Projects</h3>
          <p className="text-sm text-on-surface-variant">
            Complete practical industry projects that strengthen your technical portfolio.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border-subtle hover:shadow-lg transition-all">
        <span className="material-symbols-outlined text-primary text-3xl">
          description
        </span>
        <div>
          <h3 className="font-semibold text-lg mb-1">Professional Portfolio</h3>
          <p className="text-sm text-on-surface-variant">
            Showcase your work with a resume and project portfolio that impress employers.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border-subtle hover:shadow-lg transition-all">
        <span className="material-symbols-outlined text-primary text-3xl">
          groups
        </span>
        <div>
          <h3 className="font-semibold text-lg mb-1">Interview Preparation</h3>
          <p className="text-sm text-on-surface-variant">
            Prepare with mock interviews, aptitude practice, and HR guidance.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border-subtle hover:shadow-lg transition-all">
        <span className="material-symbols-outlined text-primary text-3xl">
          workspace_premium
        </span>
        <div>
          <h3 className="font-semibold text-lg mb-1">Earn Dual Certificates</h3>
          <p className="text-sm text-on-surface-variant">
            Receive training and project certificates that validate your practical skills.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border-subtle hover:shadow-lg transition-all">
        <span className="material-symbols-outlined text-primary text-3xl">
          work
        </span>
        <div>
          <h3 className="font-semibold text-lg mb-1">Become Job Ready</h3>
          <p className="text-sm text-on-surface-variant">
            Graduate with the confidence and practical knowledge employers are looking for.
          </p>
        </div>
      </div>

    </div>

    <div className="mt-14 rounded-3xl bg-gradient-to-r from-primary to-secondary text-white p-10 text-center">
      <h3 className="text-3xl font-bold mb-4">
        Your Success is Our Goal
      </h3>

      <p className="max-w-3xl mx-auto text-lg text-white/90">
        Every lesson, project, assessment, and mentoring session is designed
        with one objective—to help you become an industry-ready engineer who can
        confidently apply for jobs and perform from day one.
      </p>
    </div>

  </div>
</section>

      

        <section className="py-section-gap bg-surface">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="bg-primary-container rounded-[40px] p-12 md:p-24 text-center space-y-8 relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-primary">Ready to Start Your Career?</h2>
                <p className="text-on-primary-container text-body-lg max-w-2xl mx-auto opacity-90">Join the most comprehensive engineering program in Bilaspur and secure your future with guaranteed placement assistance.</p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4 items-center">
                  {renderEnrollButton()}
                  <Link href="/contact" className="bg-transparent border-2 border-white/20 text-white px-10 py-4 rounded-xl font-headline-md hover:bg-white/5 active:scale-95 transition-all text-center block w-full sm:w-auto">
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
