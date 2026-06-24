'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HelpCircle, Clock, Target, Edit, Trash2 } from 'lucide-react'
import type { Test } from '@/types'

interface TestCardProps {
  test: Test & { question_count?: number }
  onEdit?: () => void
  onDelete?: () => void
}

export default function TestCard({ test, onEdit, onDelete }: TestCardProps) {
  return (
    <Card className="border-slate-200 hover:bg-slate-50 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
          <HelpCircle className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">{test.title}</p>
          <div className="flex items-center gap-3 mt-1">
            {test.question_count !== undefined && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <HelpCircle className="h-3 w-3" /> {test.question_count} questions
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Target className="h-3 w-3" /> {test.passing_score}% pass
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" /> {test.time_limit_minutes || '∞'} min
            </span>
            <Badge
              variant="secondary"
              className={`border-0 text-xs ${
                test.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {test.is_active ? 'Active' : 'Inactive'}
            </Badge>
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
      </CardContent>
    </Card>
  )
}
