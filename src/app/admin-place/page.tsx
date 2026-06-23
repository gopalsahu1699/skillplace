import { Users, BookOpen, CreditCard, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  { title: 'Total Students', value: '2,450', icon: Users, change: '+12%' },
  { title: 'Active Courses', value: '26', icon: BookOpen, change: '+3' },
  { title: 'Total Revenue', value: '₹12.5L', icon: CreditCard, change: '+18%' },
  { title: 'New Leads', value: '84', icon: MessageSquare, change: '+24' },
]

const recentEnrollments = [
  { name: 'Rahul Sharma', course: 'AutoCAD 2D & 3D', date: '2024-01-22' },
  { name: 'Priya Patel', course: 'PLC Programming', date: '2024-01-21' },
  { name: 'Amit Kumar', course: 'SolidWorks', date: '2024-01-20' },
]

const recentPayments = [
  { name: 'Rahul Sharma', amount: '₹3,999', status: 'completed', date: '2024-01-22' },
  { name: 'Priya Patel', amount: '₹5,999', status: 'completed', date: '2024-01-21' },
  { name: 'Amit Kumar', amount: '₹4,499', status: 'pending', date: '2024-01-20' },
]

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">{stat.change} this month</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEnrollments.map((e, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.course}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{p.amount}</p>
                    <p className={`text-xs ${p.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {p.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
