import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StudentDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Welcome back, Student!</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Enrolled Courses', value: '3', icon: BookOpen },
          { title: 'Completed', value: '1', icon: Award },
          { title: 'Hours Learned', value: '45', icon: Clock },
          { title: 'Progress', value: '67%', icon: TrendingUp },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'AutoCAD 2D & 3D', progress: 60 },
                { title: 'SolidWorks', progress: 30 },
                { title: 'PLC Programming', progress: 10 },
              ].map((course) => (
                <div key={course.title} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{course.title}</span>
                    <span className="text-sm text-muted-foreground">{course.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'New lesson available in AutoCAD', time: '2 hours ago' },
                { title: 'Your certificate is ready', time: '1 day ago' },
                { title: 'Live class scheduled tomorrow', time: '2 days ago' },
              ].map((notif, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-primary rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.time}</p>
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
