'use client'

import { useRef, useState } from 'react'
import type { Testimonial } from '@/types'
import SectionReveal from './SectionReveal'

interface TestimonialSectionProps {
  testimonials: Testimonial[]
}

export default function TestimonialSection({ testimonials }: TestimonialSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const scrollLeft = el.scrollLeft
    const cardWidth = el.children[0]
      ? (el.children[0] as HTMLElement).offsetWidth + 24
      : 0
    if (cardWidth > 0) {
      setActiveIndex(Math.round(scrollLeft / cardWidth))
    }
  }

  const scrollTo = (index: number) => {
    if (!scrollRef.current) return
    const cardWidth = scrollRef.current.children[0]
      ? (scrollRef.current.children[0] as HTMLElement).offsetWidth + 24
      : 0
    scrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
    setActiveIndex(index)
  }

  const displayReview = (review: string) => {
    let clean = review.trim()
    if (clean.startsWith('\u201C') || clean.startsWith('"')) {
      clean = clean.slice(1)
    }
    if (clean.endsWith('\u201D') || clean.endsWith('"')) {
      clean = clean.slice(0, -1)
    }
    return `\u201C${clean}\u201D`
  }

  const gradients = [
    'from-blue-500 to-blue-600',
    'from-violet-500 to-violet-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-rose-500 to-rose-600',
  ]

  return (
    <section className="py-section-gap bg-surface text-on-surface overflow-hidden relative border-b border-border-subtle/40">
      <div className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center mb-16">
        <SectionReveal>
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
            Success Stories
          </span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Students Who Transformed{' '}
            <span className="gradient-text">Their Careers</span>
          </h2>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
            Real stories from real students who built successful engineering careers with SkillPlace Academy.
          </p>
        </SectionReveal>
      </div>

      <div className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              className="bg-white p-8 rounded-2xl border border-border-subtle hover:border-secondary/30 transition-all duration-300 flex flex-col justify-between card-shadow hover:-translate-y-1 group"
              key={t.id}
            >
              <div>
                {/* Star rating */}
                <div className="flex items-center gap-1 bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-full w-fit mb-6 shadow-sm">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < (t.rating || 5)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-amber-300/40 fill-none stroke-amber-500/40'
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-700 ml-1">{(t.rating || 5).toFixed(1)}</span>
                </div>

                {/* Quote */}
                <p className="font-body-lg text-body-lg mb-8 max-w-2xl text-on-surface-variant leading-relaxed">
                  {displayReview(t.review)}
                </p>
              </div>

              {/* Student info */}
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border-subtle">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center font-bold text-white text-lg shadow-md`}>
                  {t.student_name ? t.student_name[0] : 'S'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-on-surface">{t.student_name}</p>
                  <p className="text-caption uppercase text-secondary font-semibold">{t.course_name}</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-600">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Horizontal scroll carousel */}
        <div className="block md:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((t, idx) => (
              <div className="bg-white p-6 rounded-2xl border border-border-subtle hover:border-secondary/30 transition-all flex flex-col justify-between min-w-[85vw] snap-center snap-always card-shadow group" key={t.id}>
                <div>
                  <div className="flex items-center gap-1 bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-full w-fit mb-4 shadow-sm">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < (t.rating || 5)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-amber-300/40 fill-none stroke-amber-500/40'
                          }`}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-700 ml-1">{(t.rating || 5).toFixed(1)}</span>
                  </div>
                  <p className="font-body-lg text-body-lg mb-8 max-w-2xl text-on-surface-variant leading-relaxed">
                    {displayReview(t.review)}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border-subtle">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradients[idx % gradients.length]} flex items-center justify-center font-bold text-white shadow-md`}>
                    {t.student_name ? t.student_name[0] : 'S'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface text-sm">{t.student_name}</p>
                    <p className="text-caption uppercase text-secondary font-semibold">{t.course_name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'w-6 h-2 bg-secondary' : 'w-2 h-2 bg-secondary/30'
                }`}
              />
            ))}
          </div>

          {/* Mobile Swipe Cue */}
          <div className="flex items-center justify-center gap-1.5 mt-2 text-caption text-on-surface-variant font-semibold">
            <span className="material-symbols-outlined text-[16px] animate-pulse">swipe</span>
            <span>Swipe to see all reviews</span>
          </div>
        </div>
      </div>
    </section>
  )
}
