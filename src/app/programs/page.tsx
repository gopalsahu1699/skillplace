'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

interface Branch {
  id: string
  name: string
  slug: string
  icon: string
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
}

interface Enrollment {
  id: string
  user_id: string
  program_id: string
  status: string
  enrolled_at: string
  training_programs: TrainingProgram | null
}

const getProgramImage = (branchSlug: string) => {
  switch (branchSlug) {
    case 'civil':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpsrAxGyEawPBfuxPxTWpxtk4x4UYgSvn5iBVnHXt0ojdE9pCq1_LAmEiwWcDetowEtXfl_9kJ-9V6i4H7XGhoZ6E7TqsoT1dVBL1oyplTm4KG3QYFZTKUK-8dENIidfwPEeBByOjkP2VIigR-WYJX5BP-V1RXPXJMqt3r1Ns2T5Yw1G50ZndB218Qhh64ana_V4h0WqNSlFYl_De3hpHFhtdF_0fpJjPtNZm_18sAgkUHupTnrd0QL9gHOyh_Pu3QkfobMT8UAXI'
    case 'mechanical':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfr1IEnzP9I_R7AYw1ZoSJFwilecU9mK14evWtAVbb7q5P1sUCfRIj-2sGgA3dI0RV-ySXqHm3XCa6TalR9CsULV9rrFXUubhFT5gna87dsw5aR-TdQt6SxHyC6VoqNMR_90w_vs6B3WopVKELN1uB2-IG5JMWWXQrDHOCCRuctUQyOJm9od2GD97WpdUbmehiZ_NW02SVpeANqvGKqaZ9evCzHqkgQD81XydS9KwIOiPsKeLM72fCVp2yud0I-urN6UVgd6FpRIA'
    case 'electrical':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBauobEMw54ql_bZaJj0KgmK7mJs-aO9AjoRYINScZMwFFr6F0yA2Qo1wKmtjNj_qS8nl4K9D-Fei3PiBGcvnSi8O5oTev8RhEQwvXX1SauNHOyKgpv6VkY6FmJqWAzXVfEZQ2UDjX3K-ZkdbqOX1saJMERN-9hUu3J2NCMVDvxWZn_IyARueGV5BhxIANHfL_fpvE2IYQ3E9B4F4dk-asu5d30CitNXLvqy8le-NAiKJTJxlCWAkAL-H_-oDTxsQ9dV9sV8s9r8dI'
    case 'electronics':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcs9K0RXUc57PWm4OrdiBJspBG3ooUoKxRVlnTC6KuTT5JkKbAakvw1sGaQYVnf4ftEJBEQciuK8Vvo0jk7gTHyWHti7ttpSZppg4Zar5u3btegypTgpv765AfApFsPzjszb_cyxjw-LJXLfrm1t0zylYcVJb0VhQFo7Sqdc7kOw_klMAZA1olnNsrgTj7xx3kIdnC_6jVIqogLepFOEJl8JdBvNBGZN86PPCPA2RpNWviyGnqZKa5SkBqQ9DEA7PxW86AjVX4Xz8'
    default:
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAt6FC6auwyLMuqg7cXhrqvD6RI39M6YcXNoYCdqqIQWu1lAuSV1aJDLAXp6c-9X2F_JZC81GTBH-qA6CeAI0lP9e6do4zNnF1cWojABjqCWyMYXDiRm6YwjjeAw8wJWE7EnJoLOqHRy4WBuCnJAA6HTKp9RZRJVrOlo-uEV_yp54Umh-TrotBZCi_ImShi_KUV6rfh-JYSAlZ7UkwubRrPDD3xicRIf6ViVrEuJB6M-Emn25GAHivtHa39Fe6gcDJG91Qfgsoxhg'
  }
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
  const [user, setUser] = useState<any>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)

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
      const { data } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true)
        .order('name')
      setBranches(data || [])
    } catch {
      setBranches([])
    }
  }

  async function fetchAllPrograms() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('training_programs')
        .select('*,branches(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
      setPrograms(data || [])
    } catch {
      setPrograms([])
    }
    setLoading(false)
  }

  const filteredPrograms = selectedBranch === 'all'
    ? programs
    : programs.filter(p => p.branches?.slug === selectedBranch)

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden">

      {/* Hero Section */}
      <section className="px-margin-mobile md:px-margin-desktop pt-16 pb-12 md:pt-24 md:pb-section-gap">
        <div className="max-w-container-max mx-auto text-center">
          <span className="text-secondary font-label-md tracking-widest uppercase mb-4 block">Industry-Led Excellence</span>
          <h1 className="font-display-lg text-display-lg mb-6 max-w-3xl mx-auto">Job-Oriented Training Programs</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Choose your branch and program type. Each program is designed by industry experts with placement assistance to bridge the gap between academia and professional precision.
          </p>
        </div>
      </section>

      {/* My Purchased Programs */}
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

      {/* Filters & Programs Section */}
      <section className="px-margin-mobile md:px-margin-desktop pb-section-gap">
        <div className="max-w-container-max mx-auto">

          {/* Filter Tabs */}
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

          {/* Programs Grid */}
          {loading ? (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-pulse mb-4 block">pending</span>
              Loading programs...
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-4 block">search_off</span>
              No programs available for this branch yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {filteredPrograms.map((program) => (
                <div key={program.id} className="program-card bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden flex flex-col">
                  <div className="relative h-56 w-full">
                    <div
                      className="bg-cover bg-center w-full h-full"
                      style={{ backgroundImage: `url('${getProgramImage(program.branches?.slug || '')}')` }}
                    />
                    {renderProgramBadge(program.program_type)}
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-surface-container-high text-on-surface font-label-md text-[10px] uppercase px-2 py-0.5 rounded">
                        {program.branches?.name}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md mb-2 line-clamp-2">{program.name}</h3>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
                        <span className="font-body-md text-sm">{program.duration_weeks} Weeks</span>
                      </div>
                      <div className="font-headline-md text-secondary text-lg">
                        {program.discount_price
                          ? <>₹{program.discount_price.toLocaleString()} <span className="text-on-surface-variant line-through text-sm font-normal">₹{program.price.toLocaleString()}</span></>
                          : <>₹{program.price.toLocaleString()}</>
                        }
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8 flex-grow">
                      {(program.features || []).slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-2 h-2 mt-2 bg-secondary rounded-sm shrink-0"></span>
                          <span className="text-on-surface-variant text-sm">{feature}</span>
                        </li>
                      ))}
                      {(program.features || []).length > 4 && (
                        <li className="text-sm text-secondary font-medium">
                          + {(program.features || []).length - 4} more features
                        </li>
                      )}
                    </ul>
                    <Link
                      href={`/programs/${program.slug}`}
                      className="w-full py-4 border-2 border-secondary text-secondary font-label-md rounded-lg hover:bg-secondary hover:text-on-primary transition-all text-center block mt-auto"
                    >
                      Enrol Now
                    </Link>
                  </div>
                </div>
              ))}

              {/* Custom Training Placeholder */}
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

      {/* Trust / Why Section */}
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
                  <div className="text-3xl font-bold text-surface-container-lowest">2000+</div>
                  <div className="text-sm opacity-60">Engineers Trained</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-surface-container-lowest">100%</div>
                  <div className="text-sm opacity-60">Job Assistance</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-surface-container-lowest">10+</div>
                  <div className="text-sm opacity-60">Industry Mentors</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
                <div
                  className="bg-cover bg-center w-full h-full"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBAt6FC6auwyLMuqg7cXhrqvD6RI39M6YcXNoYCdqqIQWu1lAuSV1aJDLAXp6c-9X2F_JZC81GTBH-qA6CeAI0lP9e6do4zNnF1cWojABjqCWyMYXDiRm6YwjjeAw8wJWE7EnJoLOqHRy4WBuCnJAA6HTKp9RZRJVrOlo-uEV_yp54Umh-TrotBZCi_ImShi_KUV6rfh-JYSAlZ7UkwubRrPDD3xicRIf6ViVrEuJB6M-Emn25GAHivtHa39Fe6gcDJG91Qfgsoxhg')" }}
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

      {/* CTA Section */}
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto bg-secondary rounded-[2rem] p-12 md:p-24 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-white mb-6">Ready to Start Your Career?</h2>
            <p className="font-body-lg text-body-lg text-white mb-10 max-w-2xl mx-auto">
              Join thousands of students who have transformed their careers with Skillplace Academy. The best time to start was yesterday. The next best time is now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link className="bg-white text-secondary px-10 py-4 rounded-xl font-bold text-label-md hover:bg-white/90 transition-all shadow-xl text-center" href="/courses">Browse Courses</Link>
              <Link className="border border-white text-white px-8 py-4 rounded-lg font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all" href="/contact">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
