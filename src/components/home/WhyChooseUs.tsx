'use client'

import Link from 'next/link'
import SectionReveal from './SectionReveal'
import { useAuth } from '@/hooks/useAuth'

const comparisonTraditional = [
  'Theory-only classroom lectures',
  'Outdated tools & methods',
  'No real projects or portfolio',
  'No career guidance at all',
  'No placement support',
  'No interview preparation',
  'Large batch, zero personal attention',
  'Certificate without real skills',
]

const comparisonSkillPlace = [
  '70% practical, 30% theory',
  'Industry-standard software & tools',
  'Live client projects during training',
  '1-on-1 career mentorship',
  'Dedicated placement assistance',
  'Mock interviews & resume coaching',
  'Small batches, personal mentorship',
  'Portfolio that proves your skills',
]

export default function WhyChooseUs() {
  const { user } = useAuth()

  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-violet-500/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative max-w-container-max mx-auto">
        {/* Header */}
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4 font-label-md">
            The SkillPlace Advantage
          </span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4 leading-tight">
            Why Settle for Less?{' '}
            <span className="gradient-text">Choose Smarter.</span>
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Most institutes hand you a certificate and wish you luck. We engineer your career from day one.
          </p>
        </SectionReveal>

        {/* Comparison Block */}
        <SectionReveal>
          <div className="relative rounded-2xl overflow-hidden border border-border-subtle/50 mb-16">
            {/* Glass background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-surface-container-low/50 to-white/80 backdrop-blur-sm" />
            <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

            <div className="relative z-10 p-6 md:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                  The Difference Is Clear
                </h3>
                <p className="text-sm text-on-surface-variant">
                  See what you get with SkillPlace vs. a traditional institute.
                </p>
              </div>

              {/* Comparison grid */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-0">
                {/* Traditional */}
                <div className="relative p-6 md:p-8 rounded-2xl md:rounded-r-none bg-red-50/60 border border-red-100/80">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px] text-red-500" style={{ fontVariationSettings: '"FILL" 1' }}>
                        school
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">Traditional Institute</h4>
                      <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">The old way</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {comparisonTraditional.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface-variant/80">
                        <span className="material-symbols-outlined text-[16px] text-red-400 mt-0.5 shrink-0" style={{ fontVariationSettings: '"FILL" 1' }}>
                          close
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* VS divider (mobile) / vertical divider (desktop) */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-secondary/20">
                    VS
                  </div>
                </div>
                <div className="flex md:hidden items-center justify-center py-2">
                  <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-secondary to-accent text-white text-xs font-bold shadow-md">
                    VS
                  </div>
                </div>

                {/* SkillPlace */}
                <div className="relative p-6 md:p-8 rounded-2xl md:rounded-l-none bg-gradient-to-br from-secondary/[0.04] to-accent/[0.04] border border-secondary/10">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px] text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>
                        star
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-surface">SkillPlace Academy</h4>
                      <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">The new way</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {comparisonSkillPlace.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface">
                        <span className="material-symbols-outlined text-[16px] text-emerald-500 mt-0.5 shrink-0" style={{ fontVariationSettings: '"FILL" 1' }}>
                          check_circle
                        </span>
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Key Advantages — Horizontal Cards */}
        <SectionReveal stagger>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: 'construction',
                title: 'Learn Like an Engineer',
                desc: 'Real labs, real equipment, real projects. Not a classroom — a launchpad.',
                color: { from: '#3b82f6', to: '#2563eb' },
              },
              {
                icon: 'rocket_launch',
                title: 'Build Real Experience',
                desc: 'Live client projects, team collaboration, portfolio creation. Skills that stick.',
                color: { from: '#8b5cf6', to: '#7c3aed' },
              },
              {
                icon: 'work',
                title: 'Launch Your Career',
                desc: 'Resume building, interview coaching, placement guidance. From learning to earning.',
                color: { from: '#10b981', to: '#059669' },
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative p-6 rounded-2xl border border-border-subtle bg-white hover:border-secondary/25 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${item.color.from}08, ${item.color.to}05)`,
                  }}
                />
                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${item.color.from}, ${item.color.to})`,
                    }}
                  >
                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                      {item.icon}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* CTA */}
        <SectionReveal className="text-center">
          <div className="relative rounded-2xl overflow-hidden border border-border-subtle/50">
            {/* Glass background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] via-white/80 to-violet-500/[0.04] backdrop-blur-sm" />
            <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

            <div className="relative z-10 p-8 md:p-14">
              <h3 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-3">
                Ready to Build a Career{' '}
                <span className="gradient-text">You Can Be Proud Of?</span>
              </h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto">
                Join SkillPlace Academy and learn the skills companies actually hire for.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={user ? '/programs' : '/register'}
                  className="shimmer-btn bg-gradient-to-r from-blue-600 to-blue-500 text-white px-10 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5 duration-300"
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    rocket_launch
                  </span>
                Start Learning Today
                </Link>
                <Link
                  href="/contact"
                  className="bg-white border border-border-subtle text-on-surface px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-surface-container-low hover:border-secondary/25 transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    support_agent
                  </span>
                  Talk to a Career Mentor
                </Link>
              </div>

              <p className="mt-4 text-sm text-on-surface-variant">
                No commitment required. Get a free career consultation — even if you don&apos;t enroll.
              </p>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
