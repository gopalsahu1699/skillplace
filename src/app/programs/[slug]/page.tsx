'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getProgramImage, getSupabaseImageUrl } from '@/lib/utils'
import PhoneInput from '@/components/ui/phone-input'
import { sanitizePhone } from '@/lib/validation/phone'
import { SafeImg } from '@/components/ui/safe-image'

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

export default function ProgramDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [program, setProgram] = useState<ProgramDetail | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [user, setUser] = useState<any>(null)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Inquire form state
  const [inquireName, setInquireName] = useState('')
  const [inquirePhone, setInquirePhone] = useState('')
  const [inquireSubmitted, setInquireSubmitted] = useState(false)

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
        .select('course_id')
        .eq('program_id', programs.id)
        .order('order_index', { ascending: true })

      const courseIds = (programCourses || []).map((pc: any) => pc.course_id).filter(Boolean)
      if (courseIds.length > 0) {
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title, slug, duration_hours, level')
          .in('id', courseIds)

        const courseMap = new Map((coursesData || []).map((c) => [c.id, c]))
        setCourses(courseIds.map((id) => courseMap.get(id)).filter(Boolean) as Course[])
      }
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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading program details...
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-margin-mobile">
        <div className="text-center bg-white p-8 rounded-2xl tonal-card max-w-md w-full">
          <span className="material-symbols-outlined text-4xl text-error mb-3">error</span>
          <h2 className="text-headline-md font-bold text-on-surface mb-2">{error || 'Program Not Found'}</h2>
          <p className="text-on-surface-variant text-body-md mb-6">We couldn't locate the program you requested.</p>
          <Link href="/programs" className="px-6 py-3 bg-secondary text-white font-label-md rounded-lg block text-center">
            Back to Programs
          </Link>
        </div>
      </div>
    )
  }

  const renderEnrollButton = () => {
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
        <Link href={`/programs/${program.slug}/enroll`} className="bg-secondary text-white px-10 py-4 rounded-xl font-label-md hover:bg-secondary-container transition-all shadow-lg text-center block w-full sm:w-auto">
          Enroll Now
        </Link>
      )
    }
    return (
      <Link href={`/login?redirectedFrom=/programs/${program.slug}/enroll`} className="bg-secondary text-white px-10 py-4 rounded-xl font-label-md hover:bg-secondary-container transition-all shadow-lg text-center block w-full sm:w-auto">
        Enroll Now
      </Link>
    )
  }

  return (
    <div className="bg-surface font-body-md text-on-surface selection:bg-secondary/20 selection:text-secondary">
      
      {/* Hero Section */}
      <section className="relative min-h-[640px] flex items-center bg-primary-container overflow-hidden py-16 md:py-24">
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container/20 border border-secondary/30 text-secondary-fixed text-caption font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
              {program.program_type} LEARNING PROGRAM
            </div>
            
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
                <span className="text-on-primary-container text-caption font-semibold">PLACEMENT</span>
                <span className="text-on-primary font-bold text-headline-md">100%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-on-primary-container text-caption font-semibold">MODE</span>
                <span className="text-on-primary font-bold text-headline-md capitalize">{program.program_type}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              {renderEnrollButton()}
              <a href="#admission-inquiry" className="border border-outline-variant text-on-primary px-8 py-4 rounded-xl font-label-md hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-center w-full sm:w-auto">
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

      {/* Program Overview */}
      <section className="py-section-gap bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Bridging the Industry Gap</h2>
              <div className="w-20 h-1 bg-secondary rounded-full"></div>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {program.description || 'Our program is meticulously designed to transform graduates into industry-ready professionals. We address the critical disconnect between academic syllabus and real-world project execution through our Academic Precision curriculum.'}
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

      {/* Program Benefits Bento Grid */}
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

            <div className="bento-card bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle flex flex-col justify-between min-h-[220px]">
              <span className="material-symbols-outlined text-secondary text-4xl">domain</span>
              <div>
                <h3 className="font-bold text-on-surface mb-2 text-body-md">Site Visits</h3>
                <p className="text-on-surface-variant text-caption">Regular educational visits to active industrial project sites.</p>
              </div>
            </div>

            <div className="bento-card bg-surface-container-lowest p-8 rounded-3xl border border-border-subtle flex flex-col justify-between min-h-[220px]">
              <span className="material-symbols-outlined text-secondary text-4xl">groups</span>
              <div>
                <h3 className="font-bold text-on-surface mb-2 text-body-md">Mentor Support</h3>
                <p className="text-on-surface-variant text-caption">One-on-one sessions with industry veterans.</p>
              </div>
            </div>

            <div className="md:col-span-2 bento-card bg-primary-container p-8 rounded-3xl border border-border-subtle flex items-center gap-8 text-on-primary min-h-[220px] overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="font-headline-md text-headline-md mb-2 text-white">Hands-on Practical</h3>
                <p className="text-on-primary-container text-body-md">Work on actual industry projects and case studies using the latest technology stack.</p>
              </div>
              <div className="hidden sm:block absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4 pointer-events-none">
                <span className="material-symbols-outlined text-[180px]" style={{ fontVariationSettings: "'FILL' 1" }}>architecture</span>
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

      {/* Curriculum Highlights / Included Courses */}
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
                />
              </div>
            </div>

            <div className="space-y-4 w-full">
              {courses.length > 0 ? (
                courses.map((c, idx) => (
                  <Link
                    key={c.id}
                    href={`/courses/${c.slug}`}
                    className="bg-surface-container-low p-6 rounded-2xl border-l-4 border-secondary flex items-center justify-between group hover:bg-surface-container transition-colors block"
                  >
                    <div className="flex items-center gap-6">
                      <span className="text-headline-md font-bold text-outline">0{idx + 1}</span>
                      <div>
                        <h4 className="font-bold text-on-surface text-body-md group-hover:text-secondary transition-colors">{c.title}</h4>
                        <p className="text-caption text-on-surface-variant mt-0.5">{c.duration_hours} Hours · {c.level} level</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-2 transition-transform">arrow_forward</span>
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

      {/* Certification & Outcomes */}
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

      {/* Admission Details & Form */}
      <section id="admission-inquiry" className="py-section-gap bg-surface-container-high relative overflow-hidden">
        <div className="absolute -right-24 top-0 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[400px]">edit_note</span>
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="bg-white p-8 md:p-16 rounded-[40px] shadow-2xl border border-white flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 flex-1">
              <div className="inline-block px-4 py-1 rounded-full bg-error-container text-on-error-container font-bold text-caption uppercase tracking-wider">LIMITED SEATS ONLY</div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Admissions Open for New Batch</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">Take the first step towards a stable career. Join a community of achievers and builders.</p>
              
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-success-green text-xl">check_circle</span>
                  <span className="font-body-md text-on-surface">Direct Interaction with Faculty</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-success-green text-xl">check_circle</span>
                  <span className="font-body-md text-on-surface">EMI Facility Available</span>
                </li>
              </ul>
            </div>

            <div className="bg-surface-container-low p-8 rounded-3xl border border-border-subtle w-full max-w-md shrink-0">
              {inquireSubmitted ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-5xl text-success-green mb-3">task_alt</span>
                  <h4 className="font-bold text-headline-md text-on-surface mb-2">Inquiry Sent!</h4>
                  <p className="text-on-surface-variant text-sm">Our admissions counselor will call you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleInquire} className="space-y-4">
                  <div>
                    <label className="block text-caption font-bold mb-2 text-on-surface">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      value={inquireName}
                      onChange={(e) => setInquireName(e.target.value)}
                      className="w-full bg-white border border-border-subtle rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-md"
                    />
                  </div>
                  <div>
                    <label className="block text-caption font-bold mb-2 text-on-surface">Phone Number</label>
                    <PhoneInput
                      value={inquirePhone}
                      onChange={setInquirePhone}
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-primary text-on-primary font-label-md py-4 rounded-xl hover:bg-opacity-90 active:scale-95 transition-all mt-4">
                    Inquire Now
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
  )
}
