import SectionReveal from './SectionReveal'

const flowSteps = [
  { icon: 'menu_book', label: 'Learning', color: 'bg-secondary' },
  { icon: 'self_improvement', label: 'Confidence', color: 'bg-blue-500' },
  { icon: 'handyman', label: 'Projects', color: 'bg-blue-400' },
  { icon: 'badge', label: 'Portfolio', color: 'bg-indigo-500' },
  { icon: 'business_center', label: 'Internship', color: 'bg-violet-500' },
  { icon: 'work', label: 'Job', color: 'bg-purple-500' },
  { icon: 'monitoring', label: 'Career Growth', color: 'bg-emerald-500' },
]

export default function SkillsToCareer() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
      <div className="max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Build Skills. Build Career.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            From your first lesson to career growth — see how SkillPlace Academy transforms learners into professionals.
          </p>
        </SectionReveal>

        {/* Desktop: Horizontal Flow */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-center gap-2">
            {flowSteps.map((step, idx) => (
              <SectionReveal key={idx} direction="scale" className="flex items-center">
                <div className="flex flex-col items-center text-center max-w-[120px]">
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center text-white shadow-lg transition-transform duration-300 hover:scale-110`}>
                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                      {step.icon}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-on-surface mt-3">{step.label}</span>
                </div>
                {idx < flowSteps.length - 1 && (
                  <span className="material-symbols-outlined text-on-surface-variant/40 mx-1 -mt-6">arrow_forward</span>
                )}
              </SectionReveal>
            ))}
          </div>
        </div>

        {/* Mobile: Vertical Flow */}
        <div className="lg:hidden">
          <div className="flex flex-col items-center gap-3">
            {flowSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center text-white shadow-lg`}>
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {step.icon}
                  </span>
                </div>
                <span className="font-bold text-sm text-on-surface mt-2">{step.label}</span>
                {idx < flowSteps.length - 1 && (
                  <span className="material-symbols-outlined text-on-surface-variant/40 my-1">keyboard_arrow_down</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
