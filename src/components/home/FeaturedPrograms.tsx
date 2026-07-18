'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getProgramImage } from '@/lib/utils'
import { SafeImage } from '@/components/ui/safe-image'
import type { TrainingProgram } from '@/types'
import SectionReveal from './SectionReveal'

interface FeaturedProgramsProps {
  programs: TrainingProgram[]
}



function SkillLevelBadge({ level }: { level: string | null }) {
  if (!level) return null
  const colors: Record<string, string> = {
    beginner: 'bg-emerald-50 text-emerald-700',
    intermediate: 'bg-amber-50 text-amber-700',
    advanced: 'bg-rose-50 text-rose-700',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[level] || ''}`}>
      {level}
    </span>
  )
}

function StarRating({ rating }: { rating: number }) {
  if (!rating || rating <= 0) return null
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-medium text-on-surface-variant">{rating.toFixed(1)}</span>
    </div>
  )
}

function FeaturedCard({ program }: { program: TrainingProgram }) {
  const router = useRouter()
  return (
    <Link
      href={`/programs/${program.slug}`}
      className="group relative flex flex-col h-full bg-white rounded-2xl border border-border-subtle overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(0,88,190,0.12)] hover:border-secondary/30"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <SafeImage
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          alt={program.name}
          src={getProgramImage(program.branches?.slug ?? 'civil')}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

    

        <div className="absolute top-3 right-3">
          {program.rating > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-bold text-white">{program.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-grow p-5">
        <div className="flex items-center gap-2 mb-2">
            {program.student_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-on-surface-variant">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {program.student_count.toLocaleString()} students
            </span>
          )}
        </div>

        <h3 className="font-headline-md text-headline-md text-on-surface mb-1.5 group-hover:text-secondary transition-colors line-clamp-1">
          {program.name}
        </h3>

        <p className="text-body-sm text-on-surface-variant mb-3 line-clamp-2 min-h-[2.5rem]">
          {program.short_description || program.description || 'Comprehensive training program designed for career growth.'}
        </p>

        {program.career_outcome && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-secondary/5 border border-secondary/10">
            <svg className="w-4 h-4 text-secondary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-semibold text-secondary line-clamp-1">{program.career_outcome}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-auto pt-3 border-t border-border-subtle">
          {program.duration_weeks && (
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {program.duration_weeks} weeks Training Program
            </div>
          )}
     
        </div>

        {program.program_fees && program.program_fees.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border-subtle">
            <div className="grid grid-cols-3 gap-1.5">
              {program.program_fees.map((fee) => {
                const cfg: Record<string, { label: string; gradient: string }> = {
                  online: { label: 'Online', gradient: 'from-purple-500 to-purple-600' },
                  offline: { label: 'Offline', gradient: 'from-blue-500 to-blue-600' },
                  hybrid: { label: 'Hybrid', gradient: 'from-amber-500 to-amber-600' },
                }
                const c = cfg[fee.program_type] || { label: fee.program_type, gradient: 'from-slate-500 to-slate-600' }
                return (
                  <div
                    key={fee.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      router.push(`/programs/${program.slug}/enroll?mode=${fee.program_type}`)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/programs/${program.slug}/enroll?mode=${fee.program_type}`)
                      }
                    }}
                    className={`flex flex-col items-center p-1.5 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${
                      fee.program_type === program.program_type
                        ? 'border-secondary bg-secondary/5'
                        : 'border-transparent bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-0.5`}>
                      <span className="material-symbols-outlined text-white text-[10px]">{cfg[fee.program_type]?.label === 'Online' ? 'online_prediction' : fee.program_type === 'hybrid' ? 'layers' : 'groups'}</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface">{c.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-6">
        <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
        No featured programs available at the moment.
      </h3>
      <p className="text-body-md text-on-surface-variant mb-6">
        Check back soon for our latest training programs.
      </p>
      <Link
        href="/programs"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-white font-bold text-body-md hover:bg-secondary/90 transition-colors"
      >
        Browse All Programs
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  )
}

export default function FeaturedPrograms({ programs }: FeaturedProgramsProps) {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto" id="programs">
      <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
          Featured Programs
        </span>
        <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
          Featured Training Programs
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Handpicked programs designed to accelerate your engineering career. Learn from industry experts and build real-world skills.
        </p>
      </SectionReveal>

      {programs.length > 0 ? (
        <>
          <SectionReveal stagger>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <FeaturedCard key={program.id} program={program} />
              ))}
            </div>
          </SectionReveal>

          <SectionReveal className="mt-12 text-center">
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-secondary text-white font-bold text-body-md hover:bg-secondary/90 transition-all hover:shadow-lg hover:shadow-secondary/20"
            >
              Explore All Training Programs
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </SectionReveal>
        </>
      ) : (
        <EmptyState />
      )}
    </section>
  )
}
