'use client'

import { useState } from 'react'
import SectionReveal from './SectionReveal'

interface CareerDiscipline {
  name: string
  slug: string
  color: string
  gradientFrom: string
  gradientTo: string
  roles: string[]
  skills: string[]
  demand: string
  growth: string
}

const disciplines: CareerDiscipline[] = [
  {
    name: 'Civil Engineering',
    slug: 'civil',
   color: 'border-blue-500',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-600',
    roles: ['Site Engineer', 'Quantity Surveyor', 'Billing Engineer', 'Planning Engineer', 'Estimation Engineer', 'Freelancer', 'Contractor'],
    skills: ['AutoCAD', 'Revit', 'Staad Pro', 'Quantity Estimation', 'BOQ', 'Site Management'],
    demand: 'High — Infrastructure boom across India',
    growth: '₹3.5L – ₹12L per year based on experience',
  },
  {
    name: 'Mechanical Engineering',
    slug: 'mechanical',
    color: 'border-blue-500',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-600',
    roles: ['Design Engineer', 'CAD Engineer', 'Production Engineer', 'Quality Engineer', 'Maintenance Engineer'],
    skills: ['SolidWorks', 'AutoCAD Mechanical', 'GD&T', 'Manufacturing Drawing', 'CNC Programming'],
    demand: 'Very High — Manufacturing & automation surge',
    growth: '₹3L – ₹15L per year with specialization',
  },
  {
    name: 'Electrical Engineering',
    slug: 'electrical',
    color: 'border-blue-500',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-600',
    roles: ['Electrical Design Engineer', 'Automation Engineer', 'Solar Engineer', 'Site Engineer', 'Maintenance Engineer'],
    skills: ['LT/HT Systems', 'Panel Design', 'PLC', 'SCADA', 'Solar Design', 'VFD'],
    demand: 'Very High — Energy sector & automation growth',
    growth: '₹3L – ₹14L per year with certifications',
  },
]

export default function CareerOpportunities() {
  const [active, setActive] = useState(0)
  const current = disciplines[active]

  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">Careers</span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Career Opportunities
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Your skills open doors to real career paths. Here's what's waiting for you after graduation.
          </p>
        </SectionReveal>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {disciplines.map((d, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 border-2 ${
                active === idx
                  ? `bg-gradient-to-r ${d.gradientFrom} ${d.gradientTo} text-white border-transparent shadow-lg`
                  : 'border-border-subtle bg-white text-on-surface hover:border-secondary/30 hover:shadow-md'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden">
          <div className={`bg-gradient-to-r ${current.gradientFrom} ${current.gradientTo} p-6 md:p-8`}>
            <h3 className="text-2xl font-bold text-white mb-2">{current.name}</h3>
            <p className="text-white/80 text-sm">{current.demand}</p>
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

              {/* Right: Demand & Growth */}
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
                    Salary Range
                  </h4>
                  <p className="text-body-md text-on-surface-variant font-semibold">{current.growth}</p>
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
