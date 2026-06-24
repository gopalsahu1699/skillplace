'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, FileText, HelpCircle, BookOpen, GripVertical, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import type { Lesson } from '@/types'

const contentTypeConfig = {
  video: { icon: Video, label: 'Video', color: 'text-blue-500', bg: 'bg-blue-50' },
  pdf: { icon: FileText, label: 'PDF', color: 'text-red-500', bg: 'bg-red-50' },
  quiz: { icon: HelpCircle, label: 'Quiz', color: 'text-purple-500', bg: 'bg-purple-50' },
  text: { icon: BookOpen, label: 'Text', color: 'text-green-500', bg: 'bg-green-50' },
}

interface LessonCardProps {
  lesson: Lesson
  index: number
  total: number
  onEdit?: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export default function LessonCard({
  lesson,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: LessonCardProps) {
  const config = contentTypeConfig[lesson.content_type || 'video']
  const Icon = config.icon

  return (
    <Card className="border-slate-200 hover:bg-slate-50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <GripVertical className="h-4 w-4 text-slate-300" />
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${config.bg}`}>
            <Icon className={`h-4.5 w-4.5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900">{lesson.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={`border-0 text-xs ${config.bg} ${config.color}`}>
                {config.label}
              </Badge>
              {lesson.is_free && (
                <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 border-0">Free</Badge>
              )}
              {lesson.duration_minutes ? (
                <span className="text-xs text-slate-400">{lesson.duration_minutes}m</span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
