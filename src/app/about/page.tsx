import type { Metadata } from 'next'
import Link from 'next/link'
import { getSupabaseImageUrl } from '@/lib/utils'
import { SafeImg } from '@/components/ui/safe-image'
import { getMentors, getPartners } from '@/lib/supabase/queries'
import JsonLd from '@/components/seo/JsonLd'
import { createMetadata } from '@/lib/seo/metadata'
import { breadcrumbSchema, pageSchema, personSchema } from '@/lib/seo/json-ld'

export const metadata: Metadata = createMetadata({
  title: 'About Skillplace Academy | India\'s Premier Engineering Skill Development Academy',
  description: 'Learn about Skillplace Academy\'s mission to bridge the gap between academic knowledge and industry requirements. 2000+ students trained, expert mentors, practical-focused curriculum.',
  path: '/about',
  keywords: ['about engineering academy', 'skillplace team', 'engineering mentors India', 'skill development mission', 'academy Bilaspur'],
})

const whyChooseUs = [
  { icon: 'menu_book', title: 'Industry-Relevant Curriculum', desc: 'Courses designed by industry experts based on current market demands and emerging technological trends.' },
  { icon: 'school', title: 'Expert Faculty', desc: 'Learn from professionals with 10+ years of industry experience across diverse engineering sectors.' },
  { icon: 'handyman', title: 'Hands-On Training', desc: '70% practical training with real-world projects, simulations, and actual industrial assignments.' },
  { icon: 'verified', title: 'Certified Courses', desc: 'Get industry-recognized certifications upon completion, valued by top engineering firms nationwide.' },
  { icon: 'work_history', title: 'Placement Assistance', desc: 'Dedicated placement cell with over 200+ active hiring partners across industrial clusters.' },
  { icon: 'event_available', title: 'Flexible Scheduling', desc: 'Weekday and weekend batches available to suit both students and working professionals.' },
]

export default async function AboutPage() {
  const [teamMembers, partners] = await Promise.all([
    getMentors(),
    getPartners(),
  ])

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
      ])} />
      <JsonLd data={pageSchema('/about', 'About Skillplace Academy | India\'s Premier Engineering Skill Development Academy', 'Learn about Skillplace Academy\'s mission to bridge the gap between academic knowledge and industry requirements.')} />
      {teamMembers.map((member: { name: string; position: string; image?: string }) => (
        <JsonLd key={member.name} data={personSchema({
          name: member.name,
          jobTitle: member.position,
          image: member.image,
        })} />
      ))}

      <div className="bg-background text-on-surface font-body-md overflow-x-hidden">

        <section className="relative h-[600px] flex items-center overflow-hidden">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${getSupabaseImageUrl('about-hero-bg.jpg')}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/90 via-primary-container/40 to-transparent z-10" />

          <div className="relative z-20 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full">
            <div className="max-w-2xl">
          
              <h1 className="font-display-lg text-display-lg text-white mb-6 leading-tight">
                Empowering Engineers with Practical Skills
              </h1>
              <p className="font-body-lg text-body-lg text-white/80 mb-10 leading-relaxed">
                Bridge the gap between academic knowledge and industry requirements. We provide high-stakes technical education to transform ambitious students into competent industry professionals.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/programs"
                  className="px-8 py-4 bg-secondary text-white font-label-md text-label-md rounded-lg shadow-lg hover:shadow-secondary/20 hover:bg-secondary/90 transition-all"
                >
                  Our Programs
                </Link>
                <Link
                  href="/courses"
                  className="px-8 py-4 border border-white/30 text-white font-label-md text-label-md rounded-lg hover:bg-white/10 transition-all"
                >
                  View Courses
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-surface-container-lowest">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-secondary text-4xl">rocket_launch</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Our Mission</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  To bridge the gap between academic knowledge and industry requirements by providing practical, hands-on training in engineering skills. We aim to make every student job-ready within 90 days of joining.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-on-surface">
                    <span className="w-2 h-2 rounded-sm bg-secondary shrink-0" />
                    Practical Skill Focused
                  </li>
                  <li className="flex items-center gap-3 text-on-surface">
                    <span className="w-2 h-2 rounded-sm bg-secondary shrink-0" />
                    90-Day Transformation
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-secondary text-4xl">visibility</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Our Vision</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  To become India&apos;s leading skill development platform for engineers, creating a community of industry-ready professionals who can contribute meaningfully to the engineering sector.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-on-surface">
                    <span className="w-2 h-2 rounded-sm bg-secondary shrink-0" />
                    Nationwide Community
                  </li>
                  <li className="flex items-center gap-3 text-on-surface">
                    <span className="w-2 h-2 rounded-sm bg-secondary shrink-0" />
                    Industry Contribution
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-surface-bright">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">Why Choose Skillplace?</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                We combine industry expertise with practical training to deliver results through a mathematically rigorous curriculum designed for modern engineers.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {whyChooseUs.map((item) => (
                <div
                  key={item.title}
                  className="group bg-white p-8 rounded-xl border border-border-subtle shadow-[0px_4px_20px_rgba(15,23,42,0.05)] hover:shadow-xl hover:border-secondary hover:-translate-y-2 transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-secondary mb-6 text-3xl block">{item.icon}</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-4">{item.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-surface-container-lowest">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Our Mentors</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Our leadership consists of experienced engineers and educators who are passionate about transforming technical education.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member: { name: string; image?: string; position: string; company?: string; experience?: string; gradient?: string; bio?: string; expertise?: string; initials?: string }) => (
                <div key={member.name} className="bg-white rounded-2xl border border-border-subtle overflow-hidden group hover:border-secondary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1" itemScope itemType="https://schema.org/Person">
                  <div className={`h-2 bg-gradient-to-r ${member.gradient || 'from-secondary to-primary'}`} />
                  <div className="p-8 flex flex-col items-center text-center">
                    <div className="relative mb-6 w-32 h-32 rounded-full overflow-hidden bg-surface-container ring-4 ring-secondary/10 group-hover:ring-secondary/30 transition-all duration-500">
                      <SafeImg
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <h4 className="font-headline-md text-headline-md text-on-surface" itemProp="name">{member.name}</h4>
                    <p className="text-secondary font-bold text-sm mt-1" itemProp="jobTitle">{member.position}</p>
                    {member.company && (
                      <p className="text-on-surface-variant text-sm mt-0.5">{member.company}</p>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                      {member.experience && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 rounded-full text-caption font-bold text-secondary">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: '"FILL" 1' }}>schedule</span>
                          {member.experience}
                        </span>
                      )}
                 
                    </div>
                     <div className="flex items-center gap-2 mt-4">
                           {member.expertise && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 rounded-full text-caption font-bold text-violet-700">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                          {member.expertise}
                        </span>
                      )}
                      </div>
                    {member.bio && (
                      <p className="text-body-md text-on-surface-variant mt-4 leading-relaxed line-clamp-3">{member.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 border-y border-border-subtle bg-white overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <p className="text-center text-on-surface-variant font-label-md text-label-md mb-16 tracking-widest uppercase">
              Trusted by Industry Leaders
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {partners.map((partner: { id: string; name: string; short: string; logo: string | null; type: string }) => (
                <div key={partner.id} className="group bg-surface-container-lowest rounded-2xl border border-border-subtle p-8 flex flex-col items-center text-center hover:border-secondary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-full h-20 flex items-center justify-center mb-6 px-4">
                    <img
                      src={partner.logo || ''}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="font-headline-md text-headline-md text-on-surface mb-2">{partner.name}</h4>
                  <span className="inline-flex items-center gap-1.5 text-caption font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-secondary/10 text-secondary">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>handshake</span>
                    {partner.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-primary-container text-white text-center">
          <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 className="font-headline-lg text-display-lg-mobile md:text-display-lg mb-8">Ready to Start Your Career?</h2>
            <p className="font-body-lg text-body-lg mb-12 text-on-primary-container leading-relaxed">
              Join Skillplace Academy today and become a job-ready engineer in just 90 days with our industry-led training programs.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/programs"
                className="px-10 py-5 bg-secondary hover:bg-secondary/90 transition-all rounded-lg font-bold text-lg shadow-lg"
              >
                Enroll Now
              </Link>
              <Link
                href="/contact"
                className="px-10 py-5 border border-on-primary-container hover:bg-on-primary-container/10 transition-all rounded-lg font-bold text-lg"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
