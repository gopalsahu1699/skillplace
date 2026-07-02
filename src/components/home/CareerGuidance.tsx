'use client'

import Link from 'next/link'
import SectionReveal from './SectionReveal'

const services = [
  {
    icon: 'psychology',
    title: 'Career Planning',
    desc: 'Personalized roadmap based on your skills, interests, and market demand.',
    color: { from: '#3b82f6', to: '#2563eb' },
  },
  {
    icon: 'description',
    title: 'Resume Building',
    desc: 'Build a resume that gets shortlisted — not ignored.',
    color: { from: '#6366f1', to: '#4f46e5' },
  },
  {
    icon: 'work',
    title: 'LinkedIn Optimization',
    desc: 'Attract recruiters organically with a profile that stands out.',
    color: { from: '#8b5cf6', to: '#7c3aed' },
  },
  {
    icon: 'deployed_code',
    title: 'Portfolio Development',
    desc: 'Graduate with a portfolio that proves your skills to employers.',
    color: { from: '#a855f7', to: '#9333ea' },
  },
  {
    icon: 'record_voice_over',
    title: 'Interview Preparation',
    desc: 'Practice before facing real recruiters. Mock interviews & feedback.',
    color: { from: '#ec4899', to: '#db2777' },
  },
  {
    icon: 'rocket_launch',
    title: 'Startup & Freelancing',
    desc: 'Build your own client base or launch a venture with mentor guidance.',
    color: { from: '#f59e0b', to: '#d97706' },
  },
]

const outcomes = [
  { value: '87%', label: 'Placement Rate', sublabel: 'within 6 months', icon: 'trending_up' },
  { value: '2,400+', label: 'Students Placed', sublabel: 'across 50+ companies', icon: 'groups' },
  { value: '4.8\u2605', label: 'Mentor Rating', sublabel: 'from 1,200+ reviews', icon: 'star' },
  { value: '\u20b94.2L', label: 'Avg Starting CTC', sublabel: 'for fresh graduates', icon: 'payments' },
]

export default function CareerGuidance() {
  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop overflow-hidden bg-surface">
      {/* Background accents */}
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-violet-500/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative max-w-container-max mx-auto">
        {/* Header */}
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4 font-label-md">
            Career Support
          </span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4 leading-tight">
            We Don&apos;t Just Train.{' '}
            <span className="gradient-text">We Launch Careers.</span>
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            SkillPlace Academy is the bridge between where you are and where you deserve to be. 
            Every service is designed to get you hired — not just certified.
          </p>
        </SectionReveal>

        {/* Service Cards — 2x3 Grid */}
        <SectionReveal stagger>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="group relative p-6 rounded-2xl border border-border-subtle bg-white hover:border-secondary/25 hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${service.color.from}08, ${service.color.to}05)`,
                  }}
                />
                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${service.color.from}, ${service.color.to})`,
                    }}
                  >
                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                      {service.icon}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{service.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* Outcomes */}
        {/* <SectionReveal>
          <div className="relative rounded-2xl overflow-hidden border border-border-subtle/50 mb-16">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.04] via-white/80 to-violet-500/[0.04] backdrop-blur-sm" />
            <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

            <div className="relative z-10 p-8 md:p-12">
              <div className="text-center mb-10">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                  The Results Speak for Themselves
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Our career guidance system delivers measurable outcomes — not empty promises.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {outcomes.map((o, idx) => (
                  <div key={idx} className="text-center group">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 mb-3 group-hover:bg-secondary/15 transition-colors">
                      <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                        {o.icon}
                      </span>
                    </div>
                    <div className="font-display-lg text-headline-lg-mobile md:text-headline-lg gradient-text mb-1">
                      {o.value}
                    </div>
                    <div className="text-sm font-semibold text-on-surface mb-0.5">{o.label}</div>
                    <div className="text-xs text-on-surface-variant">{o.sublabel}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionReveal> */}

        {/* CTA */}
        <SectionReveal className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="shimmer-btn bg-gradient-to-r from-blue-600 to-blue-500 text-white px-10 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5 duration-300"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                rocket_launch
              </span>
              Start Your Career Journey
            </Link>
            <Link
              href="/contact"
              className="bg-white border border-border-subtle text-on-surface px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-surface-container-low hover:border-secondary/25 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                calendar_month
              </span>
              Book Free Consultation
            </Link>
          </div>
          <p className="mt-4 text-sm text-on-surface-variant">
            No commitment required. Talk to a career advisor — it&apos;s free.
          </p>
        </SectionReveal>
      </div>
    </section>
  )
}
