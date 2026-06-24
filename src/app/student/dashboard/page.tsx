'use client'
import { useState, useEffect } from 'react'
import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const [enrollmentsRes, notificationsRes] = await Promise.all([
      supabase
        .from('enrollments')
        .select('*, courses(title, slug)')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false }),
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    setEnrollments(enrollmentsRes.data || [])
    setNotifications(notificationsRes.data || [])
    setLoading(false)
  }

  const completedCount = enrollments.filter((e) => e.status === 'completed').length
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / enrollments.length)
    : 0

  const stats = [
    { title: 'Enrolled Courses', value: enrollments.length.toString(), icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { title: 'Completed', value: completedCount.toString(), icon: Award, color: 'bg-green-50 text-green-600' },
    { title: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Welcome back, Student!</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                <div className={`h-9 w-9 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Continue Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : enrollments.length === 0 ? (
                <p className="text-sm text-slate-500">No enrolled courses yet.</p>
              ) : (
                enrollments.filter((e) => e.status !== 'completed').slice(0, 3).map((enrollment) => (
                  <div key={enrollment.id} className="space-y-2 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">{enrollment.courses?.title || 'Unknown Course'}</span>
                      <span className="text-sm font-bold text-blue-600">{enrollment.progress_percent || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${enrollment.progress_percent || 0}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-slate-500">No notifications yet.</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${notif.is_read ? 'bg-slate-300' : 'bg-blue-600'}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                      {notif.message && <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>}
                      <p className="text-xs text-slate-400 mt-1">{new Date(notif.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
