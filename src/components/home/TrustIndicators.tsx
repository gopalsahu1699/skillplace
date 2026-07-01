'use client'

import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 2000, suffix: '+', label: 'Students Trained', icon: 'groups', color: 'from-blue-500 to-blue-600' },
  { value: 87, suffix: '%', label: 'Placement Rate', icon: 'trending_up', color: 'from-emerald-500 to-emerald-600' },
  { value: 4.9, suffix: '', label: 'Mentor Rating', icon: 'star', color: 'from-amber-500 to-amber-600', decimals: 1 },
  { value: 100, suffix: '%', label: 'Placement Support', icon: 'verified', color: 'from-violet-500 to-violet-600' },
  { value: 50, suffix: '+', label: 'Hiring Partners', icon: 'handshake', color: 'from-rose-500 to-rose-600' },
  { value: 4, suffix: 'L+', label: 'Avg Starting CTC', icon: 'payments', color: 'from-cyan-500 to-cyan-600' },
]

function AnimatedCounter({ value, suffix, decimals = 0 }: { value: number; suffix: string; decimals?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            const duration = 1500
            const startTime = Date.now()

            function animate() {
              const elapsed = Date.now() - startTime
              const progress = Math.min(elapsed / duration, 1)
              const eased = 1 - Math.pow(1 - progress, 3)
              setCount(eased * value)
              if (progress < 1) requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
    </span>
  )
}

export default function TrustIndicators() {
  return (
    <section className="relative py-8 px-margin-mobile md:px-margin-desktop bg-surface border-b border-border-subtle overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="relative max-w-container-max mx-auto">
        {/* Desktop: Horizontal stat bar */}
        <div className="hidden md:flex items-center justify-center gap-8 lg:gap-12">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                  {item.icon}
                </span>
              </div>
              <div>
                <span className="text-xl font-extrabold text-on-surface block leading-tight font-display-lg">
                  <AnimatedCounter value={item.value} suffix={item.suffix} decimals={item.decimals} />
                </span>
                <span className="text-[11px] text-on-surface-variant font-semibold">{item.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-[42vw] snap-center snap-always flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-border-subtle"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                  <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {item.icon}
                  </span>
                </div>
                <div>
                  <span className="text-base font-extrabold text-on-surface block leading-tight">
                    <AnimatedCounter value={item.value} suffix={item.suffix} decimals={item.decimals} />
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-semibold">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
