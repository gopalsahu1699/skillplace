import { ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: 'work_history',
    title: '100% Job Assistance',
    desc: 'Dedicated placement support and direct recruitment connections for every graduate.',
  },
  {
    icon: 'menu_book',
    title: 'Industry-Focused',
    desc: 'Courses designed by active industry experts to meet current market demands.',
  },
  {
    icon: 'precision_manufacturing',
    title: 'Hands-on Practical',
    desc: '70% practical training and only 30% theory to build actual engineering confidence.',
  },
  {
    icon: 'rocket_launch',
    title: 'Real World Projects',
    desc: 'Work on live projects with real clients to gain experience before your first job.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-20 md:py-30 px-5 md:px-20 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — Features */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-8" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            Why Choose Skillplace Academy?
          </h2>
          <p className="text-base text-[var(--on-surface-variant)] mb-10 max-w-lg">
            We combine practical training with career support to ensure your success in the competitive engineering job market.
          </p>
          <div className="grid sm:grid-cols-2 gap-7">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--secondary)]/10 flex items-center justify-center text-[var(--secondary)]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1;' }}>{f.icon}</span>
                </div>
                <h4 className="text-lg font-bold text-[var(--primary)]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>{f.title}</h4>
                <p className="text-sm text-[var(--on-surface-variant)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Image Card */}
        <div className="relative">
          <div className="absolute -inset-4 bg-[var(--secondary)]/5 rounded-3xl -rotate-2" />
          <div className="relative bg-white rounded-2xl overflow-hidden border border-[var(--border-subtle)]" style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
            {/* Placeholder image with gradient matching reference */}
            <div className="aspect-[4/3] bg-gradient-to-br from-[var(--surface-container-high)] to-[var(--surface-container-highest)] relative flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--secondary)]/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-[var(--secondary)]">groups</span>
                </div>
                <p className="text-[var(--on-surface-variant)] font-medium">Students learning together</p>
              </div>
            </div>
            {/* Overlay card */}
            <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-5 rounded-xl border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[var(--surface-container-high)]" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[var(--surface-container)]" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[var(--secondary)] flex items-center justify-center text-[9px] text-white font-bold">+2k</div>
                </div>
                <p className="text-xs font-bold text-[var(--on-surface)]">Trusted by 2,000+ Engineers</p>
              </div>
              <p className="text-sm text-[var(--on-surface-variant)]">
                "The hands-on project work gave me the confidence to ace my interview at a top MNC."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
