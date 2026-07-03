import Link from 'next/link'
import { getSupabaseImageUrl } from '@/lib/utils'
import { SafeImg } from '@/components/ui/safe-image'
import { getMentors } from '@/lib/supabase/queries'

const whyChooseUs = [
  { icon: 'menu_book', title: 'Industry-Relevant Curriculum', desc: 'Courses designed by industry experts based on current market demands and emerging technological trends.' },
  { icon: 'school', title: 'Expert Faculty', desc: 'Learn from professionals with 10+ years of industry experience across diverse engineering sectors.' },
  { icon: 'handyman', title: 'Hands-On Training', desc: '70% practical training with real-world projects, simulations, and actual industrial assignments.' },
  { icon: 'verified', title: 'Certified Courses', desc: 'Get industry-recognized certifications upon completion, valued by top engineering firms nationwide.' },
  { icon: 'work_history', title: 'Placement Assistance', desc: 'Dedicated placement cell with over 200+ active hiring partners across industrial clusters.' },
  { icon: 'event_available', title: 'Flexible Scheduling', desc: 'Weekday and weekend batches available to suit both students and working professionals.' },
]

export default async function AboutPage() {
  const teamMembers = await getMentors()

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${getSupabaseImageUrl('about-hero-bg.jpg')}')`,
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container/90 via-primary-container/40 to-transparent z-10" />

        <div className="relative z-20 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full">
          <div className="max-w-2xl">
            {/* <span className="inline-block py-1 px-3 rounded bg-secondary/10 text-secondary font-label-md text-label-md mb-6">
              ESTABLISHED 2020
            </span> */}
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

      {/* Mission & Vision */}
      <section className="py-section-gap bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Mission */}
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

            {/* Vision */}
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

      {/* Why Choose Us */}
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

      {/* Our Mentors */}
      <section className="py-section-gap bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-20">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Our Mentors</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Our leadership consists of experienced engineers and educators who are passionate about transforming technical education.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center group">
                <div className="relative mb-8 mx-auto w-64 h-64 overflow-hidden rounded-2xl bg-surface-container">
                  <SafeImg
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h4 className="font-headline-md text-headline-md text-on-surface">{member.name}</h4>
                <p className="text-secondary font-label-md text-label-md mb-2">{member.position}</p>
                <p className="text-on-surface-variant font-body-md text-body-md">{member.company}</p>
                <p className="text-primary font-label-md text-label-md">{member.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 border-y border-border-subtle bg-white overflow-hidden">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <p className="text-center text-on-surface-variant font-label-md text-label-md mb-12 tracking-widest uppercase">
            Trusted by Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-20 opacity-60  grayscale-0 opacity-100 transition-all duration-500 cursor-default">
            <div className="flex flex-col items-center">
              <img
                src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/Logo%20for%20Automensor.png"
                alt="Autommensor Automation Pvt Ltd"
                className="w-32 h-16 object-contain mb-2"
              />
              <span className="font-bold text-xl tracking-tight">Autommensor Automation Pvt. Ltd.</span>
              <span className="text-xs uppercase font-label-md">Sponsored</span>
            </div>
            <div className="flex flex-col items-center">
              <img
                src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/Himanshu.png"
                alt="Himanshu Construction"
                className="w-32 h-16 object-contain mb-2"
              />
              <span className="font-bold text-xl tracking-tight">Himanshu Construction</span>
              <span className="text-xs uppercase font-label-md">Industry Partner</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
  )
}
