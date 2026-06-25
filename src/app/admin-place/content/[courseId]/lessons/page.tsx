'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Plus, ChevronUp, ChevronDown, Edit, Trash2 } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'

interface DbLesson {
  id: string
  module_id: string
  title: string
  content: string | null
  video_url: string | null
  duration_minutes: number | null
  order_index: number | null
  is_free: boolean | null
  is_active: boolean | null
  created_at: string | null
}

interface DbModule {
  id: string
  course_id: string
  title: string
  description: string | null
  order_index: number | null
  is_active: boolean | null
  created_at: string | null
  lessons?: DbLesson[]
}

export default function LessonsPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [modules, setModules] = useState<DbModule[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string>('')
  const [lessons, setLessons] = useState<DbLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<DbLesson | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingLesson, setDeletingLesson] = useState<DbLesson | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    video_url: '',
    duration_minutes: 0,
    is_free: false,
  })
  const [saving, setSaving] = useState(false)

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getRecords('modules', 'course_id', courseId)

      if (data) {
        const sorted = [...data]
          .sort((a: DbModule, b: DbModule) => (a.order_index || 0) - (b.order_index || 0))
          .map((m: DbModule) => ({
            ...m,
            lessons: [...(m.lessons || [])].sort(
              (a: DbLesson, b: DbLesson) => (a.order_index || 0) - (b.order_index || 0)
            ),
          }))
        setModules(sorted)
        if (sorted.length > 0 && !selectedModuleId) {
          setSelectedModuleId(sorted[0].id)
        }
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }, [courseId, selectedModuleId])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  useEffect(() => {
    const mod = modules.find((m) => m.id === selectedModuleId)
    setLessons(mod?.lessons || [])
  }, [selectedModuleId, modules])

  function openCreate() {
    setEditingLesson(null)
    setFormData({ title: '', content: '', video_url: '', duration_minutes: 0, is_free: false })
    setShowForm(true)
  }

  function openEdit(lesson: DbLesson) {
    setEditingLesson(lesson)
    setFormData({
      title: lesson.title,
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes || 0,
      is_free: lesson.is_free || false,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) return
    setSaving(true)

    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim() || null,
        video_url: formData.video_url.trim() || null,
        duration_minutes: formData.duration_minutes || null,
        is_free: formData.is_free,
      }

      if (editingLesson) {
        await updateRecord('lessons', editingLesson.id, payload)
        notify.lessonUpdated()
      } else {
        await createRecord('lessons', {
          ...payload,
          module_id: selectedModuleId,
          order_index: lessons.length + 1,
          is_active: true,
        })
        notify.lessonCreated()
      }

      setShowForm(false)
      setEditingLesson(null)
      setFormData({ title: '', content: '', video_url: '', duration_minutes: 0, is_free: false })
      fetchModules()
    } catch {
      notify.genericError()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingLesson) return
    try {
      await deleteRecord('lessons', deletingLesson.id)
      notify.lessonDeleted()
      setShowDeleteConfirm(false)
      setDeletingLesson(null)
      fetchModules()
    } catch {
      notify.genericError()
    }
  }

  async function handleReorder(lessonId: string, direction: 'up' | 'down') {
    const idx = lessons.findIndex((l) => l.id === lessonId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= lessons.length) return

    const current = lessons[idx]
    const swap = lessons[swapIdx]

    try {
      await updateRecord('lessons', current.id, { order_index: swap.order_index })
      await updateRecord('lessons', swap.id, { order_index: current.order_index })
      fetchModules()
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
            <h1 className="text-2xl font-bold text-slate-900">Lessons</h1>
            <p className="text-sm text-slate-500 mt-1">Manage lessons within modules</p>
          </div>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={openCreate}
            disabled={!selectedModuleId}
          >
            <Plus className="h-4 w-4" /> Add Lesson
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <p className="text-slate-500">No modules found. Create modules first.</p>
          <Link href={`/admin-place/content/${courseId}/modules`}>
            <Button variant="outline" className="mt-4 border-slate-300">Go to Modules</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-slate-900 mb-3">Modules</h3>
            <div className="space-y-1">
              {modules.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${
                    selectedModuleId === mod.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-medium truncate">{mod.title}</p>
                  <p className={`text-xs ${selectedModuleId === mod.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {mod.lessons?.length || 0} lessons
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {lessons.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                <p className="text-slate-500 mb-4">No lessons in this module yet.</p>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
                  <Plus className="h-4 w-4" /> Add Lesson
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleReorder(lesson.id, 'up')}
                          disabled={idx === 0}
                          className="text-slate-400 hover:text-slate-600 disabled:opacity-30 p-0.5"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReorder(lesson.id, 'down')}
                          disabled={idx === lessons.length - 1}
                          className="text-slate-400 hover:text-slate-600 disabled:opacity-30 p-0.5"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{lesson.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {lesson.duration_minutes ? (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 text-xs">
                              {lesson.duration_minutes} min
                            </Badge>
                          ) : null}
                          {lesson.is_free ? (
                            <Badge variant="secondary" className="bg-green-50 text-green-600 border-0 text-xs">
                              Free
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(lesson)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingLesson(lesson)
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
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Create Lesson'}</DialogTitle>
            <DialogDescription>
              {editingLesson ? 'Update lesson details' : 'Add a new lesson to this module'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-slate-300"
                placeholder="Lesson title"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Lesson content (optional)"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Video URL</label>
              <Input
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="border-slate-300"
                placeholder="YouTube or video URL (optional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Duration (minutes)</label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                  className="border-slate-300"
                  min={0}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formData.is_free}
                    onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                    className="rounded"
                  />
                  Free preview
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-300">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? 'Saving...' : editingLesson ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">{deletingLesson?.title}</span>?
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
