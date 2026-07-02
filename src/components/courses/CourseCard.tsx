import { Clock, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Course } from '@/types'
import { SafeImg } from '@/components/ui/safe-image'

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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
        {course.thumbnail_url ? (
          <SafeImg src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs text-slate-400">No thumbnail</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className={`${levelColors[course.level]} border-0`}>
            {course.level}
          </Badge>
          {course.branches && (
            <Badge variant="outline" className="border-slate-200 text-slate-600">{course.branches.name}</Badge>
          )}
        </div>
        <h3 className="font-bold text-slate-900 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">{course.title}</h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
          {course.short_description || course.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          {course.duration_hours && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" /> {course.duration_hours}h
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-slate-400" /> {course.level}
          </span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            {course.discount_price ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">₹{course.discount_price}</span>
                <span className="text-sm text-slate-400 line-through">₹{course.price}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-slate-900">
                {course.price === 0 ? 'Free' : `₹${course.price}`}
              </span>
            )}
          </div>
          <Link href={`/courses/${course.slug}`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm w-full sm:w-auto">View Course</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
