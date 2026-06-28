import Link from 'next/link'

const teamMembers = [
  {
    name: 'Dr. Rajesh Mehta',
    role: 'Founder & Director',
    specialty: 'Civil Engineering Expert',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiaYv-dHH1E_-_ljEd59uJsBRt9kSTAXnFPKn47efCjH4G5avNNG-FMBEVyC5Wlsjz2gBqUro-Bg9V7Dh-8ecRSouOR8vV8O_UWvSL1TCnfMe2Kho7hSdi85jMHpobGJ2Z6zzvjL7D7bllxaNL2rPDcsXPUegbJchDqyIokfw6srS0vT0n12LNui8kaT0NpuMcLjPiFtIRdRPkC0i2DDoyyTHFX0uAPL4OwHZGT0QHOt5XHMcprA9c3FF548dqvkNT0iSv5G8vj4c',
  },
  {
    name: 'Prof. Sunita Sharma',
    role: 'Head of Training',
    specialty: 'Mechanical Engineering Lead',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFK6UJ20QV3exOMx8xAc5eAqB0NWlVuAT3_x7W6Q8-bOp-ARYB1ZPIDy1erJhoI9KKW3vyPl_ocQVK4ZqbeEhxrhBaop_MujVAeGllYSH7zyoVwRgKYs_4CcJm_BEirknzfvKe3ICDuSkBiSRNlKJYnU5uL95-NnQChAIEL8ZZCp-d9iHQqQ8vc9iXbSSixJNezqBXGeKISAb2Tnc80wXamTVdxukurKKtcWJq00vZtk9k9TS85PlR3qKj9zXS3PNcrX4b3u4--UY',
  },
  {
    name: 'Er. Amit Deshmukh',
    role: 'Placement Head',
    specialty: 'Electronics & IT Specialist',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTyHg9sSIp2iGG0H3A6pYa39XBrRtdbpfm-SLCIImhDV17Y8f-erQ8Qb2TOBvdf8tXEKkIsM7rJhP4fgjS8NJhSUp29g68HYZuRLtWD304agzAb7CRXxBJa5PaQYsY3B3wGPxL3dnvbgiV3aIQbiFFMvGunm5LggLfUc6LdZfhg7RLLSsy5_dhxgVpw9bRIxT61gxEJVcQA8pn05LgPV7CBqcpECfIk7B_0aQoqNu7WKg4muujt0-aW9rj079FriP8VCMBJTAInkc',
  },
]

const whyChooseUs = [
  { icon: 'menu_book', title: 'Industry-Relevant Curriculum', desc: 'Courses designed by industry experts based on current market demands and emerging technological trends.' },
  { icon: 'school', title: 'Expert Faculty', desc: 'Learn from professionals with 10+ years of industry experience across diverse engineering sectors.' },
  { icon: 'handyman', title: 'Hands-On Training', desc: '70% practical training with real-world projects, simulations, and actual industrial assignments.' },
  { icon: 'verified', title: 'Certified Courses', desc: 'Get industry-recognized certifications upon completion, valued by top engineering firms nationwide.' },
  { icon: 'work_history', title: 'Placement Assistance', desc: 'Dedicated placement cell with over 200+ active hiring partners across industrial clusters.' },
  { icon: 'event_available', title: 'Flexible Scheduling', desc: 'Weekday and weekend batches available to suit both students and working professionals.' },
]

export default function AboutPage() {
  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDgVjL6HHC7ZexccS3B2wlMbDnJhl1DLAWQ6FFZ7T_0aC343PUU7W06xYNKgntBmor0cj75MmctDD1UKRfUDMK8wRMP5WJ554f99YXvniXxXAb3wdymawXhR0YRwT8BfOCA7Qortkc8q6sYV6G9nJZBsvxDyyrJU7pwyNYWL7_X42jETNNRqX3AAmQqg5iRGNOnPNVapb3XYdb5h5Y22Y1p-_kaqXHxKdiuhW5qJ42A6zshWN1hf-AjUlimJq_NYmA5bm9rtREFLPM')",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-container/90 via-primary-container/40 to-transparent z-10" />

        <div className="relative z-20 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop w-full">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded bg-secondary/10 text-secondary font-label-md text-label-md mb-6">
              ESTABLISHED 2020
            </span>
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

      {/* Our Team */}
      <section className="py-section-gap bg-surface-container-lowest">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="mb-20">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Our Team</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Our leadership consists of experienced engineers and educators who are passionate about transforming technical education.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center group">
                <div className="relative mb-8 mx-auto w-64 h-64 overflow-hidden rounded-2xl bg-surface-container">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h4 className="font-headline-md text-headline-md text-on-surface">{member.name}</h4>
                <p className="text-secondary font-label-md text-label-md mb-2">{member.role}</p>
                <p className="text-on-surface-variant font-body-md text-body-md">{member.specialty}</p>
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
          <div className="flex flex-wrap justify-center items-center gap-20 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl mb-2">settings_suggest</span>
              <span className="font-bold text-xl tracking-tight">Autommensor Automation</span>
              <span className="text-xs uppercase font-label-md">Pvt. Ltd.</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-4xl mb-2">construction</span>
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
