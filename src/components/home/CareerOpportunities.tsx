'use client'

import { useState } from 'react'
import SectionReveal from './SectionReveal'

interface CareerDiscipline {
  name: string
  color: string
  roles: string[]
  skills: string[]
  demand: string
  growth: string
}

const disciplines: CareerDiscipline[] = [
  {
    name: 'Civil Engineering',
    color: 'border-amber-500',
    roles: ['Site Engineer', 'Quantity Surveyor', 'Billing Engineer', 'Planning Engineer', 'Estimation Engineer', 'Freelancer', 'Contractor'],
    skills: ['AutoCAD', 'Revit', 'Staad Pro', 'Quantity Estimation', 'BOQ', 'Site Management'],
    demand: 'High — Infrastructure boom across India',
    growth: '₹3.5L – ₹12L per year based on experience',
  },
  {
    name: 'Mechanical Engineering',
    color: 'border-blue-500',
    roles: ['Design Engineer', 'CAD Engineer', 'Production Engineer', 'Quality Engineer', 'Maintenance Engineer'],
    skills: ['SolidWorks', 'AutoCAD Mechanical', 'GD&T', 'Manufacturing Drawing', 'CNC Programming'],
    demand: 'Very High — Manufacturing & automation surge',
    growth: '₹3L – ₹15L per year with specialization',
  },
  {
    name: 'Electrical Engineering',
    color: 'border-emerald-500',
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
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low">
      <div className="max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-12">
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
                  ? `${d.color} bg-secondary text-white border-secondary shadow-lg`
                  : 'border-border-subtle bg-white text-on-surface hover:border-secondary/30'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-border-subtle shadow-lg overflow-hidden">
          <div className={`border-l-4 ${current.color} p-8 md:p-10`}>
            <div className="grid md:grid-cols-2 gap-10">
              {/* Left: Roles & Skills */}
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Job Roles</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {current.roles.map((role, idx) => (
                    <span key={idx} className="bg-surface-container px-4 py-2 rounded-full text-sm font-medium text-on-surface-variant">
                      {role}
                    </span>
                  ))}
                </div>

                <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {current.skills.map((skill, idx) => (
                    <span key={idx} className="bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Demand & Growth */}
              <div className="space-y-6">
                <div className="bg-surface-container-low rounded-xl p-6">
                  <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-2">Industry Demand</h4>
                  <p className="text-body-md text-on-surface-variant">{current.demand}</p>
                </div>
                <div className="bg-secondary/5 rounded-xl p-6 border border-secondary/10">
                  <h4 className="font-bold text-sm text-secondary uppercase tracking-wider mb-2">Career Growth</h4>
                  <p className="text-body-md text-on-surface-variant font-medium">{current.growth}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                  <h4 className="font-bold text-sm text-emerald-700 uppercase tracking-wider mb-2">Placement Support</h4>
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
