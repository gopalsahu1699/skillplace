'use client'

import { useEffect, useRef } from 'react'
import SectionReveal from './SectionReveal'

const journeySteps = [
  {
    icon: 'visibility',
    label: 'Discover SkillPlace',
    desc: 'Land on our platform and explore career-aligned programs designed to take you from zero to job-ready.',
    tag: 'Step 1',
  },
  {
    icon: 'app_registration',
    label: 'Enroll in a Program',
    desc: 'Pick your ideal tech track — Web Dev, Data Science, DevOps, and more — and join a cohort of driven learners.',
    tag: 'Step 2',
  },
  {
    icon: 'school',
    label: 'Master Core Skills',
    desc: 'Learn industry-relevant tools and frameworks through structured lessons delivered by expert mentors.',
    tag: 'Step 3',
  },
  {
    icon: 'fitness_center',
    label: 'Hands-On Practice',
    desc: 'Reinforce every concept with real exercises, coding challenges, and guided labs — no passive learning.',
    tag: 'Step 4',
  },
  {
    icon: 'build_circle',
    label: 'Build Real Projects',
    desc: 'Apply your skills to build production-grade projects that solve actual business problems.',
    tag: 'Step 5',
  },
  {
    icon: 'badge',
    label: 'Build Your Portfolio',
    desc: 'Compile your work into a professional portfolio that demonstrates your capabilities to recruiters.',
    tag: 'Step 6',
  },
  {
    icon: 'co_present',
    label: 'Interview Preparation',
    desc: 'Sharpen your edge with mock interviews, resume workshops, and 1-on-1 mentor feedback sessions.',
    tag: 'Step 7',
  },
  {
    icon: 'work',
    label: 'Land Your Dream Job',
    desc: 'Get introduced to our hiring partners and step confidently into your first (or next) engineering role.',
    tag: 'Step 8',
  },
  {
    icon: 'monitoring',
    label: 'Grow Your Career',
    desc: "Join our alumni network and keep leveling up — your journey doesn't end at the first job offer.",
    tag: 'Step 9',
  },
]

const stepColors = [
  { from: '#3b82f6', to: '#2563eb', glow: '#3b82f620' },
  { from: '#4f46e5', to: '#4338ca', glow: '#4f46e520' },
  { from: '#7c3aed', to: '#6d28d9', glow: '#7c3aed20' },
  { from: '#9333ea', to: '#7e22ce', glow: '#9333ea20' },
  { from: '#a855f7', to: '#9333ea', glow: '#a855f720' },
  { from: '#d946ef', to: '#c026d3', glow: '#d946ef20' },
  { from: '#ec4899', to: '#db2777', glow: '#ec489920' },
  { from: '#f43f5e', to: '#e11d48', glow: '#f43f5e20' },
  { from: '#10b981', to: '#059669', glow: '#10b98120' },
]

function StepCard({
  step,
  idx,
  isLast,
}: {
  step: (typeof journeySteps)[0]
  idx: number
  isLast: boolean
}) {
  const color = stepColors[idx]

  return (
    <SectionReveal direction="up">
      <div className="flex gap-5 md:gap-7 group">
        {/* Left column: icon + connector */}
        <div className="flex flex-col items-center flex-shrink-0">
          {/* Icon circle */}
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white shadow-lg relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
              boxShadow: `0 4px 20px ${color.glow}`,
            }}
          >
            <span
              className="material-symbols-outlined text-[22px] md:text-[24px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              {step.icon}
            </span>
          </div>

          {/* Vertical connector line */}
          {!isLast && (
            <div
              className="w-0.5 flex-1 min-h-[40px] mt-2 rounded-full"
              style={{
                background: `linear-gradient(to bottom, ${color.from}60, ${stepColors[idx + 1]?.from ?? color.to}40)`,
              }}
            />
          )}
        </div>

        {/* Right column: card */}
        <div
          className="flex-1 pb-8 md:pb-10"
          style={{ paddingBottom: isLast ? 0 : undefined }}
        >
          <div
            className="bg-white rounded-2xl border border-border-subtle p-5 md:p-6 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5"
            style={{
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            {/* Tag + step number */}
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  background: `${color.from}15`,
                  color: color.from,
                }}
              >
                {step.tag}
              </span>
            </div>

            <h4 className="font-bold text-base md:text-lg text-on-surface leading-snug mb-1.5">
              {step.label}
            </h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {step.desc}
            </p>
          </div>
        </div>
      </div>
    </SectionReveal>
  )
}

export default function StudentJourney() {
  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-container-max mx-auto">
        {/* Section header */}
        <SectionReveal className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
            Your career Path
          </span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
          Build Skills. Build Career.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            From your first lesson to career growth — see how SkillPlace Academy transforms learners into professionals.
          </p>
        </SectionReveal>

        {/* Journey steps — two column on lg+, single column on mobile/md */}
        <div className="grid lg:grid-cols-2 gap-x-12 xl:gap-x-20 max-w-5xl mx-auto">
          {/* Left column: steps 1-5 */}
          <div>
            {journeySteps.slice(0, 5).map((step, idx) => (
              <StepCard
                key={idx}
                step={step}
                idx={idx}
                isLast={idx === 4}
              />
            ))}
          </div>

          {/* Right column: steps 6-9 */}
          <div className="lg:mt-8">
            {journeySteps.slice(5).map((step, idx) => (
              <StepCard
                key={idx + 5}
                step={step}
                idx={idx + 5}
                isLast={idx === journeySteps.slice(5).length - 1}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <SectionReveal className="mt-14 text-center">
          <a
            href="/programs"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #0058be, #2170e4)',
              boxShadow: '0 4px 20px #0058be30',
            }}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
              rocket_launch
            </span>
            Start Your Journey Today
          </a>
        </SectionReveal>
      </div>
    </section>
  )
}
