'use client'
import { useState, useEffect } from 'react'
import { Briefcase, TrendingUp, Building2, GraduationCap, ArrowRight, UserCheck, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import SectionReveal from '@/components/home/SectionReveal'
import Link from 'next/link'

const staticCompanies = ['TCS', 'Infosys', 'Wipro', 'L&T', 'Reliance', 'Tata Steel', 'Adani Group', 'Godrej', 'Autommensor', 'Dozert AI', 'Himanshu Construction', 'Tech Mahindra']

interface PlacementCompany {
  name: string
}

export default function PlacementsPage() {
  const [companies, setCompanies] = useState<string[]>(staticCompanies)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchCompanies() {
      const { data } = await supabase
        .from('companies')
        .select('name')
        .eq('is_active', true)

      if (data && data.length > 0) {
        setCompanies(data.map((c: PlacementCompany) => c.name))
      }
    }
    fetchCompanies()
  }, [])

  const filteredCompanies = companies.filter(company =>
    company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const steps = [
    {
      num: '01',
      title: 'Skill Mastery',
      desc: 'Master industry-relevant tools and technologies through hands-on practical training and live projects.',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      num: '02',
      title: 'Profile Building',
      desc: 'Work 1-on-1 with experts to craft a professional resume, optimize your LinkedIn, and build a strong portfolio.',
      icon: Briefcase,
      color: 'from-violet-500 to-purple-500',
    },
    {
      num: '03',
      title: 'Mock Preparation',
      desc: 'Conduct multiple rounds of mock technical and HR interviews with real industry mentors to build confidence.',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-500',
    },
    {
      num: '04',
      title: 'Exclusive Drives',
      desc: 'Gain direct access to off-campus and on-campus recruitment drives with our trusted hiring partners.',
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-500',
    },
  ]

  return (
    <div className="bg-surface min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-primary-container/10 via-surface to-secondary-container/10 border-b border-border-subtle/40">
        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 grid-pattern opacity-10" />

        <div className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <SectionReveal className="flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Placement Assistance
            </span>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary max-w-3xl mb-6 leading-tight">
              Bridge the Gap Between <br />
              <span className="gradient-text">Learning & Employment</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
              Our dedicated placement cell works tirelessly to connect our students with top-tier companies across India. We don&apos;t just train; we launch careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-primary text-white hover:bg-primary/90 px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                Register for Placements
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#partners"
                className="bg-white border border-border-subtle text-on-surface hover:bg-surface-container-low px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                View Hiring Partners
              </a>
            </div>
          </SectionReveal>
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24">
        {/* 2. Stats Section */}
        <SectionReveal className="mb-20 md:mb-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: '95%', label: 'Placement Rate', desc: 'Consistent track record of career transitions.' },
              { value: '2000+', label: 'Students Placed', desc: 'Empowered engineering graduates across India.' },
              { value: '200+', label: 'Hiring Partners', desc: 'Strong network of core and IT companies.' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-border-subtle text-center card-shadow hover:border-secondary/30 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-extrabold text-blue-600 block mb-2">{stat.value}</div>
                <div className="text-on-surface font-bold text-lg mb-1">{stat.label}</div>
                <div className="text-on-surface-variant text-sm">{stat.desc}</div>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* 3. The Placement Process (Roadmap) */}
        <SectionReveal className="mb-20 md:mb-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">Our Methodology</span>
            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
              Your Path to the Dream Job
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              A structured, step-by-step career transition program designed to make you industry-ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-border-subtle flex flex-col justify-between relative group hover:border-secondary/30 transition-all duration-300 card-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-3xl font-black text-slate-100 group-hover:text-secondary/10 transition-colors duration-300">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{step.title}</h3>
                    <p className="text-body-md text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionReveal>

        {/* 4. Core Features */}
        <SectionReveal className="mb-20 md:mb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-surface-container-low rounded-[2rem] p-8 md:p-16 border border-border-subtle/50">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">Support & Mentorship</span>
              <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-6 leading-tight">
                Dedicated Placement Assistance
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: 'Resume & Portfolio Building',
                    desc: 'Get your resume and portfolio reviewed and crafted by top HR specialists to stand out from the crowd.',
                  },
                  {
                    title: 'Rigorous Mock Interviews',
                    desc: 'Experience real-world interview scenarios with detailed feedback from experienced technical managers.',
                  },
                  {
                    title: 'Direct Referrals & Pipelines',
                    desc: 'Skip the generic application queues. We refer your profile directly to decision-makers in our partner network.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"wght" 700' }}>check</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface text-base mb-1">{item.title}</h4>
                      <p className="text-on-surface-variant text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-between text-white">
              <div className="absolute inset-0 grid-pattern opacity-10" />
              <div className="relative z-10">
                <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center mb-6">
                  <Briefcase className="h-5 w-5" />
                </div>
                <blockquote className="text-lg md:text-xl font-medium mb-6">
                  &quot;The mock interviews and resume reviews were game-changers for me. I felt incredibly prepared when I sat for my actual interviews.&quot;
                </blockquote>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">A</div>
                <div>
                  <div className="font-bold text-sm">Amit Sharma</div>
                  <div className="text-xs text-white/70">Placed at L&T Construction</div>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* 5. Hiring Partners Grid */}
        <section id="partners" className="scroll-mt-20">
          <SectionReveal className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">Hiring Network</span>
            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
              Where Our Graduates Work
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">
              Join the ranks of our alumni who are building successful careers in leading global brands.
            </p>
            {/* Search filter */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-on-surface-variant/60" />
              <input
                type="text"
                placeholder="Search hiring partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-white text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10 transition-all"
              />
            </div>
          </SectionReveal>

          <SectionReveal stagger>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredCompanies.map((company) => (
                <div key={company} className="bg-white p-6 rounded-2xl border border-border-subtle flex items-center justify-center text-center hover:shadow-md hover:border-secondary/30 transition-all duration-300 group">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
                      <Building2 className="h-4.5 w-4.5 text-slate-400 group-hover:text-secondary transition-colors" />
                    </div>
                    <span className="font-bold text-on-surface group-hover:text-secondary transition-colors">{company}</span>
                  </div>
                </div>
              ))}
              {filteredCompanies.length === 0 && (
                <div className="col-span-2 md:col-span-4 text-center py-8 text-on-surface-variant">
                  No hiring partners found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </SectionReveal>
        </section>
      </div>

      {/* 6. Bottom CTA Section */}
      <section className="bg-surface-container-low border-t border-border-subtle/50 py-16 md:py-20">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <SectionReveal className="max-w-2xl mx-auto">
            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4 leading-tight">
              Have Questions About Your <br />
              <span className="gradient-text">Career Path?</span>
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">
              Speak with our career advisors today and discover how we can help you achieve your professional aspirations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-primary text-white hover:bg-primary/90 px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                Schedule a Consultation
              </Link>
              <Link
                href="/courses"
                className="bg-white border border-border-subtle text-on-surface hover:bg-surface-container-low px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                Explore Courses
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  )
}
