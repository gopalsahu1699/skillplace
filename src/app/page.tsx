import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  Users,
  Globe,
  Briefcase,
  Target,
  Wrench,
  Award,
  BookOpen,
  MessageSquare,
  FileText,
  Handshake,
  Check,
  Laptop,
  ArrowRight,
  Phone,
  MapPin,
  Star,
} from 'lucide-react'
import { getCategories, getCourses, getTestimonials } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

const programs = [
  {
    name: 'Online Program',
    icon: Laptop,
    popular: false,
    features: [
      'Course access',
      'Online doubt sessions',
      'Training certificate',
      'Project completion certificate',
      'Resume building',
      'Career guidance',
      'Lifetime recording access',
      'Interview preparation',
    ],
  },
  {
    name: 'Offline Program',
    icon: Users,
    popular: true,
    features: [
      '100% Job assistance',
      'Soft skills training',
      'Doubt sessions',
      'Live offline classes with recorded video',
      'Site visits',
      'Industry expert mentorship',
      'Internship certificate',
      'Training completion certificate',
      '2 project certificates',
      'Year-gap solution',
      'Resume building',
      'Lifetime recording access',
      'Interview preparation',
    ],
  },
  {
    name: 'Hybrid Program',
    icon: Globe,
    popular: false,
    features: [
      'Online course access',
      'Training completion certificate',
      'Industry expert mentorship',
      'Site visits',
      '2 Project completion certificates',
      'Job assistance (final-year students)',
      'Access to both online and offline resources',
      'Resume building',
      'Career guidance',
      'Lifetime recording access',
      'Interview preparation',
    ],
  },
]

const whyChooseUs = [
  { icon: Briefcase, title: '100% Job Assistance', desc: 'Dedicated placement support for every student' },
  { icon: Target, title: 'Industry-Focused Curriculum', desc: 'Courses designed by industry experts' },
  { icon: Wrench, title: 'Hands-on Practical Training', desc: '70% practical, 30% theory' },
  { icon: Award, title: 'Real World Projects', desc: 'Work on live projects with real clients' },
]

const targetStudents = [
  { icon: GraduationCap, title: 'Diploma Students', desc: 'Kickstart your career with practical skills' },
  { icon: BookOpen, title: 'B.Tech Final Year', desc: 'Bridge the gap between college and industry' },
  { icon: Users, title: 'Passed Out Students', desc: 'Get job-ready with real project experience' },
  { icon: Briefcase, title: 'Working Professionals', desc: 'Upskill and switch to better opportunities' },
]

const features = [
  { icon: Briefcase, title: '100% Job Assistance' },
  { icon: Target, title: 'Practical Training' },
  { icon: Wrench, title: 'Live Projects' },
  { icon: Users, title: 'Industry Mentor Guidance' },
  { icon: MessageSquare, title: 'Soft Skills Training' },
  { icon: FileText, title: 'Interview Preparation' },
  { icon: Handshake, title: 'Placement Assistance' },
]

const categoryIcons: Record<string, React.ElementType> = {
  'Civil Engineering': Briefcase,
  'Mechanical Engineering': Wrench,
  'Electrical Engineering': Target,
  'Electronics': Award,
  'Soft Skills': Users,
}

export default async function Home() {
  const [categories, courses, testimonials] = await Promise.all([
    getCategories(),
    getCourses(),
    getTestimonials(),
  ])

  const stats = [
    { value: '2000+', label: 'Students Trained', icon: Users },
    { value: '100%', label: 'Job Assistance', icon: Briefcase },
    { value: '10+', label: 'Industry Mentors', icon: Award },
    { value: `${courses.length}+`, label: 'Courses', icon: BookOpen },
  ]

  const departments = categories.map((cat) => {
    const Icon = categoryIcons[cat.name] || Briefcase
    const categoryCourses = courses.filter((c) => c.category_id === cat.id)
    return {
      name: cat.name,
      icon: Icon,
      count: categoryCourses.length,
      courses: categoryCourses.map((c) => c.title).slice(0, 6),
    }
  })

  return (
    <>
      {/* Section 1: Hero */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-blue-50 via-white to-slate-50 overflow-hidden">
        {/* Background dots pattern */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-blue-200/50">
            <MapPin className="h-4 w-4" /> Bilaspur, Chhattisgarh
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
            skillplace <span className="text-blue-600">ACADEMY</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-3">Learn | Practice | Get Placed</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600 mb-6">
            LEARN TODAY – GET HIRED TOMORROW!
          </p>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto">Practical Training • Real Projects • Real Careers</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/courses">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300 px-8">
                Enroll Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50 px-8">
                Free Career Counseling
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-3">
            {['Online', 'Offline', 'Hybrid'].map((tag) => (
              <span key={tag} className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Stats */}
      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="text-center group">
                  <div className="inline-flex h-12 w-12 bg-blue-50 rounded-xl items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Programs */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Our Programs</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Choose the learning format that works best for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {programs.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.name}
                  className={`relative bg-white p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                    p.popular ? 'border-blue-600 shadow-lg ring-1 ring-blue-600/10' : 'border-slate-200 hover:border-blue-200'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-sm">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 4: Courses */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Job-Oriented Courses</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Industry-focused curriculum designed for immediate employment</p>
          </div>
          {departments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {departments.map((d) => {
                const Icon = d.icon
                return (
                  <div key={d.name} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{d.name}</h3>
                        <p className="text-xs text-slate-500">{d.count} courses</p>
                      </div>
                    </div>
                    <ul className="space-y-1.5 mb-5">
                      {d.courses.map((c) => (
                        <li key={c} className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="h-1 w-1 bg-blue-400 rounded-full shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                    <Link href="/courses" className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group/link">
                      Explore <ArrowRight className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">Loading categories...</div>
          )}
          <div className="text-center mt-12">
            <Link href="/courses">
              <Button variant="outline" className="gap-2 border-slate-300 hover:bg-slate-50">
                View All {courses.length}+ Courses <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 5: Why Choose Us */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Why Choose Skillplace Academy?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We combine practical training with career support to ensure your success</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white p-7 rounded-2xl border border-slate-200 text-center hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                  <div className="h-14 w-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 6: Target Students */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Who Should Join?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Our programs are designed for everyone looking to build a career in engineering</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetStudents.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-slate-50 p-7 rounded-2xl border border-slate-200 text-center hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                  <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 7: Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">What We Offer</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to launch a successful engineering career</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-5">
            {features.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white p-5 rounded-2xl border border-slate-200 text-center hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                  <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 8: Certificates */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Certificates You&apos;ll Receive</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Industry-recognized certifications to boost your career</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'Course Completion Certificate', desc: 'Recognized certification upon course completion', icon: Award },
              { title: 'Project Completion Certificate', desc: 'For 2 Live Projects', icon: FileText },
              { title: 'Industrial Training Certificate', desc: 'From Company', icon: Briefcase },
            ].map((c) => (
              <div key={c.title} className="bg-slate-50 p-7 rounded-2xl border border-slate-200 text-center hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
                <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <c.icon className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{c.title}</h3>
                <p className="text-sm text-slate-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9: Industry Experts */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Learn From Industry Experts</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Get mentored by professionals with years of industry experience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-all duration-300">
              <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">10+ Industry Mentors</h3>
              <p className="text-sm text-slate-500">Learn from experienced professionals</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center hover:shadow-lg transition-all duration-300">
              <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Extra Mentor Sessions</h3>
              <p className="text-sm text-slate-500">Personalized guidance and support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 10: Admissions Open */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Admissions Open — Limited Seats!
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join the Next Batch of Successful Engineers</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
            Start your journey to a better career with practical training, real projects, and guaranteed placement assistance.
          </p>
          <Link href="/courses">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 shadow-lg px-8">
              Enroll Now <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Section 11: Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">What Our Students Say</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Hear from students who transformed their careers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t) => (
                <div key={t.id} className="bg-slate-50 p-7 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed">&ldquo;{t.review}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{t.student_name?.charAt(0) || 'S'}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{t.student_name}</p>
                      {t.course_name && <p className="text-xs text-slate-500">{t.course_name}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 12: Contact / Footer CTA */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Get In Touch</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Have questions? We&apos;re here to help you start your journey</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
            <div className="bg-white p-7 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
              <div className="h-13 w-13 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Phone / WhatsApp</h3>
                <p className="text-sm text-slate-600">7987814261</p>
                <p className="text-sm text-slate-600">8085782471</p>
              </div>
            </div>
            <div className="bg-white p-7 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
              <div className="h-13 w-13 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Location</h3>
                <p className="text-sm text-slate-600">Bilaspur, Chhattisgarh</p>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500">
            Sponsored by Autommensor Automation Pvt. Ltd. | Industry Partner: himanshu construction
          </p>
        </div>
      </section>

      {/* Section 13: Final CTA */}
      <section className="relative py-20 bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Your Career?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join thousands of students who have transformed their careers with Skillplace Academy</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 px-8">
                Browse Courses <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-white border-slate-600 hover:bg-slate-800 px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
