'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Plus } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import LessonCard from '@/components/admin/LessonCard'
import type { Module, Lesson } from '@/types'

export default function LessonsPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string>('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'video' as Lesson['content_type'],
    video_url: '',
    pdf_url: '',
    text_content: '',
    duration_minutes: 0,
    is_free: false,
  })
  const [saving, setSaving] = useState(false)

  const fetchModules = useCallback(async () => {
    setLoading(true)
    const data = await getRecords('modules', 'course_id', courseId)

    if (data) {
      const sorted = data.sort((a: any, b: any) => a.order_index - b.order_index).map((m: any) => ({
        ...m,
        lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index),
      }))
      setModules(sorted)
      if (sorted.length > 0 && !selectedModuleId) {
        setSelectedModuleId(sorted[0].id)
      }
    }
    setLoading(false)
  }, [courseId, selectedModuleId])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  useEffect(() => {
    const mod = modules.find(m => m.id === selectedModuleId)
    setLessons(mod?.lessons || [])
  }, [selectedModuleId, modules])

  function openCreate() {
    setEditingLesson(null)
    setFormData({
      title: '',
      content_type: 'video',
      video_url: '',
      pdf_url: '',
      text_content: '',
      duration_minutes: 0,
      is_free: false,
    })
    setShowForm(true)
  }

  function openEdit(lesson: Lesson) {
    setEditingLesson(lesson)
    setFormData({
      title: lesson.title,
      content_type: lesson.content_type || 'video',
      video_url: lesson.video_url || '',
      pdf_url: lesson.pdf_url || '',
      text_content: lesson.text_content || '',
      duration_minutes: lesson.duration_minutes || 0,
      is_free: lesson.is_free,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      title: formData.title,
      content_type: formData.content_type,
      video_url: formData.content_type === 'video' ? formData.video_url : null,
      pdf_url: formData.content_type === 'pdf' ? formData.pdf_url : null,
      text_content: formData.content_type === 'text' ? formData.text_content : null,
      duration_minutes: formData.duration_minutes || null,
      is_free: formData.is_free,
    }

    if (editingLesson) {
      await updateRecord('lessons', editingLesson.id, payload)
    } else {
      await createRecord('lessons', {
        ...payload,
        module_id: selectedModuleId,
        order_index: lessons.length + 1,
      })
    }

    setSaving(false)
    setShowForm(false)
    setEditingLesson(null)
    fetchModules()
  }

  async function handleDelete() {
    if (!deletingLesson) return
    await deleteRecord('lessons', deletingLesson.id)
    setShowDeleteConfirm(false)
    setDeletingLesson(null)
    fetchModules()
  }

  async function handleReorder(lessonId: string, direction: 'up' | 'down') {
    const idx = lessons.findIndex(l => l.id === lessonId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= lessons.length) return

    const current = lessons[idx]
    const swap = lessons[swapIdx]

    await updateRecord('lessons', current.id, { order_index: swap.order_index })
    await updateRecord('lessons', swap.id, { order_index: current.order_index })
    fetchModules()
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin-place/content/${courseId}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
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
              {modules.map(mod => (
                <button
                  key={mod.id}
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
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    index={idx}
                    total={lessons.length}
                    onEdit={() => openEdit(lesson)}
                    onDelete={() => { setDeletingLesson(lesson); setShowDeleteConfirm(true) }}
                    onMoveUp={() => handleReorder(lesson.id, 'up')}
                    onMoveDown={() => handleReorder(lesson.id, 'down')}
                  />
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
              <label className="text-sm font-medium text-slate-700">Content Type</label>
              <select
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value as Lesson['content_type'] })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="video">Video</option>
                <option value="pdf">PDF Notes</option>
                <option value="text">Text Content</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>

            {formData.content_type === 'video' && (
              <div>
                <label className="text-sm font-medium text-slate-700">Video URL</label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="border-slate-300"
                  placeholder="YouTube URL"
                />
              </div>
            )}

            {formData.content_type === 'pdf' && (
              <div>
                <label className="text-sm font-medium text-slate-700">PDF URL</label>
                <Input
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  className="border-slate-300"
                  placeholder="URL to PDF document"
                />
              </div>
            )}

            {formData.content_type === 'text' && (
              <div>
                <label className="text-sm font-medium text-slate-700">Text Content</label>
                <textarea
                  value={formData.text_content}
                  onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  placeholder="Write lesson content here"
                />
              </div>
            )}

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
              Are you sure you want to delete <span className="font-semibold text-slate-900">{deletingLesson?.title}</span>?
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
