import Link from 'next/link'
import { Building2, Cpu, Zap, Wrench, ArrowRight } from 'lucide-react'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const iconMap: any = {
  Building2,
  Wrench,
  Zap,
  Cpu,
}

async function getCategoriesWithCourses() {
  const { data: categories, error: catError } = await adminSupabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (catError) {
    console.error('Error fetching categories:', catError)
    return []
  }

  const { data: courses, error: courseError } = await adminSupabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (courseError) {
    console.error('Error fetching courses:', courseError)
    return categories || []
  }

  return (categories || []).map((cat: any) => ({
    ...cat,
    courses: (courses || []).filter((c: any) => c.category_id === cat.id),
  }))
}

export default async function CoursesSection() {
  const categories = await getCategoriesWithCourses()

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Our Course Categories</h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            Explore our comprehensive range of engineering courses designed to make you industry-ready.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat: any) => {
            const Icon = iconMap[cat.icon] || Building2
            return (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.slug}`}
                className="group block p-6 bg-white border border-slate-200 rounded-2xl hover:shadow-lg hover:border-blue-200 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                    <p className="text-sm text-slate-500">{cat.courses?.length || 0} courses</p>
                  </div>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {(cat.courses || []).slice(0, 4).map((course: any) => (
                    <li key={course.id} className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="h-1 w-1 bg-blue-400 rounded-full" />
                      {course.title}
                    </li>
                  ))}
                  {(cat.courses || []).length > 4 && (
                    <li className="text-sm text-slate-500">+{(cat.courses || []).length - 4} more</li>
                  )}
                </ul>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
                  View Courses <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
