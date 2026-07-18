import type { Metadata } from 'next'
import { getCourseBySlug, getCourses, getFaqs } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import EnrollButton from '@/components/courses/EnrollButton'
import Link from 'next/link'
import { getSupabaseImageUrl } from '@/lib/utils'
import JsonLd from '@/components/seo/JsonLd'
import { courseSchema, breadcrumbSchema, courseInstanceSchema, learningResourceSchema, pageSchema, faqSchema, productSchema } from '@/lib/seo/json-ld'
import { createMetadata } from '@/lib/seo/metadata'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const courses = await getCourses()
  return courses.map((course: { slug: string }) => ({ slug: course.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) return {}

  const branchName = course.branches?.name || 'Engineering'
  const title = `${course.title} - ${branchName} Course | Skillplace Academy`
  const description = course.short_description || course.description || `Learn ${course.title} with hands-on practical training at Skillplace Academy. ${course.duration_hours ? `${course.duration_hours} hours` : ''} of intensive training with certification and placement assistance.`

  return createMetadata({
    title,
    description: description.slice(0, 160),
    path: `/courses/${course.slug}`,
    keywords: [`${course.title} course`, `${branchName} training`, 'engineering certification', 'practical engineering course'],
    ogImage: course.thumbnail_url || undefined,
    publishedTime: course.created_at,
    modifiedTime: course.updated_at,
  })
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) {
    notFound()
  }

  const { count: enrollmentCount } = await adminSupabase
    .from('course_enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', course.id)

  const formattedCount = ((enrollmentCount || 0) + 1200).toLocaleString()
  const branchName = course.branches?.name || 'Engineering'

  const featuresList: string[] = (() => {
    if (Array.isArray(course.features) && course.features.length > 0) return course.features
    if (typeof course.features === 'string' && course.features) {
      const raw = course.features
      if (raw.startsWith('[') && raw.endsWith(']')) {
        try { return JSON.parse(raw) } catch {}
      }
      if (raw.startsWith('{') && raw.endsWith('}')) {
        return raw.slice(1, -1).split(',').map((s: string) => s.trim().replace(/^"|"$/g, '')).filter(Boolean)
      }
      return raw.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean)
    }
    if (course.description) {
      const lines = course.description.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean)
      if (lines.length > 1) return lines
    }
    return []
  })()

  const aboutDescription = course.short_description || course.description || 'Master practical technical drafting and design skills. Learn to transform conceptual ideas into professional-grade engineering documentation with industry-standard workflows.'

  const faqs = await getFaqs()

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Courses', url: '/courses' },
        { name: course.title, url: `/courses/${course.slug}` },
      ])} />
      <JsonLd data={courseSchema({
        ...course,
        branches: course.branches || undefined,
        enrollmentCount: (enrollmentCount || 0) + 1200,
      })} />
      <JsonLd data={courseInstanceSchema(course)} />
      <JsonLd data={learningResourceSchema(course)} />
      <JsonLd data={productSchema(course)} />
      {faqs.length > 0 && <JsonLd data={faqSchema(faqs.map(f => ({ q: f.question, a: f.answer })))} />}
      <JsonLd data={pageSchema(
        `/courses/${course.slug}`,
        `${course.title} - ${branchName} Course | Skillplace Academy`,
        course.short_description || course.description || `Learn ${course.title} at Skillplace Academy`
      )} />

      <div className="bg-background text-on-surface font-body-md overflow-x-hidden">

        <section className="relative bg-primary-container text-on-primary py-16 md:py-20 lg:py-24 overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-on-primary-container/70">
              <Link href="/" className="hover:text-secondary transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/courses" className="hover:text-secondary transition-colors">Courses</Link>
              <span className="mx-2">/</span>
              <span className="text-white">{course.title}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                {course.branches && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/20 text-secondary-fixed-dim rounded-full text-label-md font-label-md mb-6 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">engineering</span>
                    {course.branches.name}
                  </div>
                )}

                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-4 text-white">
                  {course.title}
                </h1>

                <p className="font-body-lg text-body-lg text-on-primary-container mb-8 max-w-xl">
                  {course.short_description || course.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-10 p-4 md:p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                  <div>
                    <p className="text-caption text-on-primary-container uppercase tracking-widest mb-1">Duration</p>
                    <p className="font-headline-md text-headline-md font-bold text-white">
                      {course.duration_hours ? `${course.duration_hours} Hours` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-on-primary-container uppercase tracking-widest mb-1">Level</p>
                    <p className="font-headline-md text-headline-md font-bold text-white capitalize">
                      {course.level || 'All'}
                    </p>
                  </div>
                  <div>
                    <p className="text-caption text-on-primary-container uppercase tracking-widest mb-1">Method</p>
                    <p className="font-headline-md text-headline-md font-bold text-white">Practical</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    {course.discount_price ? (
                      <>
                        <span className="text-on-primary-container line-through text-caption">₹{course.price.toLocaleString()}</span>
                        <span className="text-3xl sm:text-4xl font-extrabold text-white">₹{course.discount_price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">
                        {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                  <div className="w-full sm:w-auto">
                    <EnrollButton
                      courseId={course.id}
                      courseSlug={course.slug}
                      price={course.price}
                      discountPrice={course.discount_price}
                      title={course.title}
                      size="lg"
                    />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-primary-container rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative tonal-card rounded-2xl overflow-hidden bg-primary-container border-outline-variant/30 aspect-video flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                      style={{ backgroundImage: `url('${course.thumbnail_url}')` }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                      style={{ backgroundImage: `url('${getSupabaseImageUrl('course-detail-gallery.jpg')}')` }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-container/80 via-primary-container/20 to-transparent flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-secondary hover:border-secondary transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-7 p-8 md:p-10 bg-white tonal-card rounded-2xl flex flex-col justify-between">
              <div>
                <h2 className="font-headline-lg text-headline-lg mb-6 text-primary">About This Course</h2>
                <div className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {aboutDescription}
                </div>
              </div>

              {featuresList.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border-subtle">
                  <div className="font-body-md text-on-surface-variant whitespace-pre-wrap">
                    {featuresList.join('\n')}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-5 bg-primary-container text-white p-8 md:p-10 rounded-2xl flex flex-col justify-center">
              <div className="mb-8">
                <span className="material-symbols-outlined text-secondary text-5xl mb-4 block">verified_user</span>
                <h3 className="font-headline-md text-headline-md mb-2">Academic Precision</h3>
                <p className="opacity-80 font-body-md">Our curriculum is designed by industry veterans to ensure you meet the rigorous standards of modern engineering firms.</p>
              </div>

              <div className="flex items-center gap-4 py-4 border-t border-white/10">
                <span className="material-symbols-outlined text-secondary text-2xl">update</span>
                <div>
                  <p className="font-bold text-body-md">Lifetime access</p>
                  <p className="text-caption opacity-60">Learn at your own pace</p>
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 border-t border-white/10">
                <span className="material-symbols-outlined text-secondary text-2xl">devices</span>
                <div>
                  <p className="font-bold text-body-md">Multi-device compatible</p>
                  <p className="text-caption opacity-60">Mobile, Tablet, Desktop</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-surface-container">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-4">Why This Course?</h2>
              <p className="text-on-surface-variant font-body-md">Industry-leading features designed for professional success.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              <div className="bg-white p-8 rounded-xl tonal-card group transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-secondary-fixed rounded-lg flex items-center justify-center mb-6 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-3 text-primary">Certified</h3>
                <p className="text-body-md text-on-surface-variant">Receive a prestigious Certificate of Completion to showcase your expertise.</p>
              </div>

              <div className="bg-white p-8 rounded-xl tonal-card group transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-secondary-fixed rounded-lg flex items-center justify-center mb-6 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">corporate_fare</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-3 text-primary">Recognized</h3>
                <p className="text-body-md text-on-surface-variant">Our program is widely recognized by top-tier engineering and design firms.</p>
              </div>

              <div className="bg-white p-8 rounded-xl tonal-card group transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-secondary-fixed rounded-lg flex items-center justify-center mb-6 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">handyman</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-3 text-primary">70% Practical</h3>
                <p className="text-body-md text-on-surface-variant">Hands-on training with real-world projects and industrial workflows.</p>
              </div>

              <div className="bg-white p-8 rounded-xl tonal-card group transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-secondary-fixed rounded-lg flex items-center justify-center mb-6 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">support_agent</span>
                </div>
                <h3 className="font-headline-md text-headline-md mb-3 text-primary">Placement</h3>
                <p className="text-body-md text-on-surface-variant">Dedicated support to help you land your first engineering role.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
              <div className="lg:w-1/3 lg:sticky lg:top-32 w-full">
                <h2 className="font-headline-lg text-headline-lg text-primary mb-6">Course Deliverables</h2>
                <p className="text-body-lg text-on-surface-variant mb-8">Upon enrolling, you gain access to a comprehensive suite of resources designed to accelerate your career growth.</p>

                <div className="bg-primary-container p-8 rounded-2xl text-white">
                  <p className="text-caption uppercase tracking-widest text-secondary mb-2 font-bold">Enrolled Students</p>
                  <p className="text-4xl font-extrabold mb-4">{formattedCount}+</p>
                  <div className="flex -space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-surface-dim"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-secondary-fixed"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-on-primary-container"></div>
                    <div className="w-10 h-10 rounded-full border-2 border-primary-container flex items-center justify-center bg-secondary text-[10px] font-bold">+200</div>
                  </div>
                  <p className="text-caption opacity-70 italic">&quot;The project-based approach changed my understanding of technical design entirely.&quot; — Rahul M.</p>
                </div>
              </div>

              <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {[
                  { title: 'Course Completion Certificate', desc: 'Globally valid professional certification.', icon: 'stars' },
                  { title: 'Project Certificate (2 Projects)', desc: 'Proof of real-world drafting competency.', icon: 'assignment_turned_in' },
                  { title: 'Industrial Training Certificate', desc: 'Recognized industrial training credit.', icon: 'factory' },
                  { title: 'Resume Building Support', desc: 'Expert guidance on your technical profile.', icon: 'history_edu' },
                  { title: 'Interview Preparation', desc: 'Mock sessions for technical CAD rounds.', icon: 'groups' },
                  { title: 'Lifetime Recording Access', desc: 'Revisit lectures anytime, anywhere.', icon: 'video_library' },
                ].map((item) => (
                  <div key={item.title} className="p-6 border border-border-subtle rounded-xl flex gap-4 hover:border-secondary transition-colors bg-white tonal-card">
                    <span className="material-symbols-outlined text-secondary text-3xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-primary text-body-md mb-1">{item.title}</h4>
                      <p className="text-caption text-on-surface-variant">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto bg-secondary-fixed rounded-3xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <h2 className="font-headline-lg text-headline-lg text-primary mb-6">Want to join a full program?</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">This course is a foundational pillar of our 90-day comprehensive engineering programs. Upgrade to a full program to get deep placement support, multiple tool certifications, and live mentorship.</p>
                <Link className="inline-flex items-center gap-2 font-bold text-secondary hover:gap-4 transition-all" href="/programs">
                  Explore Full Programs <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
              <div className="relative min-h-[300px] bg-cover bg-center" style={{ backgroundImage: `url('${getSupabaseImageUrl('course-detail-banner.jpg')}')` }}>
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-secondary-fixed lg:block hidden"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-surface-container">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-8 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq) => (
                <details key={faq.id} className="bg-white rounded-xl border border-border-subtle group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-on-surface hover:bg-surface-container-low transition-colors rounded-xl">
                    {faq.question}
                    <span className="material-symbols-outlined text-on-surface-variant transition-transform group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-body-md text-on-surface-variant">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-primary-container text-white text-center">
          <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-6">Ready to Start Your Career?</h2>
            <p className="font-body-lg text-body-lg opacity-80 mb-10">Join over {formattedCount}+ students who have transformed their professional journey with our practical engineering approach.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <EnrollButton
                courseId={course.id}
                courseSlug={course.slug}
                price={course.price}
                discountPrice={course.discount_price}
                title={course.title}
                size="lg"
              />
              <Link href="/contact" className="px-10 py-4 bg-white/10 text-white border border-white/20 font-bold rounded-lg hover:bg-white/20 transition-colors block text-center w-full sm:w-auto">
                Contact Advisor
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-60">
              <a href="tel:+917987814261" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-sm">call</span>
                <span className="text-caption">79878 14261</span>
              </a>
              <a href="mailto:skillplaceacademy@gmail.com" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-sm">mail</span>
                <span className="text-caption">info@skillplace.com</span>
              </a>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
