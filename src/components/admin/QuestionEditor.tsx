'use client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import type { TestQuestion } from '@/types'

interface QuestionEditorProps {
  index: number
  question: Partial<TestQuestion>
  onChange: (field: string, value: unknown) => void
  onRemove: () => void
  canRemove: boolean
}

export default function QuestionEditor({ index, question, onChange, onRemove, canRemove }: QuestionEditorProps) {
  const options = question.options || ['', '', '', '']

  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-700">Q{index + 1}</span>
        {canRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="hover:text-red-600">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <Input
        placeholder="Question text"
        value={question.question || ''}
        onChange={(e) => onChange('question', e.target.value)}
        className="border-slate-300 mb-3"
      />

      <div className="flex gap-2 mb-3">
        <select
          value={question.question_type || 'mcq'}
          onChange={(e) => {
            const type = e.target.value as TestQuestion['question_type']
            onChange('question_type', type)
            if (type === 'true_false') {
              onChange('options', ['True', 'False'])
            } else if (type === 'mcq' && (!question.options || question.options.length < 4)) {
              onChange('options', ['', '', '', ''])
            }
          }}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="mcq">Multiple Choice</option>
          <option value="true_false">True/False</option>
          <option value="short_answer">Short Answer</option>
        </select>
        <Input
          placeholder="Points"
          type="number"
          value={question.points || 1}
          onChange={(e) => onChange('points', Number(e.target.value))}
          className="border-slate-300 w-20"
          min={1}
        />
      </div>

      {question.question_type === 'mcq' && (
        <div className="space-y-1 mb-3">
          {options.map((opt, j) => (
            <div key={j} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${index}`}
                checked={question.correct_answer === opt}
                onChange={() => onChange('correct_answer', opt)}
                className="accent-blue-600"
                disabled={!opt}
              />
              <Input
                placeholder={`Option ${j + 1}`}
                value={opt}
                onChange={(e) => {
                  const newOptions = [...options]
                  newOptions[j] = e.target.value
                  onChange('options', newOptions)
                  if (question.correct_answer === opt) {
                    onChange('correct_answer', e.target.value)
                  }
                }}
                className="border-slate-300"
              />
            </div>
          ))}
          <p className="text-xs text-slate-400 mt-1">Select the radio button next to the correct answer</p>
        </div>
      )}

      {question.question_type === 'true_false' && (
        <div className="flex gap-4 mb-3">
          {['True', 'False'].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name={`tf-${index}`}
                checked={question.correct_answer === opt}
                onChange={() => onChange('correct_answer', opt)}
                className="accent-blue-600"
              />
              {opt}
            </label>
          ))}
        </div>
      )}

      {question.question_type === 'short_answer' && (
        <Input
          placeholder="Expected answer"
          value={question.correct_answer || ''}
          onChange={(e) => onChange('correct_answer', e.target.value)}
          className="border-slate-300 mb-3"
        />
      )}

      <Input
        placeholder="Explanation (optional)"
        value={question.explanation || ''}
        onChange={(e) => onChange('explanation', e.target.value)}
        className="border-slate-300"
      />
    </div>
  )
}
