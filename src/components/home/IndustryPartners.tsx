'use client'
import { useState, useRef } from 'react'
import SectionReveal from './SectionReveal'
import { getSupabaseImageUrl } from '@/lib/utils'
import { SafeImg } from '@/components/ui/safe-image'

const partners = [
  {
    name: 'Autommensor Automation Pvt Ltd',
    short: 'Autommensor',
    desc: 'Industrial automation & control systems',
    type: 'Training Partner',
    logo: getSupabaseImageUrl('partner-autommensor.png'),
    color: 'bg-blue-600',
  },
  {
    name: 'Dozert AI',
    short: 'Dozert',
    desc: 'AI-powered technology solutions',
    type: 'Technology Partner',
    logo: getSupabaseImageUrl('partner-dozert-ai.png'),
    color: 'bg-violet-600',
  },
  {
    name: 'Himanshu Construction',
    short: 'Himanshu',
    desc: 'Civil construction & infrastructure',
    type: 'Hiring Partner',
    logo: getSupabaseImageUrl('partner-himanshu-construction.png'),
    color: 'bg-amber-600',
  },
]

function PartnerLogo({ partner }: { partner: typeof partners[0] }) {
  return (
    <div className="mx-auto mb-4 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 border border-border-subtle rounded-2xl bg-white p-4 max-w-[140px] min-w-[80px] group-hover:scale-105 grayscale group-hover:grayscale-0">
      <SafeImg
        src={partner.logo}
        alt={`${partner.name} logo`}
        width={140}
        height={80}
        className="object-contain w-auto h-auto max-w-[120px] max-h-[60px]"
        fallback={
          <div className={`w-16 h-16 rounded-2xl ${partner.color} flex items-center justify-center`}>
            <span className="text-white font-bold text-xl">{partner.short[0]}</span>
          </div>
        }
      />
    </div>
  )
}

export default function IndustryPartners() {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const index = Math.round(el.scrollLeft / el.offsetWidth)
    setActiveIndex(index)
  }

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ left: index * scrollRef.current.offsetWidth, behavior: 'smooth' })
    setActiveIndex(index)
  }

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low overflow-hidden">
      <div className="max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
            Trusted Partners
          </span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Companies That Trust{' '}
            <span className="gradient-text">SkillPlace</span>
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We collaborate with leading companies to ensure our curriculum stays current and our students get real industry exposure.
          </p>
        </SectionReveal>

        {/* DESKTOP: 3-column grid */}
        <SectionReveal stagger>
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
            {partners.map((partner, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-border-subtle p-8 text-center card-shadow hover:border-secondary/30 transition-all duration-300 group hover:-translate-y-1"
              >
                <PartnerLogo partner={partner} />
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{partner.name}</h3>
                <p className="text-body-md text-on-surface-variant mb-4">{partner.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-caption font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>handshake</span>
                  {partner.type}
                </span>
              </div>
            ))}
          </div>
        </SectionReveal>

        {/* MOBILE: Horizontal scroll carousel */}
        <div className="block md:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {partners.map((partner, idx) => (
              <div
                key={idx}
                className="snap-center shrink-0 w-[calc(100%-2rem)] bg-white rounded-2xl border border-border-subtle p-8 text-center card-shadow"
              >
                <PartnerLogo partner={partner} />
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{partner.name}</h3>
                <p className="text-body-md text-on-surface-variant mb-4">{partner.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-caption font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>handshake</span>
                  {partner.type}
                </span>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {partners.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to partner ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-6 h-2 bg-secondary' : 'w-2 h-2 bg-secondary/30'
                }`}
              />
            ))}
          </div>

          {/* Swipe hint */}
          <p className="text-center text-xs text-on-surface-variant/60 mt-2 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">swipe</span>
            Swipe to see all partners
          </p>
        </div>

        <SectionReveal className="mt-10 text-center">
          <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Our partnerships mean guest lectures, live projects, internship opportunities, and direct placement connections for SkillPlace Academy students.
          </p>
        </SectionReveal>
      </div>
    </section>
  )
}
