'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { getRecord, getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'

interface DbTest {
  id: string
  course_id: string
  title: string
  description: string | null
  passing_score: number | null
  time_limit_minutes: number | null
  is_active: boolean | null
  created_at: string | null
}

interface DbTestQuestion {
  id: string
  test_id: string
  question: string
  options: string[] | null
  correct_answer: number | null
  order_index: number | null
  created_at: string | null
}

interface QuestionDraft {
  id?: string
  question: string
  options: string[]
  correct_answer: number
  order_index: number
}

export default function TestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const testId = params.testId as string
  const [test, setTest] = useState<DbTest | null>(null)
  const [questions, setQuestions] = useState<QuestionDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passing_score: 70,
    time_limit_minutes: 15,
    is_active: true,
  })

  const fetchTest = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const testData = await getRecord('tests', testId)

      if (testData) {
        setTest(testData)
        setFormData({
          title: testData.title || '',
          description: testData.description || '',
          passing_score: testData.passing_score || 70,
          time_limit_minutes: testData.time_limit_minutes || 15,
          is_active: testData.is_active !== false,
        })

        const questionData = await getRecords('test_questions', 'test_id', testId)
        const sorted = [...(questionData || [])].sort(
          (a: DbTestQuestion, b: DbTestQuestion) => (a.order_index || 0) - (b.order_index || 0)
        )
        setQuestions(
          sorted.map((q: DbTestQuestion) => ({
            id: q.id,
            question: q.question || '',
            options: q.options || ['', '', '', ''],
            correct_answer: q.correct_answer || 0,
            order_index: q.order_index || 0,
          }))
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test')
    } finally {
      setLoading(false)
    }
  }, [testId])

  useEffect(() => {
    fetchTest()
  }, [fetchTest])

  async function handleSaveTest(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) return
    setSaving(true)

    try {
      await updateRecord('tests', testId, {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        passing_score: formData.passing_score,
        time_limit_minutes: formData.time_limit_minutes || null,
        is_active: formData.is_active,
      })

      const existingQuestions = await getRecords('test_questions', 'test_id', testId)
      if (existingQuestions) {
        for (const q of existingQuestions) {
          await deleteRecord('test_questions', q.id)
        }
      }

      const validQuestions = questions
        .filter((q) => q.question.trim())
        .map((q, i) => ({
          test_id: testId,
          question: q.question.trim(),
          options: q.options.filter((o) => o.trim()),
          correct_answer: q.correct_answer,
          order_index: i + 1,
        }))

      if (validQuestions.length > 0) {
        await createRecord('test_questions', validQuestions)
      }

      notify.testUpdated()
      fetchTest()
    } catch {
      notify.genericError()
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTest() {
    try {
      const existingQuestions = await getRecords('test_questions', 'test_id', testId)
      if (existingQuestions) {
        for (const q of existingQuestions) {
          await deleteRecord('test_questions', q.id)
        }
      }
      await deleteRecord('tests', testId)
      notify.testDeleted()
      setShowDeleteConfirm(false)
      router.push(`/admin-place/content/${courseId}/tests`)
    } catch {
      notify.genericError()
    }
  }

  function addQuestion() {
    setQuestions([
      ...questions,
      {
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        order_index: questions.length + 1,
      },
    ])
  }

  function updateQuestion(index: number, field: keyof QuestionDraft, value: unknown) {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">{error || 'Test not found'}</p>
        <Link href={`/admin-place/content/${courseId}/tests`}>
          <Button variant="outline" className="mt-4 border-slate-300">Back to Tests</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin-place/content/${courseId}/tests`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3"
        >
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
            <Button
              onClick={handleSaveTest}
              disabled={saving}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
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
                  onChange={(e) =>
                    setFormData({ ...formData, passing_score: Number(e.target.value) })
                  }
                  className="border-slate-300"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Time Limit (minutes)</label>
                <Input
                  type="number"
                  value={formData.time_limit_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, time_limit_minutes: Number(e.target.value) })
                  }
                  className="border-slate-300"
                  min={0}
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
              <Button
                variant="outline"
                size="sm"
                onClick={addQuestion}
                className="gap-1 border-slate-300"
              >
                <Plus className="h-3 w-3" /> Add Question
              </Button>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-4">No questions yet.</p>
                  <Button
                    onClick={addQuestion}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" /> Add First Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-700">Q{i + 1}</span>
                        {questions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(i)}
                            className="hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      <Input
                        placeholder="Question text"
                        value={q.question}
                        onChange={(e) => updateQuestion(i, 'question', e.target.value)}
                        className="border-slate-300 mb-3"
                      />

                      <div className="space-y-1 mb-3">
                        {(q.options || []).map((opt, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${i}`}
                              checked={q.correct_answer === j}
                              onChange={() => updateQuestion(i, 'correct_answer', j)}
                              className="accent-blue-600"
                            />
                            <Input
                              placeholder={`Option ${j + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const newOptions = [...q.options]
                                newOptions[j] = e.target.value
                                updateQuestion(i, 'options', newOptions)
                              }}
                              className="border-slate-300"
                            />
                            {q.options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newOptions = q.options.filter((_, k) => k !== j)
                                  const newCorrect =
                                    q.correct_answer >= newOptions.length
                                      ? 0
                                      : q.correct_answer > j
                                        ? q.correct_answer - 1
                                        : q.correct_answer
                                  updateQuestion(i, 'options', newOptions)
                                  updateQuestion(i, 'correct_answer', newCorrect)
                                }}
                                className="hover:text-red-600 shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuestion(i, 'options', [...q.options, ''])}
                          className="text-blue-600 hover:text-blue-700 mt-1"
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Option
                        </Button>
                      </div>
                      <p className="text-xs text-slate-400">
                        Select the radio button next to the correct answer
                      </p>
                    </div>
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
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">{test.title}</span>?
              All questions will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTest}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
