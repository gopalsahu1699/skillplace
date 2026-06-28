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
  ArrowRight,
  Phone,
  MapPin,
  Star,
  HardHat,
  Zap,
  Cpu,
} from 'lucide-react'
import { getCourses, getTestimonials, getTrainingPrograms } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

const whyChooseUs = [
  { icon: Briefcase, title: '100% Job Assistance', desc: 'Dedicated placement support for every student' },
  { icon: Target, title: 'Industry-Focused Curriculum', desc: 'Courses designed by industry experts' },
  { icon: Wrench, title: 'Hands-on Practical Training', desc: '70% practical, 30% theory' },
  { icon: Award, title: 'Real World Projects', desc: 'Work on live projects with real clients' },
]

const branchIcons: Record<string, React.ElementType> = {
  'Civil Engineering': HardHat,
  'Mechanical Engineering': Wrench,
  'Electrical Engineering': Zap,
  'Electronics': Cpu,
}

export default async function Home() {
  const [courses, testimonials, trainingPrograms] = await Promise.all([
    getCourses(),
    getTestimonials(),
    getTrainingPrograms(),
  ])

  const stats = [
    { value: '2000+', label: 'Students Trained', icon: Users },
    { value: '100%', label: 'Job Assistance', icon: Briefcase },
    { value: '10+', label: 'Industry Mentors', icon: Award },
    { value: `${courses.length}+`, label: 'Courses', icon: BookOpen },
  ]

  const branchMap = new Map<string, string[]>()
  courses.forEach((c) => {
    const branchName = (c as any).branches?.name || 'Other'
    if (!branchMap.has(branchName)) branchMap.set(branchName, [])
    branchMap.get(branchName)!.push(c.title)
  })

  const branches = Array.from(branchMap.entries()).map(([name, courseList]) => ({
    name,
    icon: branchIcons[name] || Briefcase,
    count: courseList.length,
    courses: courseList.slice(0, 6),
  }))

  const programs = trainingPrograms.map((p: any) => ({
    name: p.name,
    desc: p.short_description || p.description?.slice(0, 100) || 'Job-oriented training program',
    icon: GraduationCap,
    slug: p.slug,
    features: (p.features || []).slice(0, 4),
    price: p.price,
    discount_price: p.discount_price,
    duration_weeks: p.duration_weeks,
    program_type: p.program_type,
    branch: p.branches?.name || '',
  }))

  return (
    <>
      {/* Hero */}
      <section className="relative py-12 md:py-20 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-slate-50 overflow-hidden">
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
                Browse Courses <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/programs">
              <Button size="lg" variant="outline" className="border-slate-300 hover:bg-slate-50 px-8">
                View Programs
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

      {/* Stats */}
      <section className="py-8 md:py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
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

      {/* Programs */}
      <section className="py-10 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Our Training Programs</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Choose the learning format that works best for you</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {programs.slice(0, 6).map((p: any) => {
              const Icon = p.icon
              return (
                <Link
                  key={p.slug}
                  href={`/programs/${p.slug}`}
                  className="relative bg-white p-5 md:p-8 rounded-2xl border border-slate-200 transition-all duration-300 hover:shadow-lg hover:border-blue-200"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-11 w-11 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                      {p.branch && <p className="text-xs text-slate-500">{p.branch}</p>}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{p.desc}</p>
                  <ul className="space-y-2.5">
                    {p.features.map((f: string) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {p.discount_price ? (
                        <>
                          <span className="text-lg font-bold text-slate-900">₹{p.discount_price.toLocaleString()}</span>
                          <span className="text-xs text-slate-400 line-through ml-1">₹{p.price.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-slate-900">₹{p.price.toLocaleString()}</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{p.duration_weeks} weeks</span>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="text-center mt-10">
            <Link href="/programs">
              <Button variant="outline" className="gap-2 border-slate-300 hover:bg-slate-50">
                View All Programs <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Courses by Branch */}
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Job-Oriented Courses</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Industry-focused curriculum designed for immediate employment</p>
          </div>
          {branches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {branches.map((d) => {
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
            <div className="text-center py-12 text-slate-500">Loading courses...</div>
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

      {/* Why Choose Us */}
      <section className="py-10 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Why Choose Skillplace Academy?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We combine practical training with career support to ensure your success</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white p-5 md:p-7 rounded-2xl border border-slate-200 text-center hover:shadow-lg hover:border-blue-200 transition-all duration-300 group">
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

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-10 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">What Our Students Say</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Hear from students who transformed their careers</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t) => (
                <div key={t.id} className="bg-slate-50 p-5 md:p-7 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
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

      {/* CTA */}
      <section className="py-10 md:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Get In Touch</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Have questions? We&apos;re here to help you start your journey</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
            <div className="bg-white p-5 md:p-7 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
              <div className="h-13 w-13 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Phone / WhatsApp</h3>
                <p className="text-sm text-slate-600">7987814261</p>
                <p className="text-sm text-slate-600">8085782471</p>
              </div>
            </div>
            <div className="bg-white p-5 md:p-7 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
              <div className="h-13 w-13 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Location</h3>
                <p className="text-sm text-slate-600">Bilaspur, Chhattisgarh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-12 md:py-16 bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden">
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
