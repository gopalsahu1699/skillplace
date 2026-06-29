import SectionReveal from './SectionReveal'

const guidanceServices = [
  { icon: 'map', title: 'Career Planning', desc: 'Personalized roadmap based on your interests, strengths, and market demand.' },
  { icon: 'insights', title: 'Job Market Insights', desc: 'Real-time data on which skills and roles are in highest demand.' },
  { icon: 'description', title: 'Resume Building', desc: 'Professional resume that highlights your projects and skills effectively.' },
  { icon: 'record_voice_over', title: 'Interview Preparation', desc: 'Mock interviews, behavioral coaching, and technical Q&A practice.' },
  { icon: 'photo_album', title: 'Portfolio Development', desc: 'Build a compelling portfolio that showcases your best work to employers.' },
  { icon: 'group', title: 'LinkedIn Profile', desc: 'Optimize your LinkedIn presence to attract recruiters and opportunities.' },
  { icon: 'work', title: 'Freelancing Guidance', desc: 'Learn how to find clients, set rates, and build a freelance career.' },
  { icon: 'rocket', title: 'Startup Guidance', desc: 'For those who want to build something of their own — mentorship for founders.' },
]

export default function CareerGuidance() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
      <div className="max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Complete Career Guidance
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            SkillPlace Academy doesn't just teach skills — we help you navigate your entire career journey.
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guidanceServices.map((service, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-border-subtle card-shadow hover:border-secondary/30 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {service.icon}
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{service.title}</h3>
                <p className="text-body-md text-on-surface-variant">{service.desc}</p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
