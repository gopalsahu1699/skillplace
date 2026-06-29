import SectionReveal from './SectionReveal'

const mentors = [
  {
    name: 'Prakash Dev',
    position: 'CEO',
    company: 'Dozert AI',
    expertise: 'AI & Automation',
    bio: 'Visionary leader building AI solutions for industry. Passionate about practical engineering education.',
    initials: 'PD',
    color: 'bg-violet-600',
  },
  {
    name: 'Gopal Krishn Sahu',
    position: 'Director',
    company: 'Autommensor Automation Pvt Ltd',
    expertise: 'Industrial Automation',
    bio: '20+ years in automation & control systems. Dedicated to bridging the gap between academia and industry.',
    initials: 'GS',
    color: 'bg-blue-600',
  },
]

export default function MeetMentors() {
  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-surface">
      <div className="max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">
            Meet Our Mentors
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Learn from industry leaders who bring decades of real-world experience to every session.
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {mentors.map((mentor, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-border-subtle overflow-hidden card-shadow hover:border-secondary/30 transition-all duration-300 group"
              >
                <div className="p-8 flex flex-col items-center text-center">
                  {/* Photo placeholder */}
                  <div className={`w-24 h-24 rounded-full ${mentor.color} flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    {mentor.initials}
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">{mentor.name}</h3>
                  <p className="text-secondary font-bold text-sm mt-1">{mentor.position}</p>
                  <p className="text-on-surface-variant text-sm">{mentor.company}</p>
                  <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-secondary/10 rounded-full text-caption font-bold text-secondary">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    {mentor.expertise}
                  </span>
                  <p className="text-body-md text-on-surface-variant mt-4">{mentor.bio}</p>
                  <button className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-on-surface hover:border-secondary/30 hover:text-secondary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    View LinkedIn
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
