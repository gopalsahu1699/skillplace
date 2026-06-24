'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Save, HelpCircle, Clock, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import QuestionEditor from './QuestionEditor'
import type { Test, TestQuestion } from '@/types'

interface TestEditorProps {
  courseId: string
  tests: Test[]
  onRefresh: () => void
}

export default function TestEditor({ courseId, tests, onRefresh }: TestEditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingTest, setDeletingTest] = useState<Test | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passing_score: 60,
    max_attempts: 3,
    time_limit_minutes: 15,
  })
  const [questions, setQuestions] = useState<Partial<TestQuestion>[]>([])
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditingTest(null)
    setFormData({ title: '', description: '', passing_score: 60, max_attempts: 3, time_limit_minutes: 15 })
    setQuestions([{
      question: '',
      question_type: 'mcq',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
      order_index: 1,
      explanation: '',
    }])
    setShowForm(true)
  }

  async function openEdit(test: Test) {
    setEditingTest(test)
    setFormData({
      title: test.title,
      description: test.description || '',
      passing_score: test.passing_score,
      max_attempts: test.max_attempts,
      time_limit_minutes: test.time_limit_minutes || 15,
    })
    const { data } = await supabase
      .from('test_questions')
      .select('*')
      .eq('test_id', test.id)
      .order('order_index')
    setQuestions(data || [])
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    let testId: string

    if (editingTest) {
      await supabase.from('tests').update({
        title: formData.title,
        description: formData.description,
        passing_score: formData.passing_score,
        max_attempts: formData.max_attempts,
        time_limit_minutes: formData.time_limit_minutes,
      }).eq('id', editingTest.id)
      testId = editingTest.id
      await supabase.from('test_questions').delete().eq('test_id', testId)
    } else {
      const { data } = await supabase.from('tests').insert({
        course_id: courseId,
        title: formData.title,
        description: formData.description,
        passing_score: formData.passing_score,
        max_attempts: formData.max_attempts,
        time_limit_minutes: formData.time_limit_minutes,
        is_active: true,
      }).select().single()
      testId = data?.id
    }

    if (testId) {
      const validQuestions = questions
        .filter((q) => q.question && q.correct_answer)
        .map((q, i) => ({
          test_id: testId,
          question: q.question!,
          question_type: q.question_type || 'mcq',
          options: q.options || null,
          correct_answer: q.correct_answer!,
          points: q.points || 1,
          order_index: i + 1,
          explanation: q.explanation || null,
        }))

      if (validQuestions.length > 0) {
        await supabase.from('test_questions').insert(validQuestions)
      }
    }

    setSaving(false)
    setShowForm(false)
    setEditingTest(null)
    setQuestions([])
    onRefresh()
  }

  async function handleDelete() {
    if (!deletingTest) return
    await supabase.from('test_questions').delete().eq('test_id', deletingTest.id)
    await supabase.from('tests').delete().eq('id', deletingTest.id)
    setShowDeleteConfirm(false)
    setDeletingTest(null)
    onRefresh()
  }

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      question_type: 'mcq',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
      order_index: questions.length + 1,
      explanation: '',
    }])
  }

  const updateQuestion = (index: number, field: string, value: unknown) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">Tests & Quizzes</h3>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Create Test
        </Button>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">No tests yet. Create your first test.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <Card key={test.id} className="border-slate-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{test.title}</p>
                  <div className="flex items-center gap-3 mt-1">
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
                    onClick={() => openEdit(test)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeletingTest(test)
                      setShowDeleteConfirm(true)
                    }}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTest ? 'Edit Test' : 'Create Test'}</DialogTitle>
            <DialogDescription>
              {editingTest ? 'Update test settings and questions' : 'Create a new test with questions'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700">Test Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-slate-300"
                  placeholder="Test title"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Passing Score (%)</label>
                <Input
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: Number(e.target.value) })}
                  className="border-slate-300"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Max Attempts</label>
                <Input
                  type="number"
                  value={formData.max_attempts}
                  onChange={(e) => setFormData({ ...formData, max_attempts: Number(e.target.value) })}
                  className="border-slate-300"
                  min={1}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Time Limit (minutes)</label>
                <Input
                  type="number"
                  value={formData.time_limit_minutes}
                  onChange={(e) => setFormData({ ...formData, time_limit_minutes: Number(e.target.value) })}
                  className="border-slate-300"
                  min={1}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-900">Questions ({questions.length})</h4>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-1 border-slate-300">
                  <Plus className="h-3 w-3" /> Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((q, i) => (
                  <QuestionEditor
                    key={i}
                    index={i}
                    question={q}
                    onChange={(field, value) => updateQuestion(i, field, value)}
                    onRemove={() => removeQuestion(i)}
                    canRemove={questions.length > 1}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-300">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : editingTest ? 'Update' : 'Create'} Test
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-900">{deletingTest?.title}</span>?
              All questions will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-slate-300">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
