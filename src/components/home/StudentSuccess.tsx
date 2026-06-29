import SectionReveal from './SectionReveal'

const successItems = [
  {
    icon: 'photo_album',
    title: 'Student Projects',
    desc: 'Real projects built by our students during training. See the quality of work our graduates deliver.',
    color: 'bg-blue-500',
  },
  {
    icon: 'format_quote',
    title: 'Testimonials',
    desc: 'Hear directly from students about their learning experience and career transformation.',
    color: 'bg-violet-500',
  },
  {
    icon: 'workspace_premium',
    title: 'Certificates',
    desc: 'Industry-recognized certificates that validate your skills and boost your resume.',
    color: 'bg-emerald-500',
  },
  {
    icon: 'business_center',
    title: 'Internship Stories',
    desc: 'Our students gain real experience through internships with our industry partners.',
    color: 'bg-amber-500',
  },
  {
    icon: 'work',
    title: 'Job Placements',
    desc: 'From learning to earning — our placement track record speaks for itself.',
    color: 'bg-rose-500',
  },
  {
    icon: 'collections',
    title: 'Portfolio Showcase',
    desc: 'Every student graduates with a professional portfolio ready to impress employers.',
    color: 'bg-cyan-500',
  },
]

export default function StudentSuccess() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low">
      <div className="max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Student Success Stories
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Every card here represents a real student who transformed their career through SkillPlace Academy.
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {successItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-border-subtle p-8 card-shadow hover:border-secondary/30 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {item.icon}
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-3">{item.title}</h3>
                <p className="text-body-md text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
