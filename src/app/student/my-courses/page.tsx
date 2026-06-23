import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

const myCourses = [
  { id: '1', title: 'AutoCAD 2D & 3D', progress: 60, status: 'active' },
  { id: '2', title: 'SolidWorks', progress: 30, status: 'active' },
  { id: '3', title: 'Resume Building', progress: 100, status: 'completed' },
]

export default function MyCoursesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Courses</h1>
      <div className="space-y-4">
        {myCourses.map((course) => (
          <div key={course.id} className="bg-white border border-border rounded-xl p-6 flex items-center gap-6">
            <div className="h-20 w-20 bg-slate-100 rounded-lg shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{course.title}</h3>
                <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                  {course.status}
                </Badge>
              </div>
              <Progress value={course.progress} className="h-2 mt-2 mb-1" />
              <p className="text-sm text-muted-foreground">{course.progress}% complete</p>
            </div>
            <Link href={`/courses/autocad-2d-3d`}>
              <Button size="sm">
                {course.status === 'completed' ? 'Review' : 'Continue'}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
