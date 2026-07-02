'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Edit, Trash2, HelpCircle } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog'

interface DbTest {
  id: string
  course_id: string
  title: string
  description: string | null
  passing_score: number | null
  time_limit_minutes: number | null
  is_active: boolean | null
  created_at: string | null
  question_count?: number
}

export default function TestsPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [tests, setTests] = useState<DbTest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTest, setEditingTest] = useState<DbTest | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingTest, setDeletingTest] = useState<DbTest | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passing_score: 70,
    time_limit_minutes: 15,
  })
  const [saving, setSaving] = useState(false)

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRecords('tests', 'course_id', courseId)

      if (data) {
        const testsWithCount = await Promise.all(
          data.map(async (test: DbTest) => {
            const questions = await getRecords('test_questions', 'test_id', test.id)
            return { ...test, question_count: questions?.length || 0 }
          })
        )
        setTests(
          testsWithCount.sort(
            (a: DbTest, b: DbTest) =>
              new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
          )
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tests')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    Promise.resolve().then(() => fetchTests())
  }, [fetchTests])

  function openCreate() {
    setEditingTest(null)
    setFormData({ title: '', description: '', passing_score: 70, time_limit_minutes: 15 })
    setShowForm(true)
  }

  function openEdit(test: DbTest) {
    setEditingTest(test)
    setFormData({
      title: test.title,
      description: test.description || '',
      passing_score: test.passing_score || 70,
      time_limit_minutes: test.time_limit_minutes || 15,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) return
    setSaving(true)

    try {
      if (editingTest) {
        await updateRecord('tests', editingTest.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          passing_score: formData.passing_score,
          time_limit_minutes: formData.time_limit_minutes || null,
        })
        notify.testUpdated()
      } else {
        await createRecord('tests', {
          course_id: courseId,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          passing_score: formData.passing_score,
          time_limit_minutes: formData.time_limit_minutes || null,
          is_active: true,
        })
        notify.testCreated()
      }

      setShowForm(false)
      setEditingTest(null)
      setFormData({ title: '', description: '', passing_score: 70, time_limit_minutes: 15 })
      fetchTests()
    } catch {
      notify.genericError()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingTest) return
    try {
      const questions = await getRecords('test_questions', 'test_id', deletingTest.id)
      if (questions) {
        for (const q of questions) {
          await deleteRecord('test_questions', q.id)
        }
      }
      await deleteRecord('tests', deletingTest.id)
      notify.testDeleted()
      setShowDeleteConfirm(false)
      setDeletingTest(null)
      fetchTests()
    } catch {
      notify.genericError()
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin-place/content/${courseId}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tests & Quizzes</h1>
            <p className="text-sm text-slate-500 mt-1">Create and manage tests for this course</p>
          </div>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create Test
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchTests} className="border-slate-300">
            Retry
          </Button>
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <p className="text-slate-500 mb-4">No tests yet. Create your first test.</p>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create Test
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin-place/content/${courseId}/tests/${test.id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {test.title}
                  </Link>
                  {test.description && (
                    <p className="text-sm text-slate-500 truncate mt-0.5">{test.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 text-xs">
                      {test.question_count || 0} questions
                    </Badge>
                    <Badge variant="secondary" className="bg-green-50 text-green-600 border-0 text-xs">
                      {test.passing_score || 70}% pass
                    </Badge>
                    {test.time_limit_minutes ? (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-0 text-xs">
                        {test.time_limit_minutes} min
                      </Badge>
                    ) : null}
                    <Badge
                      variant="secondary"
                      className={`border-0 text-xs ${
                        test.is_active !== false
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {test.is_active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
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
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTest ? 'Edit Test' : 'Create Test'}</DialogTitle>
            <DialogDescription>
              {editingTest ? 'Update test settings' : 'Create a new test for this course'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-slate-300"
                placeholder="Test title"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Passing Score (%)</label>
                <input
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={0}
                  max={100}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Time Limit (min)</label>
                <input
                  type="number"
                  value={formData.time_limit_minutes}
                  onChange={(e) => setFormData({ ...formData, time_limit_minutes: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={1}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-300">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? 'Saving...' : editingTest ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Test"
        itemName={deletingTest?.title || 'this item'}
      />
    </div>
  )
}
