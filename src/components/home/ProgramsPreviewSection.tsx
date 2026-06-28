import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

interface Program {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  program_type: string
  price: number
  discount_price: number | null
  duration_weeks: number
  features: string[]
  branches: { name: string } | null
}

const branchGradients: Record<string, string> = {
  'Civil Engineering': 'from-blue-600 to-blue-400',
  'Mechanical Engineering': 'from-orange-500 to-amber-400',
  'Electrical Engineering': 'from-yellow-500 to-orange-400',
  'Electronics': 'from-purple-600 to-violet-400',
}

const typeBadgeStyles: Record<string, string> = {
  online: 'bg-white/90 text-[var(--secondary)]',
  offline: 'bg-[var(--secondary)] text-white',
  hybrid: 'bg-[var(--tertiary-fixed)] text-[var(--on-tertiary-fixed)]',
}

export default function ProgramsPreviewSection({ programs }: { programs: Program[] }) {
  const displayPrograms = programs.slice(0, 3)

  return (
    <section className="py-20 md:py-30 px-5 md:px-20 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-14">
        <div className="max-w-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            Our Training Programs
          </h2>
          <p className="text-base text-[var(--on-surface-variant)]">
            Choose the learning format that works best for you. Specialized curriculum tailored for mechanical, civil, and electrical engineers.
          </p>
        </div>
        <Link href="/programs" className="inline-flex items-center gap-2 text-[var(--secondary)] font-bold hover:underline text-sm flex-shrink-0">
          View All Programs
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </Link>
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPrograms.map((program) => {
          const gradient = branchGradients[program.branches?.name || ''] || 'from-slate-600 to-slate-400'
          const badgeStyle = typeBadgeStyles[program.program_type] || 'bg-white/90 text-[var(--secondary)]'

          return (
            <div
              key={program.id}
              className="group bg-white rounded-xl border border-[var(--border-subtle)] overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]"
            >
              {/* Image placeholder */}
              <div className={`aspect-video bg-gradient-to-br ${gradient} relative`}>
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full shadow-sm">
                  <span className={`text-xs font-bold uppercase tracking-widest ${badgeStyle}`}>
                    {program.program_type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-[var(--on-surface)] mb-3 group-hover:text-[var(--secondary)] transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                  {program.name}
                </h3>
                <ul className="space-y-2.5 mb-6">
                  {(program.features || []).slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-[var(--on-surface-variant)]">
                      <CheckCircle className="h-4 w-4 text-[var(--secondary)] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-5">
                  <div>
                    <span className="block text-xs text-[var(--on-surface-variant)] uppercase font-semibold">Price</span>
                    <span className="text-lg font-bold text-[var(--primary)]">
                      ₹{program.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-[var(--on-surface-variant)] uppercase font-semibold">Duration</span>
                    <span className="font-bold text-sm">{program.duration_weeks} weeks</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
