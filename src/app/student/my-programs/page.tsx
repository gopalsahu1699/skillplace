import { createSupabaseServerClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import Link from 'next/link'
import { BookOpen, ChevronRight, Clock, CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MyProgramsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Please log in to view your programs.</p>
      </div>
    )
  }

  const { data: enrollments } = await adminSupabase
    .from('enrollments')
    .select('id, status, enrolled_at, training_programs(name, slug, duration_weeks, program_type)')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })

  const list = enrollments || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Purchased Programs</h1>
          <p className="text-sm text-slate-500 mt-1">{list.length} program{list.length !== 1 ? 's' : ''} enrolled</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {list.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-3">No programs purchased yet.</p>
            <Link
              href="/programs"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Browse Programs
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {list.map((enrollment: any) => {
              const program = enrollment.training_programs
              const isActive = enrollment.status === 'active'
              const isCompleted = enrollment.status === 'completed'
              return (
                <Link
                  key={enrollment.id}
                  href={program?.slug ? `/programs/${program.slug}` : '#'}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <span className="text-sm font-bold text-blue-600">
                      {program?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {program?.name || 'Unknown Program'}
                      </p>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-md">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </span>
                      )}
                      {isActive && (
                        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {program?.duration_weeks && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {program.duration_weeks} weeks
                        </span>
                      )}
                      {program?.program_type && (
                        <span className="capitalize">{program.program_type}</span>
                      )}
                      <span>Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
