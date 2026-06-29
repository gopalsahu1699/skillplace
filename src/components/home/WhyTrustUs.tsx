import SectionReveal from './SectionReveal'
import { getHomepageStats } from '@/lib/home-data'

const statIcons: Record<string, string> = {
  studentsTrained: 'groups',
  projectsBuilt: 'build_circle',
  hoursOfLearning: 'schedule',
  industryMentors: 'school',
  placementAssistance: 'handshake',
  communityMembers: 'diversity_3',
}

const statLabels: Record<string, string> = {
  studentsTrained: 'Students Trained',
  projectsBuilt: 'Projects Built',
  hoursOfLearning: 'Hours of Learning',
  industryMentors: 'Industry Mentors',
  placementAssistance: 'Placement Assistance',
  communityMembers: 'Community Members',
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K+`
  return `${n}+`
}

export default async function WhyTrustUs() {
  const stats = await getHomepageStats()

  const statEntries = Object.entries(stats) as [keyof typeof stats, number][]

  return (
    <section className="py-section-gap px-margin-mobile md:px-margin-desktop bg-primary-container text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div className="relative max-w-container-max mx-auto">
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-headline-lg mb-4">
            Why Students Trust Us
          </h2>
          <p className="font-body-md text-body-md text-white/80">
            Numbers don't lie. Here's the impact SkillPlace Academy has made on engineering careers.
          </p>
        </SectionReveal>

        <SectionReveal stagger>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {statEntries.map(([key, value], idx) => (
              <div key={key} className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
                <span className="material-symbols-outlined text-[28px] text-secondary-fixed-dim mb-3 block" style={{ fontVariationSettings: '"FILL" 1' }}>
                  {statIcons[key] || 'star'}
                </span>
                <span className="font-display-lg text-headline-lg text-white block mb-1 animate-count-up">
                  {key === 'placementAssistance' ? '100%' : formatNumber(value)}
                </span>
                <span className="text-caption text-white/70 uppercase tracking-wider font-bold">
                  {statLabels[key]}
                </span>
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
