'use client'
import { useEffect, useState, useRef } from 'react'
import { Users, BookOpen, Award, Briefcase } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [started, end, duration])

  return { count, ref }
}

const statIcons = [Users, Award, Briefcase, BookOpen]

export default function StatsSection() {
  const [stats, setStats] = useState([
    { value: 2000, suffix: '+', label: 'Students Trained' },
    { value: 1500, suffix: '+', label: 'Interviews Cleared' },
    { value: 500, suffix: '+', label: 'Projects Completed' },
    { value: 200, suffix: '+', label: 'Hiring Partners' },
  ])

  useEffect(() => {
    async function fetchStats() {
      const [coursesRes] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ])

      setStats([
        { value: 2000, suffix: '+', label: 'Students Trained' },
        { value: 1500, suffix: '+', label: 'Interviews Cleared' },
        { value: 500, suffix: '+', label: 'Projects Completed' },
        { value: coursesRes.count || 20, suffix: '+', label: 'Courses Available' },
      ])
    }
    fetchStats()
  }, [])

  return (
    <section className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const { count, ref } = useCountUp(stat.value)
            const Icon = statIcons[index]
            return (
              <div key={stat.label} ref={ref} className="text-center group">
                <div className="inline-flex h-12 w-12 bg-blue-50 rounded-xl items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900">
                  {count}{stat.suffix}
                </div>
                <div className="text-sm text-slate-500 mt-2">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
