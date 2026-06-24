'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight, Play, FileText, HelpCircle, CheckCircle, Lock, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Module, Lesson } from '@/types'

interface LessonSidebarProps {
  modules: Module[]
  currentLessonId: string
  completedLessonIds: Set<string>
  onLessonClick: (lesson: Lesson) => void
  isEnrolled: boolean
}

function getLessonIcon(type: Lesson['content_type'], isCompleted: boolean) {
  if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-600" />
  switch (type) {
    case 'video': return <Play className="h-4 w-4" />
    case 'pdf': return <FileText className="h-4 w-4" />
    case 'quiz': return <HelpCircle className="h-4 w-4" />
    case 'text': return <FileText className="h-4 w-4" />
    default: return <Play className="h-4 w-4" />
  }
}

export default function LessonSidebar({ modules, currentLessonId, completedLessonIds, onLessonClick, isEnrolled }: LessonSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const first = modules[0]
    return first ? new Set([first.id]) : new Set()
  })

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const sortedModules = [...modules].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm">Course Content</h3>
        <p className="text-xs text-slate-500 mt-1">
          {modules.length} modules
        </p>
      </div>

      <div className="p-2">
        {sortedModules.map((module) => {
          const isExpanded = expandedModules.has(module.id)
          const lessons = module.lessons
            ? [...module.lessons].sort((a, b) => a.order_index - b.order_index)
            : []
          const completedInModule = lessons.filter((l) => completedLessonIds.has(l.id)).length

          return (
            <div key={module.id} className="mb-1">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{module.title}</p>
                  <p className="text-xs text-slate-500">
                    {completedInModule}/{lessons.length} lessons
                  </p>
                </div>
              </button>

              {isExpanded && (
                <div className="ml-4 space-y-0.5">
                  {lessons.map((lesson) => {
                    const isCompleted = completedLessonIds.has(lesson.id)
                    const isCurrent = lesson.id === currentLessonId
                    const isLocked = !isEnrolled && !lesson.is_free

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => !isLocked && onLessonClick(lesson)}
                        disabled={isLocked}
                        className={cn(
                          'w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-all',
                          isCurrent && 'bg-blue-50 border border-blue-200',
                          !isCurrent && !isLocked && 'hover:bg-slate-50',
                          isLocked && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="shrink-0">
                          {isLocked ? (
                            <Lock className="h-4 w-4 text-slate-400" />
                          ) : (
                            getLessonIcon(lesson.content_type, isCompleted)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm truncate',
                            isCurrent ? 'font-semibold text-blue-700' : 'text-slate-700'
                          )}>
                            {lesson.title}
                          </p>
                          {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                            <p className="text-xs text-slate-400">{lesson.duration_minutes} min</p>
                          )}
                        </div>
                        {lesson.is_free && !isEnrolled && (
                          <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 border-0 shrink-0">
                            <Sparkles className="h-3 w-3 mr-0.5" />
                            Free
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
