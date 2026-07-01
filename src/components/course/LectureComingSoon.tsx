'use client'

import { Play, FileText, HelpCircle, PenTool, BookOpen, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type LessonContentType = 'video' | 'pdf' | 'quiz' | 'text' | 'assignment'

interface LectureComingSoonProps {
  contentType: LessonContentType
  lessonTitle?: string
  className?: string
}

const contentConfig: Record<
  LessonContentType,
  { icon: typeof Play; label: string; message: string; color: string; bgColor: string }
> = {
  video: {
    icon: Play,
    label: 'Video',
    message: 'Video content is being prepared. Check back soon!',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  pdf: {
    icon: FileText,
    label: 'PDF Document',
    message: 'PDF document is being prepared. Check back soon!',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  quiz: {
    icon: HelpCircle,
    label: 'Quiz',
    message: 'Quiz questions are being prepared. Check back soon!',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  text: {
    icon: BookOpen,
    label: 'Reading Material',
    message: 'Reading material is being prepared. Check back soon!',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  assignment: {
    icon: PenTool,
    label: 'Assignment',
    message: 'Assignment details are being prepared. Check back soon!',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
}

export default function LectureComingSoon({
  contentType,
  lessonTitle,
  className,
}: LectureComingSoonProps) {
  const config = contentConfig[contentType] || contentConfig.video
  const Icon = config.icon

  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-2xl overflow-hidden',
        className
      )}
    >
      <div className="p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div
          className={cn(
            'inline-flex h-16 w-16 rounded-2xl items-center justify-center mb-5',
            config.bgColor
          )}
        >
          <Icon className={cn('h-8 w-8', config.color)} />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {config.label} Coming Soon
        </h3>

        {lessonTitle && (
          <p className="text-sm text-slate-500 mb-2">{lessonTitle}</p>
        )}

        <p className="text-sm text-slate-500 max-w-sm">{config.message}</p>

        <div className="flex items-center gap-1.5 mt-5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>Content is being prepared by the instructor</span>
        </div>
      </div>
    </div>
  )
}
