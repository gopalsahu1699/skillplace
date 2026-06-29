import Link from 'next/link'
import SectionReveal from './SectionReveal'

export default function FinalCTA() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
      <SectionReveal>
        <div className="max-w-container-max mx-auto bg-secondary rounded-[2rem] p-12 md:p-20 relative overflow-hidden text-center">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.1),_transparent_50%)]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-white mb-6">
              Ready to Build Your Career?
            </h2>
            <p className="font-body-lg text-body-lg text-white/90 mb-10 max-w-2xl mx-auto">
              Don't just earn a certificate. Build skills that companies value. Join SkillPlace Academy and transform your future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-secondary px-10 py-4 rounded-xl font-bold text-label-md hover:bg-white/90 transition-all shadow-xl inline-flex items-center justify-center gap-2"
              >
                Enroll Today
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/courses"
                className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}
