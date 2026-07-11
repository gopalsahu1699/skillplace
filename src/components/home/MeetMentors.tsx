'use client'
import { useState, useRef, useEffect } from 'react'
import SectionReveal from './SectionReveal'
import { SafeImg } from '@/components/ui/safe-image'
import { supabase } from '@/lib/supabase/client'
import { isNetworkError, withRetry } from '@/lib/network'
import { useOnlineStatus } from '@/context/OnlineStatusContext'
import { WifiOff, RefreshCw } from 'lucide-react'

interface Mentor {
  id: string
  name: string
  position: string
  company: string
  expertise: string
  experience: string
  bio: string
  initials: string
  gradient: string
  image: string | null
  linkedin_url: string | null
}

function MentorPhoto({ mentor, size = 'large' }: { mentor: Mentor; size?: 'large' | 'small' }) {
  const sizeClass = size === 'large' ? 'w-28 h-28' : 'w-20 h-20'
  
  if (!mentor.image) {
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br ${mentor.gradient} flex items-center justify-center text-white font-bold mb-6 shadow-xl group-hover:scale-105 transition-transform duration-300 ${size === 'large' ? 'text-3xl' : 'text-2xl'}`}>
        {mentor.initials}
      </div>
    )
  }

  return (
    <div className={`${sizeClass} rounded-full bg-white mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300 border-4 border-white overflow-hidden relative ring-4 ring-secondary/10`}>
      <SafeImg
        src={mentor.image}
        alt={`${mentor.name} photo`}
        className="w-full h-full object-cover"
        fallback={
          <div className={`${sizeClass} rounded-full bg-gradient-to-br ${mentor.gradient} flex items-center justify-center text-white font-bold ${size === 'large' ? 'text-3xl' : 'text-2xl'}`}>
            {mentor.initials}
          </div>
        }
      />
    </div>
  )
}

export default function MeetMentors() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [networkError, setNetworkError] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { isOnline } = useOnlineStatus()

  const fetchMentors = async () => {
    setLoading(true)
    setNetworkError(false)

    const { data: response, error } = await withRetry(() =>
      supabase
        .from('mentors')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
    )

    if (error) {
      if (isNetworkError(error)) {
        setNetworkError(true)
      } else {
        console.error('Error fetching mentors:', error)
      }
      setLoading(false)
      return
    }

    const data = response?.data as Mentor[] | undefined
    if (data && data.length > 0) {
      setMentors(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMentors()
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
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
      
      <div className="max-w-container-max mx-auto relative">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
            Expert Mentors
          </span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Mentorship From{' '}
            <span className="gradient-text">Industry Leaders</span>
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Our mentors bring decades of real-world experience to every session. 
            They don&apos;t just teach — they shape careers.
          </p>
        </SectionReveal>

        {networkError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <WifiOff className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Unable to load mentors</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">
              {isOnline ? 'Something went wrong. Please try again.' : 'You appear to be offline. Connect to the internet and retry.'}
            </p>
            <button
              onClick={fetchMentors}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold hover:bg-secondary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin" />
          </div>
        ) : (
        <>
        {/* DESKTOP: 2-column premium grid */}
        <SectionReveal stagger>
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {mentors.map((mentor, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-2xl border border-border-subtle overflow-hidden group hover:border-secondary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Gradient accent top */}
                {/* <div className={`h-2 bg-gradient-to-r ${mentor.gradient}`} /> */}
                
                <div className="p-8 flex flex-col items-center text-center">
                  <MentorPhoto mentor={mentor} />
                  
                  <h3 className="font-headline-md text-headline-md text-on-surface">{mentor.name}</h3>
                  <p className="text-secondary font-bold text-sm mt-1">{mentor.position}</p>
                  <p className="text-on-surface-variant text-sm">{mentor.company}</p>
                  
                  {/* Experience badge */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 rounded-full text-caption font-bold text-secondary">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: '"FILL" 1' }}>schedule</span>
                      {mentor.experience}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 rounded-full text-caption font-bold text-violet-700">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                      {mentor.expertise}
                    </span>
                  </div>
                  
                  <p className="text-body-md text-on-surface-variant mt-4 leading-relaxed">{mentor.bio}</p>
                  
                  {/* <a
                    href={mentor.linkedin_url || '#'}
                    target={mentor.linkedin_url ? '_blank' : undefined}
                    rel={mentor.linkedin_url ? 'noopener noreferrer' : undefined}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-on-surface hover:border-secondary/30 hover:text-secondary hover:bg-secondary/5 transition-all duration-300"
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>person</span>
                    View LinkedIn
                  </a> */}
                </div>
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
            {mentors.map((mentor, idx) => (
              <div
                key={idx}
                className="snap-center shrink-0 w-[calc(100%-2rem)] bg-white rounded-2xl border border-border-subtle overflow-hidden card-shadow"
              >
                <div className={`h-1.5 bg-gradient-to-r ${mentor.gradient}`} />
                <div className="p-6 flex flex-col items-center text-center">
                  <MentorPhoto mentor={mentor} size="small" />
                  <h3 className="font-headline-md text-headline-md text-on-surface">{mentor.name}</h3>
                  <p className="text-secondary font-bold text-sm mt-1">{mentor.position}</p>
                  <p className="text-on-surface-variant text-sm">{mentor.company}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 rounded-full text-caption font-bold text-secondary">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: '"FILL" 1' }}>schedule</span>
                      {mentor.experience}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 rounded-full text-caption font-bold text-violet-700">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                      {mentor.expertise}
                    </span>
                  </div>
                  <p className="text-body-md text-on-surface-variant mt-4">{mentor.bio}</p>
                  {/* <a
                    href={mentor.linkedin_url || '#'}
                    target={mentor.linkedin_url ? '_blank' : undefined}
                    rel={mentor.linkedin_url ? 'noopener noreferrer' : undefined}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-on-surface hover:border-secondary/30 hover:text-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    View LinkedIn
                  </a> */}
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {mentors.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to mentor ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-6 h-2 bg-secondary' : 'w-2 h-2 bg-secondary/30'
                }`}
              />
            ))}
          </div>

          {/* Swipe hint */}
          <p className="text-center text-xs text-on-surface-variant/60 mt-2 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">swipe</span>
            Swipe to meet all mentors
          </p>
        </div>
        </>
        )}

      </div>
    </section>
  )
}
