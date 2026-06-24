'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, Layers, FileText, HelpCircle, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { Module, Lesson } from '@/types'

interface SidebarProps {
  courseId: string
  modules: (Module & { lessons: Lesson[] })[]
  selectedModuleId?: string
  selectedLessonId?: string
  onSelectModule?: (moduleId: string) => void
}

export default function Sidebar({ courseId, modules, selectedModuleId, selectedLessonId, onSelectModule }: SidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
    onSelectModule?.(moduleId)
  }

  const contentTypeIcon = {
    video: <FileText className="h-3.5 w-3.5 text-blue-500" />,
    pdf: <FileText className="h-3.5 w-3.5 text-red-500" />,
    quiz: <HelpCircle className="h-3.5 w-3.5 text-purple-500" />,
    text: <BookOpen className="h-3.5 w-3.5 text-green-500" />,
  }

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-200">
        <Link href="/admin-place/content" className="text-sm text-blue-600 hover:underline">
          ← Back to Courses
        </Link>
        <h3 className="text-sm font-bold text-slate-900 mt-2">Course Content</h3>
      </div>

      <nav className="p-2">
        {modules.map((module) => {
          const isExpanded = expandedModules.has(module.id) || selectedModuleId === module.id
          return (
            <div key={module.id} className="mb-1">
              <button
                onClick={() => toggleModule(module.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                  selectedModuleId === module.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                <Layers className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{module.title}</span>
              </button>

              {isExpanded && module.lessons && module.lessons.length > 0 && (
                <div className="ml-6 mt-1 space-y-0.5">
                  {module.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={`/admin-place/content/${courseId}/lessons/${lesson.id}`}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                        selectedLessonId === lesson.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      {contentTypeIcon[lesson.content_type || 'video']}
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {modules.length === 0 && (
          <p className="text-sm text-slate-400 px-3 py-4">No modules yet</p>
        )}
      </nav>
    </div>
  )
}
