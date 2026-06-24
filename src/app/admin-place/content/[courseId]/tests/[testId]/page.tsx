'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import QuestionEditor from '@/components/admin/QuestionEditor'
import type { Test, TestQuestion } from '@/types'

export default function TestDetailPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const testId = params.testId as string
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Partial<TestQuestion>[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passing_score: 60,
    max_attempts: 3,
    time_limit_minutes: 15,
    is_active: true,
  })

  const fetchTest = useCallback(async () => {
    setLoading(true)
    const testData = await getRecord('tests', testId)

    if (testData) {
      setTest(testData)
      setFormData({
        title: testData.title,
        description: testData.description || '',
        passing_score: testData.passing_score,
        max_attempts: testData.max_attempts,
        time_limit_minutes: testData.time_limit_minutes || 15,
        is_active: testData.is_active,
      })

      const questionData = await getRecords('test_questions', 'test_id', testId)
      setQuestions((questionData || []).sort((a: any, b: any) => a.order_index - b.order_index))
    }
    setLoading(false)
  }, [testId])

  useEffect(() => {
    fetchTest()
  }, [fetchTest])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await updateRecord('tests', testId, {
      title: formData.title,
      description: formData.description,
      passing_score: formData.passing_score,
      max_attempts: formData.max_attempts,
      time_limit_minutes: formData.time_limit_minutes,
      is_active: formData.is_active,
    })

    const existingQuestions = await getRecords('test_questions', 'test_id', testId)
    if (existingQuestions) {
      for (const q of existingQuestions) {
        await deleteRecord('test_questions', q.id)
      }
    }

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
      await createRecord('test_questions', validQuestions)
    }

    setSaving(false)
    fetchTest()
  }

  async function handleDeleteTest() {
    const existingQuestions = await getRecords('test_questions', 'test_id', testId)
    if (existingQuestions) {
      for (const q of existingQuestions) {
        await deleteRecord('test_questions', q.id)
      }
    }
    await deleteRecord('tests', testId)
    setShowDeleteConfirm(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Test not found</p>
        <Link href={`/admin-place/content/${courseId}/tests`}>
          <Button variant="outline" className="mt-4 border-slate-300">Back to Tests</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin-place/content/${courseId}/tests`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Tests
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Test</h1>
            <p className="text-sm text-slate-500">{test.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Test Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-slate-300"
                  placeholder="Test title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
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
              <div>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  Active
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Questions ({questions.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1 border-slate-300">
                <Plus className="h-3 w-3" /> Add Question
              </Button>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">No questions yet.</p>
                  <Button onClick={addQuestion} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4" /> Add First Question
                  </Button>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-900">{test.title}</span>?
              All questions will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-slate-300">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTest} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
