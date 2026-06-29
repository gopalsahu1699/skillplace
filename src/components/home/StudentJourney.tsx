import SectionReveal from './SectionReveal'

const journeySteps = [
  { icon: 'visibility', label: 'Visitor', desc: 'Discover SkillPlace Academy' },
  { icon: 'app_registration', label: 'Enroll', desc: 'Join a program that fits your goals' },
  { icon: 'school', label: 'Learn Skills', desc: 'Master industry-ready tools & concepts' },
  { icon: 'fitness_center', label: 'Practice', desc: 'Strengthen skills with hands-on exercises' },
  { icon: 'build_circle', label: 'Build Projects', desc: 'Create real-world deliverables' },
  { icon: 'badge', label: 'Create Portfolio', desc: 'Showcase your best work' },
  { icon: 'co_present', label: 'Interview Prep', desc: 'Mock interviews & confidence building' },
  { icon: 'work', label: 'Get Job', desc: 'Land your dream engineering role' },
  { icon: 'monitoring', label: 'Grow Career', desc: 'Continuous growth & advancement' },
]

export default function StudentJourney() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low">
      <div className="max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Your Journey From Visitor to Engineer
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Every step is designed to take you closer to your dream career. No shortcuts, just proven methods.
          </p>
        </SectionReveal>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:block relative">
          <div className="absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-secondary/20 via-secondary to-secondary/20" />
          <div className="grid grid-cols-9 gap-2">
            {journeySteps.map((step, idx) => (
              <SectionReveal key={idx} direction={idx % 2 === 0 ? 'up' : 'left'}>
                <div className="flex flex-col items-center text-center relative">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white shadow-lg shadow-secondary/20 z-10">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                      {step.icon}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-caption font-bold text-secondary">Step {idx + 1}</span>
                    <h4 className="font-bold text-sm text-on-surface mt-1">{step.label}</h4>
                    <p className="text-caption text-on-surface-variant mt-1">{step.desc}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden relative pl-12">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary via-secondary/60 to-secondary/20" />
          <div className="space-y-8">
            {journeySteps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-12 top-0 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white shadow-lg shadow-secondary/20">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {step.icon}
                  </span>
                </div>
                <div>
                  <span className="text-caption font-bold text-secondary">Step {idx + 1}</span>
                  <h4 className="font-bold text-sm text-on-surface">{step.label}</h4>
                  <p className="text-caption text-on-surface-variant mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
