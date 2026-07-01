'use client'
import Link from 'next/link'
import { getProgramImage } from '@/lib/utils'
import { SafeImg } from '@/components/ui/safe-image'
import type { TrainingProgram } from '@/types'
import SectionReveal from './SectionReveal'

const renderBadge = (type: string) => {
  switch (type) {
    case 'online':
      return (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold text-secondary uppercase tracking-widest">Online</span>
        </div>
      )
    case 'offline':
      return (
        <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">Offline</span>
        </div>
      )
    case 'hybrid':
      return (
        <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">Hybrid</span>
        </div>
      )
    default:
      return (
        <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full shadow-sm">
          <span className="text-caption font-bold uppercase tracking-widest">{type}</span>
        </div>
      )
  }
}

function ProgramCardFallback({ title, type, imageKey, features, price, duration }: {
  title: string
  type: string
  imageKey: string
  features: string[]
  price: string
  duration: string
}) {
  return (
    <div className="group bg-white rounded-2xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300 flex flex-col h-full min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always hover:border-secondary/30 hover:-translate-y-1">
      <div className="relative aspect-video">
        <SafeImg className="w-full h-full object-cover" alt={title} src={getProgramImage(imageKey)} />
        {renderBadge(type)}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="p-6 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors line-clamp-2">{title}</h3>
          <ul className="space-y-3 mb-8">
            {features.map((f, idx) => (
              <li key={idx} className="flex items-center gap-3 text-body-md text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                <span className="line-clamp-1">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between border-t border-border-subtle pt-6 mt-auto">
          <div>
            <span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span>
            <span className="text-headline-md font-bold text-primary">{price}</span>
          </div>
          <div className="text-right">
            <span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span>
            <span className="font-bold">{duration}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OurTrainingProgram({ trainingPrograms }: { trainingPrograms: TrainingProgram[] }) {
  const programs = trainingPrograms.length > 0 ? trainingPrograms.slice(0, 6) : null

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto" id="programs">
      <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
          Programs
        </span>
        <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
          Our Training Programs
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Choose the learning format that works best for you. Specialized curriculum tailored for mechanical, civil, and electrical engineers.
        </p>
      </SectionReveal>

      <div
        className="flex md:grid md:grid-cols-2 lg:grid-cols-3 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory gap-6 pb-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {programs ? (
          programs.map((p) => (
            <Link
              href={`/programs/${p.slug}`}
              key={p.id}
              className="group bg-white rounded-2xl border border-border-subtle overflow-hidden card-shadow transition-all duration-300 flex flex-col h-full block min-w-[80vw] sm:min-w-[50vw] md:min-w-0 snap-center snap-always hover:border-secondary/30 hover:-translate-y-1"
            >
              <div className="relative aspect-video">
                <SafeImg className="w-full h-full object-cover" alt={p.name} src={getProgramImage(p.branches?.slug ?? 'civil')} />
                {renderBadge(p.program_type)}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-secondary transition-colors line-clamp-2">{p.name}</h3>
                  <ul className="space-y-3 mb-8">
                    {(p.features || []).slice(0, 3).map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-body-md text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                        <span className="line-clamp-1">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between border-t border-border-subtle pt-6 mt-auto">
                  <div>
                    <span className="block text-caption text-on-surface-variant uppercase font-semibold">Price</span>
                    <span className="text-headline-md font-bold text-primary">&#8377;{p.price?.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-caption text-on-surface-variant uppercase font-semibold">Duration</span>
                    <span className="font-bold">{p.duration_weeks} weeks</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <>
            <ProgramCardFallback
              title="Civil Engineering Online"
              type="online"
              imageKey="civil"
              features={['Online Course Access', 'Doubt Sessions', 'Training Certificate']}
              price="&#8377;29,999"
              duration="24 weeks"
            />
            <ProgramCardFallback
              title="Mechanical Engineering Offline"
              type="offline"
              imageKey="mechanical"
              features={['100% Job Assistance', 'Soft Skills Training', 'Hands-on Practical']}
              price="&#8377;44,999"
              duration="48 weeks"
            />
            <ProgramCardFallback
              title="Electronics & Automation"
              type="hybrid"
              imageKey="electronics"
              features={['PLC & SCADA Training', 'Industry Expert Mentorship', 'Site Visits']}
              price="&#8377;39,999"
              duration="36 weeks"
            />
          </>
        )}
      </div>

      <SectionReveal className="mt-8 text-center">
        <Link href="/programs" className="inline-flex items-center gap-2 text-secondary font-bold hover:underline">
          View All Programs
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      </SectionReveal>

      {/* Mobile Swipe Cue */}
      <div className="flex md:hidden items-center justify-center gap-1.5 mt-2 text-caption text-on-surface-variant font-semibold">
        <span className="material-symbols-outlined text-[16px] animate-pulse">swipe</span>
        <span>Swipe to see all training programs</span>
      </div>
    </section>
  )
}
