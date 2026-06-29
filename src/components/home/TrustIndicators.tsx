import SectionReveal from './SectionReveal'

const trustItems = [
  { icon: 'workspace_premium', title: 'Practical Training', desc: '70% hands-on learning' },
  { icon: 'diversity_3', title: 'Industry Mentors', desc: 'Learn from experts' },
  { icon: 'engineering', title: 'Real Projects', desc: 'Build live projects' },
  { icon: 'support_agent', title: 'Career Guidance', desc: 'Personal mentorship' },
  { icon: 'handshake', title: 'Placement Support', desc: 'Direct recruiter connections' },
  { icon: 'verified', title: 'Certificates', desc: 'Recognized credentials' },
  { icon: 'history', title: 'Lifetime Learning', desc: 'Access anytime' },
  { icon: 'agent', title: 'Community Support', desc: '2,000+ members' },
]

export default function TrustIndicators() {
  return (
    <section className="py-16 px-margin-mobile md:px-margin-desktop bg-surface-container-low border-y border-border-subtle">
      <div className="max-w-container-max mx-auto">
        <SectionReveal stagger>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {trustItems.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-border-subtle hover:border-secondary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {item.icon}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-on-surface mb-1">{item.title}</h4>
                <p className="text-caption text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
