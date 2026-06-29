import SectionReveal from './SectionReveal'

const whyChooseCards = [
  {
    icon: 'precision_manufacturing',
    title: 'Practical Learning',
    desc: '70% hands-on training with real-world tools and workflows — not just theory.',
  },
  {
    icon: 'rocket_launch',
    title: 'Live Projects',
    desc: 'Work on actual client projects during your training to build real experience.',
  },
  {
    icon: 'build',
    title: 'Industry Tools',
    desc: 'Master AutoCAD, Revit, SolidWorks, PLC, SCADA, and other industry-standard software.',
  },
  {
    icon: 'folder_special',
    title: 'Portfolio Building',
    desc: 'Graduate with a professional portfolio that showcases your skills to employers.',
  },
  {
    icon: 'description',
    title: 'Resume Preparation',
    desc: 'Get your resume reviewed and optimized by industry professionals.',
  },
  {
    icon: 'record_voice_over',
    title: 'Interview Preparation',
    desc: 'Mock interviews, common questions, and confidence-building sessions.',
  },
  {
    icon: 'trending_up',
    title: 'Career Mentorship',
    desc: '1-on-1 guidance from mentors who know the industry inside out.',
  },
  {
    icon: 'payments',
    title: 'Affordable Learning',
    desc: 'Quality education that doesn\'t break the bank. EMI options available.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
      <div className="max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Why Choose SkillPlace Academy?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We don't just teach — we prepare you for a successful career. Here's what makes us different.
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseCards.map((card, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-border-subtle card-shadow hover:border-secondary/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {card.icon}
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{card.title}</h3>
                <p className="text-body-md text-on-surface-variant">{card.desc}</p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
