import { Users, BookOpen, CreditCard, MessageSquare, TrendingUp, UserCog } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardStats, getRecentEnrollments, getRecentPayments } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [stats, enrollments, payments] = await Promise.all([
    getDashboardStats(),
    getRecentEnrollments(),
    getRecentPayments(),
  ])

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
    { title: 'Active Courses', value: stats.activeCourses.toString(), icon: BookOpen, color: 'bg-green-50 text-green-600', trend: '+3%' },
    { title: 'Total Revenue', value: `₹${(stats.totalRevenue / 100).toLocaleString()}`, icon: CreditCard, color: 'bg-purple-50 text-purple-600', trend: '+8%' },
    { title: 'Total Employees', value: stats.totalEmployees.toLocaleString(), icon: UserCog, color: 'bg-indigo-50 text-indigo-600', trend: '' },
    { title: 'New Leads', value: stats.newLeads.toString(), icon: MessageSquare, color: 'bg-orange-50 text-orange-600', trend: '+15%' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => {
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
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  {stat.trend && (
                    <div className="flex items-center gap-0.5 text-xs font-medium text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollments.length === 0 ? (
                <p className="text-sm text-slate-500">No enrollments yet.</p>
              ) : (
                enrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-blue-600">{((e.profiles as any)?.full_name || 'U').charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{(e.profiles as any)?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{(e.courses as any)?.title || 'Unknown Course'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">{new Date(e.enrolled_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <p className="text-sm text-slate-500">No payments yet.</p>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                        <CreditCard className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{(p.profiles as any)?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">₹{p.amount}</p>
                      <p className={`text-xs font-medium ${p.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {p.status}
                      </p>
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
