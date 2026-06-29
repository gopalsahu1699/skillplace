import SectionReveal from './SectionReveal'

const partners = [
  {
    name: 'Autommensor Automation Pvt Ltd',
    short: 'Autommensor',
    desc: 'Industrial automation & control systems',
    color: 'bg-blue-600',
  },
  {
    name: 'Dozert AI',
    short: 'Dozert',
    desc: 'AI-powered technology solutions',
    color: 'bg-violet-600',
  },
  {
    name: 'Himanshu Construction',
    short: 'Himanshu',
    desc: 'Civil construction & infrastructure',
    color: 'bg-amber-600',
  },
]

export default function IndustryPartners() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface-container-low">
      <div className="max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Industry Partners
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We collaborate with leading companies to ensure our curriculum stays current and our students get real industry exposure.
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partners.map((partner, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-border-subtle p-8 text-center card-shadow hover:border-secondary/30 transition-all duration-300 group"
              >
                {/* Logo placeholder */}
                <div className={`w-20 h-20 rounded-2xl ${partner.color} mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                  <span className="text-white font-bold text-2xl">{partner.short[0]}</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{partner.name}</h3>
                <p className="text-body-md text-on-surface-variant mb-4">{partner.desc}</p>
                <span className="inline-flex items-center gap-1 text-caption font-bold text-secondary uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">handshake</span>
                  Industry Partner
                </span>
              </div>
            ))}
          </div>
        </SectionReveal>

        <SectionReveal className="mt-10 text-center">
          <p className="text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Our partnerships mean guest lectures, live projects, internship opportunities, and direct placement connections for SkillPlace Academy students.
          </p>
        </SectionReveal>
      </div>
    </section>
  )
}
