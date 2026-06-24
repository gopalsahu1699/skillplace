import { Badge } from '@/components/ui/badge'
import { Clock, BarChart3, Users, Play, BookOpen, Award, CheckCircle, ArrowRight, Star } from 'lucide-react'
import { getCourseBySlug } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import EnrollmentButton from '@/components/courses/EnrollmentButton'

export const dynamic = 'force-dynamic'

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) {
    notFound()
  }

  // Use server client for enrollment count (works with cookies)
  const serverSupabase = await createSupabaseServerClient()
  const { count: enrollmentCount } = await serverSupabase
    .from('enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', course.id)

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {course.categories && (
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {course.categories.name}
                  </Badge>
                )}
                <Badge className="bg-white/10 text-white border border-white/20">
                  {course.level}
                </Badge>
                {course.is_featured && (
                  <Badge className="bg-amber-500/90 text-white border-0">
                    <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-blue-100 text-lg mb-8 max-w-2xl leading-relaxed">
                {course.short_description || course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100 mb-8">
                {course.duration_hours && (
                  <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                    <Clock className="h-4 w-4" /> {course.duration_hours} hours
                  </span>
                )}
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <BarChart3 className="h-4 w-4" /> {course.level}
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <Users className="h-4 w-4" /> {enrollmentCount || 0} enrolled
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                  <BookOpen className="h-4 w-4" /> Practical Training
                </span>
              </div>

              <div className="flex items-center gap-5">
                <div>
                  {course.discount_price ? (
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold text-white">₹{course.discount_price.toLocaleString()}</span>
                      <span className="text-xl text-blue-200 line-through">₹{course.price.toLocaleString()}</span>
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {Math.round((1 - course.discount_price / course.price) * 100)}% OFF
                      </span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Play className="h-14 w-14 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">Course Preview</p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    {course.discount_price ? (
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-bold text-slate-900">₹{course.discount_price.toLocaleString()}</span>
                        <span className="text-lg text-slate-400 line-through">₹{course.price.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-slate-900">
                        {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                      </span>
                    )}
                  </div>
                  
                  <EnrollmentButton courseId={course.id} courseSlug={course.slug} price={course.price} />
                  
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                    {[
                      'Lifetime access',
                      'Certificate of completion',
                      'Mobile & desktop access',
                      'Downloadable resources',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Course</h2>
              <p className="text-slate-600 leading-relaxed">
                {course.description || 'This course is designed to provide hands-on practical training for engineering students and professionals. You will work on real-world projects and gain industry-relevant skills that employers are looking for.'}
              </p>
              
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Certificate</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Get certified upon completion</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
                  <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Industry Recognized</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Recognized by top companies</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Practical Training</h3>
                    <p className="text-xs text-slate-500 mt-0.5">70% hands-on, 30% theory</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Placement Support</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Dedicated placement assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4">What You'll Get</h3>
              <div className="space-y-3 mb-6">
                {[
                  'Course Completion Certificate',
                  'Project Completion Certificate (2 Projects)',
                  'Industrial Training Certificate',
                  'Resume Building Support',
                  'Interview Preparation',
                  'Lifetime Recording Access',
                  'Career Guidance',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-800 font-medium mb-1">🎓 Admissions Open</p>
                <p className="text-xs text-blue-600">Limited seats available. Enroll today to start your career in engineering.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to Start Your Career?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join {enrollmentCount || 0}+ students who have transformed their careers with Skillplace Academy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <EnrollmentButton courseId={course.id} courseSlug={course.slug} price={course.price} size="lg" />
            <a href="/contact" className="inline-flex items-center gap-2 text-white hover:text-blue-100 font-medium">
              Need help? Contact us <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
