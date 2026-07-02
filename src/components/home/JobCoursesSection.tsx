'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

interface JobCoursesSectionProps {
  civilList: string[]
  mechanicalList: string[]
  electricalList: string[]
  // electronicsList: string[]
  softSkillsList: string[]
}

export default function JobCoursesSection({
  civilList,
  mechanicalList,
  electricalList,
  // electronicsList,
  softSkillsList
}: JobCoursesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const CARD_COUNT = 5

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
    <section className="py-section-gap bg-surface-container-low">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
            Curriculum
          </span>
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Job-Oriented Courses
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Industry-focused curriculum designed for immediate employment. Learn the specific software and practical skills companies are hiring for.
          </p>
        </div>

        {/* 1. DESKTOP VIEW: Bento Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Civil Bento */}
          <div className="md:col-span-8 bg-white p-8 rounded-2xl border border-border-subtle flex flex-col justify-between card-shadow hover:border-secondary/30 hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-md text-headline-md text-primary">Civil Engineering</h3>
                <span className="bg-surface-container-high px-4 py-1 rounded-full text-caption font-bold text-on-secondary-fixed-variant">{civilList.length} Courses</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {civilList.map((item, idx) => (
                  <div className="flex items-center gap-2 text-on-surface-variant font-semibold" key={idx}>
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>
            <Link className="inline-flex items-center gap-2 font-bold text-secondary self-start" href="/courses">
              Explore Civil Courses
              <span className="material-symbols-outlined">trending_flat</span>
            </Link>
          </div>

          {/* Mechanical Bento */}
          <div className="md:col-span-4 bg-primary-container text-white p-8 rounded-2xl flex flex-col justify-between shadow-lg">
            <div>
              <h3 className="font-headline-md text-headline-md mb-6">Mechanical</h3>
              <div className="space-y-4 mb-8">
                {mechanicalList.map((item, idx) => {
                  const icons = ['settings', 'model_training', 'precision_manufacturing', 'draw', 'settings', 'draw']
                  return (
                    <p className="text-white/70 flex items-center gap-2 font-semibold" key={idx}>
                      <span className="material-symbols-outlined text-secondary-fixed-dim">{icons[idx] || 'settings'}</span> {item}
                    </p>
                  )
                })}
              </div>
            </div>
            <Link className="text-secondary-fixed-dim font-bold flex items-center gap-2 group" href="/courses">
              Explore
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          {/* Electrical Bento */}
          <div className="md:col-span-4 bg-white p-8 rounded-2xl border border-border-subtle flex flex-col justify-between card-shadow hover:border-sky-300 hover:-translate-y-1 transition-all duration-300">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary mb-6">Electrical</h3>
              <ul className="space-y-3 mb-8">
                {electricalList.map((item, idx) => (
                  <li className="text-body-md text-on-surface-variant font-semibold" key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <Link className="text-secondary font-bold flex items-center gap-2" href="/courses">
              Explore <span className="material-symbols-outlined">open_in_new</span>
            </Link>
          </div>

          {/* Electronics Bento */}
          {/* <div className="md:col-span-5 bg-white p-8 rounded-2xl border border-border-subtle flex flex-col justify-between card-shadow hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary mb-6">Electronics &amp; Automation</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {electronicsList.map((item, idx) => (
                  <span className="bg-surface-container px-3 py-1 rounded text-caption text-on-surface-variant font-semibold border border-border-subtle" key={idx}>{item}</span>
                ))}
              </div>
            </div>
            <Link className="text-secondary font-bold flex items-center gap-2" href="/courses">
              Explore <span className="material-symbols-outlined">trending_flat</span>
            </Link>
          </div> */}

          {/* Soft Skills Bento */}
          <div className="md:col-span-3 bg-secondary text-white p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-headline-md text-headline-md mb-4">Soft Skills</h3>
              <p className="text-white/80 text-body-md mb-6">Complete career preparation included in all programs.</p>
            </div>
            <ul className="space-y-1 mb-8 opacity-90 text-caption font-semibold">
              {softSkillsList.map((item, idx) => (
                <li key={idx}>{'\u2022'} {item}</li>
              ))}
            </ul>
            <Link className="text-white font-bold underline decoration-2 underline-offset-4" href="/courses">Explore More</Link>
          </div>
        </div>

        {/* 2. MOBILE VIEW: Horizontal Scroll Carousel */}
        <div className="block md:hidden">
          {/* Scrollable card track */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {/* Civil Card */}
            <div className="snap-center shrink-0 w-[calc(100%-2rem)] bg-white p-6 rounded-2xl border border-border-subtle flex flex-col justify-between min-h-[320px] shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-headline-md font-bold text-primary">Civil Engineering</h4>
                  <span className="bg-secondary/10 px-3 py-1 rounded-full text-caption font-bold text-secondary">
                    {civilList.length} Courses
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {civilList.map((item, idx) => (
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm font-semibold" key={idx}>
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link className="w-full bg-secondary text-white py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors" href="/courses">
                Explore Civil Courses
                <span className="material-symbols-outlined text-[18px]">trending_flat</span>
              </Link>
            </div>

            {/* Mechanical Card */}
            <div className="snap-center shrink-0 w-[calc(100%-2rem)] bg-primary-container text-white p-6 rounded-2xl flex flex-col justify-between min-h-[320px] shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-headline-md font-bold text-white">Mechanical</h4>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-caption font-bold text-blue-200">
                    {mechanicalList.length} Courses
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  {mechanicalList.map((item, idx) => {
                    const icons = ['settings', 'model_training', 'precision_manufacturing', 'draw']
                    return (
                      <div className="text-white/80 flex items-center gap-2 text-sm font-semibold" key={idx}>
                        <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px]">{icons[idx] || 'settings'}</span>
                        <span>{item}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <Link className="w-full bg-white text-primary-container py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-white/90 transition-colors" href="/courses">
                Explore Mechanical
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            {/* Electrical Card */}
            <div className="snap-center shrink-0 w-[calc(100%-2rem)] bg-white p-6 rounded-2xl border border-border-subtle flex flex-col justify-between min-h-[320px] shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-headline-md font-bold text-primary">Electrical</h4>
                  <span className="bg-sky-500/10 px-3 py-1 rounded-full text-caption font-bold text-sky-600">
                    {electricalList.length} Courses
                  </span>
                </div>
                <ul className="space-y-3 mb-6">
                  {electricalList.map((item, idx) => (
                    <li className="text-sm text-on-surface-variant flex items-center gap-2 font-semibold" key={idx}>
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link className="w-full border border-sky-500 text-sky-600 py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-sky-500/5 transition-colors" href="/courses">
                Explore Electrical
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </Link>
            </div>

            {/* Electronics Card */}
            {/* <div className="snap-center shrink-0 w-[calc(100%-2rem)] bg-white p-6 rounded-2xl border border-border-subtle flex flex-col justify-between min-h-[320px] shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-headline-md font-bold text-primary">Electronics &amp; Automation</h4>
                  <span className="bg-emerald-500/10 px-3 py-1 rounded-full text-caption font-bold text-emerald-600">
                    {electronicsList.length} Courses
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {electronicsList.map((item, idx) => (
                    <span className="bg-surface-container px-2.5 py-1 rounded text-caption text-on-surface-variant font-semibold border border-border-subtle" key={idx}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <Link className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors" href="/courses">
                Explore Electronics
                <span className="material-symbols-outlined text-[18px]">trending_flat</span>
              </Link>
            </div> */}

            {/* Soft Skills Card */}
            <div className="snap-center shrink-0 w-[calc(100%-2rem)] bg-secondary text-white p-6 rounded-2xl flex flex-col justify-between min-h-[320px] shadow-md">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-headline-md font-bold text-white">Soft Skills</h4>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-caption font-bold text-white/80">
                    Included
                  </span>
                </div>
                <p className="text-white/80 text-sm mb-4">Complete career preparation included in all core engineering programs.</p>
                <ul className="space-y-2 mb-6 text-caption font-semibold">
                  {softSkillsList.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link className="w-full bg-white text-secondary py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-white/90 transition-all" href="/courses">
                Explore More
              </Link>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: CARD_COUNT }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Go to card ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-6 h-2 bg-secondary'
                    : 'w-2 h-2 bg-secondary/30'
                }`}
              />
            ))}
          </div>

          {/* Swipe hint */}
          <p className="text-center text-xs text-on-surface-variant/60 mt-2 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px]">swipe</span>
            Swipe to explore all categories
          </p>
        </div>



      </div>
    </section>
  )
}
