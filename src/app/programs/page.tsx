'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { getProgramImage, getSupabaseImageUrl } from '@/lib/utils'
import { logger } from '@/lib/logger'

interface Branch {
  id: string
  name: string
  slug: string
  icon: string
}

interface ProgramFee {
  id: string
  program_id: string
  program_type: string
  price: number
  discount_price: number | null
  is_active: boolean
}

interface TrainingProgram {
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

interface Enrollment {
  id: string
  user_id: string
  program_id: string
  status: string
  enrolled_at: string
  training_programs: TrainingProgram | null
}

const renderProgramBadge = (type: string) => {
  switch (type) {
    case 'online':
      return (
        <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant/30 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: '14px' }}>online_prediction</span>
          <span className="font-label-md text-[12px]">Online</span>
        </div>
      )
    case 'offline':
      return (
        <div className="absolute top-4 right-4 bg-secondary text-on-primary px-3 py-1 rounded-full flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: '"FILL" 1' }}>groups</span>
          <span className="font-label-md text-[12px]">Offline</span>
        </div>
      )
    case 'hybrid':
      return (
        <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: '"FILL" 1' }}>layers</span>
          <span className="font-label-md text-[12px]">Hybrid</span>
        </div>
      )
    default:
      return null
  }
}

export default function ProgramsPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [_enrollmentsLoading, setEnrollmentsLoading] = useState(false)

  useEffect(() => {
    fetchBranches()
    fetchAllPrograms()
    fetchUser()
  }, [])

  async function fetchUser() {
    const { data: { user: u } } = await supabase.auth.getUser()
    setUser(u)
    if (u) fetchEnrollments(u.id)
  }

  async function fetchEnrollments(userId: string) {
    setEnrollmentsLoading(true)
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*,training_programs(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
      if (error) throw error
      setEnrollments((data || []).filter((e: Enrollment) => e.training_programs))
    } catch {
      setEnrollments([])
    }
    setEnrollmentsLoading(false)
  }

  async function fetchBranches() {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (error) throw error
      setBranches(data || [])
    } catch (err) {
      logger.error('Failed to fetch branches:', err)
      setBranches([])
    }
  }

  async function fetchAllPrograms() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('training_programs')
        .select('*,branches(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
      if (error) throw error

      const { data: allFees } = await supabase
        .from('program_fees')
        .select('*')
        .eq('is_active', true)

      const feesByProgram: Record<string, ProgramFee[]> = {}
      for (const fee of allFees || []) {
        if (!feesByProgram[fee.program_id]) feesByProgram[fee.program_id] = []
        feesByProgram[fee.program_id].push(fee)
      }

      const programsWithFees = (data || []).map((p: TrainingProgram) => ({
        ...p,
        program_fees: feesByProgram[p.id] || [],
      }))

      setPrograms(programsWithFees)
    } catch (err) {
      logger.error('Failed to fetch programs:', err)
      setError('Failed to load programs. Please try again.')
      setPrograms([])
    }
    setLoading(false)
  }

  const filteredPrograms = selectedBranch === 'all'
    ? programs
    : programs.filter(p => p.branches && p.branches.slug === selectedBranch)

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden">

      <section className="px-margin-mobile md:px-margin-desktop pt-16 pb-12 md:pt-24 md:pb-section-gap">
        <div className="max-w-container-max mx-auto text-center">
      
          <span className="text-secondary font-label-md tracking-widest uppercase mb-4 block">Industry-Led Excellence</span>
          <h1 className="font-display-lg text-display-lg mb-6 max-w-3xl mx-auto">Job-Oriented Training Programs</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Choose your branch and preferred learning mode — Online, Offline, or Hybrid. Each program is designed by industry experts with placement assistance to bridge the gap between academia and professional precision.
          </p>
        </div>
      </section>

      {user && enrollments.length > 0 && (
        <section className="px-margin-mobile md:px-margin-desktop pb-12">
          <div className="max-w-container-max mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/10">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>school</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary">My Enrolled Programs</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {enrollments.map((enrollment) => {
                const program = enrollment.training_programs!
                return (
                  <div key={enrollment.id} className="program-card bg-white rounded-xl border border-border-subtle overflow-hidden flex flex-col">
                    <div className="relative h-40 w-full">
                      <div
                        className="bg-cover bg-center w-full h-full"
                        style={{ backgroundImage: `url('${getProgramImage(program.branches?.slug || '')}')` }}
                      />
                      {renderProgramBadge(program.program_type)}
                    </div>
                    <div className="p-5 flex-grow flex flex-col">
                      <span className="bg-surface-container-high text-on-surface font-label-md text-[10px] uppercase px-2 py-0.5 rounded self-start mb-2">
                        {program.branches?.name}
                      </span>
                      <h3 className="font-headline-md text-headline-md mb-3 line-clamp-2">{program.name}</h3>
                      <p className="text-on-surface-variant text-sm mb-4 flex-grow line-clamp-2">{program.short_description}</p>
                      <Link
                        href={`/programs/${program.slug}/learn`}
                        className="w-full py-3 bg-secondary text-white font-label-md rounded-lg hover:bg-secondary/90 transition-all text-center block"
                      >
                        Go to Program
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section className="px-margin-mobile md:px-margin-desktop pb-section-gap">
        <div className="max-w-container-max mx-auto">

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 border-b border-outline-variant mb-12">
            <button
              onClick={() => setSelectedBranch('all')}
              className={`filter-tab py-4 font-label-md text-label-md transition-all border-b-2 -mb-[2px] ${selectedBranch === 'all' ? 'text-secondary border-secondary' : 'text-on-surface-variant border-transparent hover:text-secondary'}`}
            >
              All Programs
            </button>
            {branches.map((branch) => (
              <button
                key={branch.slug}
                onClick={() => setSelectedBranch(branch.slug)}
                className={`filter-tab py-4 font-label-md text-label-md transition-all border-b-2 -mb-[2px] ${selectedBranch === branch.slug ? 'text-secondary border-secondary' : 'text-on-surface-variant border-transparent hover:text-secondary'}`}
              >
                {branch.name}
              </button>
            ))}
          </div>

          {error ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-4xl text-red-400 mb-4 block">error_outline</span>
              <p className="text-red-600 font-medium mb-2">{error}</p>
              <button
                onClick={() => { setError(null); fetchAllPrograms(); }}
                className="text-secondary font-label-md hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="h-56 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer" aria-hidden="true" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                    <div className="h-6 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                    <div className="h-4 w-3/4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-4 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                      <div className="h-6 w-28 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                    </div>
                    <div className="space-y-2 pt-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-sm bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer" aria-hidden="true" />
                          <div className="h-3 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded" aria-hidden="true" />
                        </div>
                      ))}
                    </div>
                    <div className="h-12 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded-lg mt-4" aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-4 block">search_off</span>
              No programs available for this branch yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {filteredPrograms.map((program) => {
                const fees = program.program_fees || []
                return (
                <div key={program.id} className="program-card bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden flex flex-col">
                  <div
                    className="relative h-44 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${getProgramImage(program.branches?.slug || '')}')` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="bg-surface-container-high text-on-surface text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                        {program.branches?.name}
                      </span>
                      {program.duration_weeks && (
                        <span className="bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
                          {program.duration_weeks} Weeks
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="font-headline-md text-headline-md mb-3 line-clamp-1">{program.name}</h3>

                    {fees.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {fees.map((fee) => {
                          const config: Record<string, { icon: string; label: string; gradient: string }> = {
                            online: { icon: 'online_prediction', label: 'Online', gradient: 'from-purple-500 to-purple-600' },
                            offline: { icon: 'groups', label: 'Offline', gradient: 'from-blue-500 to-blue-600' },
                            hybrid: { icon: 'layers', label: 'Hybrid', gradient: 'from-amber-500 to-amber-600' },
                          }
                          const c = config[fee.program_type] || { icon: 'school', label: fee.program_type, gradient: 'from-slate-500 to-slate-600' }
                          return (
                            <Link
                              key={fee.id}
                              href={`/programs/${program.slug}/enroll?mode=${fee.program_type}`}
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all hover:shadow-md group ${
                                fee.program_type === program.program_type
                                  ? 'border-secondary bg-secondary/5'
                                  : 'border-transparent bg-surface-container-high/50 hover:border-slate-300'
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.gradient} flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-white text-lg">{c.icon}</span>
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface">{c.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}

                    <ul className="space-y-2 mb-6 flex-grow">
                      {(program.features || []).slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 mt-1.5 bg-secondary rounded-sm shrink-0"></span>
                          <span className="text-on-surface-variant text-xs leading-relaxed">{feature}</span>
                        </li>
                      ))}
                      {(program.features || []).length > 3 && (
                        <li className="text-xs text-secondary font-medium">+ {(program.features || []).length - 3} more</li>
                      )}
                    </ul>

                    <Link
                      href={`/programs/${program.slug}`}
                      className="w-full py-3 border-2 border-secondary text-secondary font-label-md rounded-xl hover:bg-secondary hover:text-on-primary transition-all text-center block mt-auto text-sm"
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
                )
              })}

              <div className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-12 text-center bg-surface-container-low/30">
                <span className="material-symbols-outlined text-4xl text-outline mb-4">school</span>
                <h4 className="font-headline-md text-headline-md mb-2">Request Custom Training</h4>
                <p className="text-on-surface-variant text-sm mb-6">Need specialized training for your organization or a specific engineering niche?</p>
                <Link href="/contact" className="text-secondary font-label-md flex items-center gap-2 hover:underline">
                  Contact Support
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary-container text-on-primary-container py-section-gap px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display-lg text-display-lg text-surface-container-lowest mb-8 max-w-xl">Engineering Excellence Through Precision Education</h2>
              <p className="font-body-lg text-body-lg text-on-primary-container mb-8 opacity-80">
                Our programs go beyond standard curriculum. We immerse students in real-world scenarios, guided by mentors who lead the industry today.
              </p>
              <div className="flex flex-wrap gap-12">
                <div>
                  <div className="text-3xl font-bold text-surface-container-lowest">100%</div>
                  <div className="text-sm opacity-60">Job Assistance</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-surface-container-lowest">6+</div>
                  <div className="text-sm opacity-60">Industry Mentors</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                <div
                  className="bg-cover bg-center w-full h-full"
                  style={{ backgroundImage: `url('${getSupabaseImageUrl('programs-hero-bg.jpg')}')` }}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-secondary p-6 rounded-lg shadow-xl hidden lg:block">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-on-primary text-4xl">workspace_premium</span>
                  <div>
                    <div className="text-on-primary font-bold">Industry Certified</div>
                    <div className="text-on-primary text-xs opacity-80">Practical Standards Training</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

  

    </div>
  )
}
