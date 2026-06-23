import { Clock, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Course } from '@/types'

interface CourseCardProps {
  course: Course
}

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
      <div className="h-48 bg-slate-100 flex items-center justify-center">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-muted-foreground text-sm">No thumbnail</span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className={levelColors[course.level]}>
            {course.level}
          </Badge>
          {course.category && (
            <Badge variant="outline">{course.category.name}</Badge>
          )}
        </div>
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{course.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {course.short_description || course.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {course.duration_hours && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {course.duration_hours}h
            </span>
          )}
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" /> {course.level}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {course.discount_price ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">₹{course.discount_price}</span>
                <span className="text-sm text-muted-foreground line-through">₹{course.price}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-foreground">
                {course.price === 0 ? 'Free' : `₹${course.price}`}
              </span>
            )}
          </div>
          <Link href={`/courses/${course.slug}`}>
            <Button size="sm">View Course</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
