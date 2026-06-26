import { Star } from 'lucide-react'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function getTestimonials() {
  const { data, error } = await adminSupabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: true })
    .limit(6)

  if (error) {
    return []
  }
  return data || []
}

export default async function TestimonialsSection() {
  const testimonials = await getTestimonials()

  if (testimonials.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">What Our Students Say</h2>
          <p className="mt-3 text-slate-500">
            Hear from our students who transformed their careers with Skillplace Academy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t: any) => (
            <div key={t.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">&quot;{t.review}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{t.student_name?.charAt(0) || 'S'}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.student_name}</p>
                  <p className="text-xs text-slate-500">{t.course_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
