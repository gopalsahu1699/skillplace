'use client'
import { useState, useRef, useEffect } from 'react'
import SectionReveal from './SectionReveal'
import { SafeImg } from '@/components/ui/safe-image'
import { supabase } from '@/lib/supabase/client'

interface Partner {
  id: string
  name: string
  short: string
  description: string
  type: string
  logo: string | null
  color: string
}

function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <div className="mx-auto mb-4 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 border border-border-subtle rounded-2xl bg-white p-4 max-w-[140px] min-w-[80px] group-hover:scale-105">
      <SafeImg
        src={partner.logo || undefined}
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
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchPartners() {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (error) {
        console.error('Error fetching partners:', error)
      }
      if (data) {
        setPartners(data)
      }
      setLoading(false)
    }
    fetchPartners()
  }, [])

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
            <span className="gradient-text">SkillPlace {' '} </span>
           Sponsored by Leading Companies
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We collaborate with leading companies to ensure our curriculum stays current and our students get real industry exposure.
          </p>
        </SectionReveal>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          </div>
        ) : (
        <>

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
                <p className="text-body-md text-on-surface-variant mb-4">{partner.description}</p>
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
                <p className="text-body-md text-on-surface-variant mb-4">{partner.description}</p>
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

        </>
        )}

        <SectionReveal className="mt-10 text-center">
          <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Our partnerships mean guest lectures, live projects, internship opportunities, and direct placement connections for SkillPlace Academy students.
          </p>
        </SectionReveal>
      </div>
    </section>
  )
}
