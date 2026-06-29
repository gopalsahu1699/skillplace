'use client'

import { useEffect, useRef } from 'react'

interface SectionRevealProps {
  children: React.ReactNode
  direction?: 'up' | 'left' | 'right' | 'scale'
  stagger?: boolean
  threshold?: number
  className?: string
}

export default function SectionReveal({
  children,
  direction = 'up',
  stagger = false,
  threshold = 0.1,
  className = '',
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  const directionClass =
    direction === 'left' ? 'reveal-from-left' :
    direction === 'right' ? 'reveal-from-right' :
    direction === 'scale' ? 'reveal-scale' : ''

  const staggerClass = stagger ? 'reveal-stagger' : ''

  return (
    <div ref={ref} className={`reveal-init ${directionClass} ${staggerClass} ${className}`}>
      {children}
    </div>
  )
}
