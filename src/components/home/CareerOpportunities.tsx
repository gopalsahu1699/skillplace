'use client'

import { useState, useEffect } from 'react'
import SectionReveal from './SectionReveal'
import { supabase } from '@/lib/supabase/client'
import type { CareerDiscipline } from '@/types'

export default function CareerOpportunities() {
  const [disciplines, setDisciplines] = useState<CareerDiscipline[]>([])
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase
          .from('career_disciplines')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
        if (data) {
          setDisciplines(data as CareerDiscipline[])
        }
      } catch {
        setDisciplines([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="relative max-w-container-max mx-auto text-center py-20">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-24 bg-slate-200 rounded-full mx-auto" />
            <div className="h-8 w-96 bg-slate-200 rounded-lg mx-auto" />
            <div className="h-4 w-64 bg-slate-200 rounded-lg mx-auto" />
          </div>
        </div>
      </section>
    )
  }

  if (disciplines.length === 0) return null

  const current = disciplines[active]

  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">Careers</span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Career Opportunities That Pay{' '}
            <span className="gradient-text">Well</span>
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Your skills open doors to real career paths. Here&apos;s what&apos;s waiting for you after graduation.
          </p>
        </SectionReveal>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {disciplines.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => setActive(idx)}
              className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 border-2 ${
                active === idx
                  ? `bg-gradient-to-r ${d.gradient_from} ${d.gradient_to} text-white border-transparent shadow-lg`
                  : 'border-border-subtle bg-white text-on-surface hover:border-secondary/30 hover:shadow-md'
              }`}
            >
              {d.name}
              {d.popular && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  HOT
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden">
          <div className={`bg-gradient-to-r ${current.gradient_from} ${current.gradient_to} p-6 md:p-8`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{current.name}</h3>
                <p className="text-white/80 text-sm">{current.demand}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Salary Range</p>
                  <p className="text-white font-bold text-sm">{current.salary}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Growth</p>
                  <p className="text-white font-bold text-sm">{current.growth}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Left: Roles & Skills */}
              <div>
                <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>work</span>
                  Job Roles
                </h4>
                <div className="flex flex-wrap gap-2 mb-8">
                  {current.roles.map((role, idx) => (
                    <span key={idx} className="bg-surface-container px-4 py-2 rounded-full text-sm font-medium text-on-surface-variant border border-border-subtle">
                      {role}
                    </span>
                  ))}
                </div>

                <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>build</span>
                  Required Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {current.skills.map((skill, idx) => (
                    <span key={idx} className="bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium border border-secondary/10">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Salary & Demand */}
              <div className="space-y-5">
                <div className="bg-surface-container-low rounded-xl p-6 border border-border-subtle">
                  <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500" style={{ fontVariationSettings: '"FILL" 1' }}>trending_up</span>
                    Industry Demand
                  </h4>
                  <p className="text-body-md text-on-surface-variant">{current.demand}</p>
                </div>
                <div className="bg-gradient-to-br from-secondary/5 to-blue-500/5 rounded-xl p-6 border border-secondary/10">
                  <h4 className="font-bold text-sm text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>payments</span>
                    Expected Salary
                  </h4>
                  <p className="text-headline-md font-bold text-on-surface">{current.salary}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Based on experience &amp; location</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                  <h4 className="font-bold text-sm text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: '"FILL" 1' }}>handshake</span>
                    Placement Support
                  </h4>
                  <p className="text-body-md text-emerald-800">100% placement assistance with direct recruiter connections.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
