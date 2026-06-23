import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, BarChart3, Users, Play, FileText } from 'lucide-react'

const placeholderCourse = {
  title: 'AutoCAD 2D & 3D',
  description: 'Master AutoCAD from basics to advanced 3D modeling. This comprehensive course covers everything you need to become proficient in AutoCAD for civil and mechanical engineering applications.',
  short_description: 'Complete AutoCAD training for engineers.',
  price: 4999,
  discount_price: 3999,
  duration_hours: 40,
  level: 'beginner',
  category: { name: 'Civil Engineering' },
  modules: [
    {
      id: '1', title: 'Introduction to AutoCAD', lessons: [
        { id: '1', title: 'Getting Started with AutoCAD', is_free: true, video_duration: 1200 },
        { id: '2', title: 'Interface and Navigation', is_free: false, video_duration: 900 },
      ]
    },
    {
      id: '2', title: '2D Drafting', lessons: [
        { id: '3', title: 'Drawing Commands', is_free: false, video_duration: 1500 },
        { id: '4', title: 'Modification Tools', is_free: false, video_duration: 1200 },
        { id: '5', title: 'Dimensioning and Annotations', is_free: false, video_duration: 1000 },
      ]
    },
    {
      id: '3', title: '3D Modeling', lessons: [
        { id: '6', title: '3D Basics', is_free: false, video_duration: 1800 },
        { id: '7', title: 'Advanced 3D Techniques', is_free: false, video_duration: 2000 },
      ]
    },
  ],
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = placeholderCourse

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{course.category.name}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{course.title}</h1>
              <p className="text-muted-foreground mb-6">{course.description}</p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration_hours} hours</span>
                <span className="flex items-center gap-1"><BarChart3 className="h-4 w-4" /> {course.level}</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 150 students</span>
              </div>
              <div className="flex items-center gap-4">
                {course.discount_price ? (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-foreground">₹{course.discount_price}</span>
                    <span className="text-lg text-muted-foreground line-through">₹{course.price}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-foreground">₹{course.price}</span>
                )}
                <Button size="lg">Enroll Now</Button>
              </div>
            </div>
            <div className="bg-slate-100 rounded-xl aspect-video flex items-center justify-center">
              <Play className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Course Content</h2>
        <div className="space-y-4">
          {course.modules.map((mod) => (
            <div key={mod.id} className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-border">
                <h3 className="font-semibold text-foreground">{mod.title}</h3>
                <p className="text-sm text-muted-foreground">{mod.lessons.length} lessons</p>
              </div>
              <div className="divide-y divide-border">
                {mod.lessons.map((lesson) => (
                  <div key={lesson.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Play className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{lesson.title}</span>
                      {lesson.is_free && <Badge variant="secondary" className="text-xs">Free</Badge>}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(lesson.video_duration / 60)}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
