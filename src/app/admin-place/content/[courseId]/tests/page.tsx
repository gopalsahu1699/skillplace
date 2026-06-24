'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import TestCard from '@/components/admin/TestCard'
import type { Test } from '@/types'

export default function TestsPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
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
  const [saving, setSaving] = useState(false)

  const fetchTests = useCallback(async () => {
    setLoading(true)
    const data = await getRecords('tests', 'course_id', courseId)

    if (data) {
      const testsWithCount = await Promise.all(
        data.map(async (test: any) => {
          const questions = await getRecords('test_questions', 'test_id', test.id)
          return { ...test, question_count: questions?.length || 0 }
        })
      )
      setTests(testsWithCount.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    }
    setLoading(false)
  }, [courseId])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  function openCreate() {
    setEditingTest(null)
    setFormData({ title: '', description: '', passing_score: 60, max_attempts: 3, time_limit_minutes: 15 })
    setShowForm(true)
  }

  function openEdit(test: Test) {
    setEditingTest(test)
    setFormData({
      title: test.title,
      description: test.description || '',
      passing_score: test.passing_score,
      max_attempts: test.max_attempts,
      time_limit_minutes: test.time_limit_minutes || 15,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    if (editingTest) {
      await updateRecord('tests', editingTest.id, {
        title: formData.title,
        description: formData.description,
        passing_score: formData.passing_score,
        max_attempts: formData.max_attempts,
        time_limit_minutes: formData.time_limit_minutes,
      })
    } else {
      await createRecord('tests', {
        course_id: courseId,
        title: formData.title,
        description: formData.description,
        passing_score: formData.passing_score,
        max_attempts: formData.max_attempts,
        time_limit_minutes: formData.time_limit_minutes,
        is_active: true,
      })
    }

    setSaving(false)
    setShowForm(false)
    setEditingTest(null)
    setFormData({ title: '', description: '', passing_score: 60, max_attempts: 3, time_limit_minutes: 15 })
    fetchTests()
  }

  async function handleDelete() {
    if (!deletingTest) return
    const questions = await getRecords('test_questions', 'test_id', deletingTest.id)
    if (questions) {
      for (const q of questions) {
        await deleteRecord('test_questions', q.id)
      }
    }
    await deleteRecord('tests', deletingTest.id)
    setShowDeleteConfirm(false)
    setDeletingTest(null)
    fetchTests()
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin-place/content/${courseId}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
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
            <TestCard
              key={test.id}
              test={test}
              onEdit={() => openEdit(test)}
              onDelete={() => { setDeletingTest(test); setShowDeleteConfirm(true) }}
            />
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
            <div className="grid grid-cols-3 gap-4">
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
                <label className="text-sm font-medium text-slate-700">Max Attempts</label>
                <input
                  type="number"
                  value={formData.max_attempts}
                  onChange={(e) => setFormData({ ...formData, max_attempts: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={1}
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
