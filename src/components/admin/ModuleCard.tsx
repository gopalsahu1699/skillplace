'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GripVertical, ChevronUp, ChevronDown, Edit, Trash2 } from 'lucide-react'
import type { Module, Lesson } from '@/types'

interface ModuleCardProps {
  module: Module & { lessons?: Lesson[] }
  index: number
  total: number
  isSelected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export default function ModuleCard({
  module,
  index,
  total,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ModuleCardProps) {
  const lessonCount = module.lessons?.length || 0

  return (
    <Card
      className={`border-slate-200 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'hover:bg-slate-50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp?.() }}
              disabled={index === 0}
              className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown?.() }}
              disabled={index === total - 1}
              className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <GripVertical className="h-4 w-4 text-slate-300" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900">{module.title}</p>
            {module.description && (
              <p className="text-sm text-slate-500 truncate mt-0.5">{module.description}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
