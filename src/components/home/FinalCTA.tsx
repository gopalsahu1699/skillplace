import Link from 'next/link'
import SectionReveal from './SectionReveal'

export default function FinalCTA() {
  return (
    <section className="relative py-section-gap px-margin-mobile md:px-margin-desktop overflow-hidden bg-surface">
      <SectionReveal>
        <div className="relative max-w-container-max mx-auto rounded-[2rem] overflow-hidden border border-border-subtle/50 shadow-lg">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 via-surface to-secondary-container/15" />
          <div className="absolute inset-0 grid-pattern opacity-10" />

          {/* Decorative elements */}
          <div className="absolute top-[-20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-5%] w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 p-12 md:p-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-emerald-800">Limited Seats for 2026 Batch</span>
            </div>

            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-6 leading-tight">
              Ready to Build the Career{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">You Deserve?</span>
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
              Don&apos;t just earn a certificate. Build skills that companies value. Join where students who transformed their future with SkillPlace Academy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="shimmer-btn bg-gradient-to-r from-blue-600 to-blue-500 text-white px-10 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:-translate-y-0.5 duration-300"
              >
                Start Learning Today
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>arrow_forward</span>
              </Link>
              <Link
                href="/contact"
                className="bg-white border border-border-subtle text-on-surface px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-surface-container-low hover:border-secondary/25 transition-all duration-300"
              >
                Book Free Career Consultation
              </Link>
            </div>

            {/* Trust stats */}
            {/* <div className="mt-10 flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-emerald-600" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                <span><strong className="text-on-surface">2,000+</strong> students trained</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-emerald-600" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                <span><strong className="text-on-surface">87%</strong> placement rate</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-emerald-600" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                <span>EMI options available</span>
              </div>
            </div> */}
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}
