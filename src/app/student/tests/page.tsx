'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, ClipboardList } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface Test {
  id: string
  title: string
  duration_minutes: number | null
  passing_score: number
  max_attempts: number
  courses: { title: string } | null
  test_attempts: { id: string }[]
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchTests() {
    const { data, error } = await supabase
      .from('tests')
      .select('*, courses(title), test_attempts(id)')
      .eq('is_active', true)

    if (!error) {
      setTests(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    Promise.resolve().then(() => fetchTests())
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Tests</h1>

      <h2 className="text-lg font-bold text-slate-900 mb-4">Available Tests</h2>
      <div className="space-y-4 mb-8">
        {loading ? (
          <p className="text-slate-500">Loading tests...</p>
        ) : tests.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 bg-slate-100 rounded-2xl items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No tests available yet.</p>
          </div>
        ) : (
          tests.map((test) => {
            const attempts = test.test_attempts?.length || 0
            return (
              <div key={test.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{test.title}</h3>
                    <p className="text-sm text-slate-500">{test.courses?.title || 'Unknown Course'}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                      {test.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" /> {test.duration_minutes} min
                        </span>
                      )}
                      <span>Attempts: {attempts}/{test.max_attempts}</span>
                      <span>Passing: {test.passing_score}%</span>
                    </div>
                  </div>
                </div>
                <Button disabled={attempts >= test.max_attempts} className={attempts >= test.max_attempts ? '' : 'bg-blue-600 hover:bg-blue-700'}>
                  {attempts === 0 ? 'Start Test' : 'Retake'}
                </Button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
