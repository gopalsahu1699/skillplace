'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, GripVertical, Video, FileText, HelpCircle, BookOpen, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Lesson } from '@/types'

interface LessonEditorProps {
  moduleId: string
  lessons: Lesson[]
  onRefresh: () => void
  onEditQuiz?: (lessonId: string) => void
}

const contentTypeConfig = {
  video: { icon: Video, label: 'Video', color: 'text-blue-500', bg: 'bg-blue-50' },
  pdf: { icon: FileText, label: 'PDF', color: 'text-red-500', bg: 'bg-red-50' },
  quiz: { icon: HelpCircle, label: 'Quiz', color: 'text-purple-500', bg: 'bg-purple-50' },
  text: { icon: BookOpen, label: 'Text', color: 'text-green-500', bg: 'bg-green-50' },
}

export default function LessonEditor({ moduleId, lessons, onRefresh, onEditQuiz }: LessonEditorProps) {
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
    is_downloadable: true,
  })
  const [saving, setSaving] = useState(false)

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
      is_downloadable: true,
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
      is_downloadable: lesson.is_downloadable,
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
      is_downloadable: formData.is_downloadable,
    }

    if (editingLesson) {
      await supabase.from('lessons').update(payload).eq('id', editingLesson.id)
    } else {
      const maxOrder = lessons.length
      await supabase.from('lessons').insert({
        ...payload,
        module_id: moduleId,
        order_index: maxOrder + 1,
      })
    }

    setSaving(false)
    setShowForm(false)
    setEditingLesson(null)
    onRefresh()
  }

  async function handleDelete() {
    if (!deletingLesson) return
    await supabase.from('lessons').delete().eq('id', deletingLesson.id)
    setShowDeleteConfirm(false)
    setDeletingLesson(null)
    onRefresh()
  }

  async function handleReorder(lessonId: string, direction: 'up' | 'down') {
    const idx = lessons.findIndex((l) => l.id === lessonId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= lessons.length) return

    const current = lessons[idx]
    const swap = lessons[swapIdx]

    await supabase.from('lessons').update({ order_index: swap.order_index }).eq('id', current.id)
    await supabase.from('lessons').update({ order_index: current.order_index }).eq('id', swap.id)
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-700">Lessons</h4>
        <Button variant="outline" size="sm" className="gap-1 border-slate-300" onClick={openCreate}>
          <Plus className="h-3 w-3" /> Add Lesson
        </Button>
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">No lessons yet</p>
      ) : (
        <div className="space-y-1">
          {lessons.map((lesson, idx) => {
            const config = contentTypeConfig[lesson.content_type || 'video']
            const Icon = config.icon
            return (
              <div key={lesson.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 group">
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleReorder(lesson.id, 'up')}
                    disabled={idx === 0}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <GripVertical className="h-3 w-3 -rotate-90" />
                  </button>
                  <button
                    onClick={() => handleReorder(lesson.id, 'down')}
                    disabled={idx === lessons.length - 1}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <GripVertical className="h-3 w-3 rotate-90" />
                  </button>
                </div>
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${config.bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
                <span className="text-sm text-slate-700 flex-1 min-w-0 truncate">{lesson.title}</span>
                {lesson.is_free && (
                  <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 border-0">Free</Badge>
                )}
                {lesson.duration_minutes ? (
                  <span className="text-xs text-slate-400">{lesson.duration_minutes}m</span>
                ) : null}
                {lesson.content_type === 'quiz' && onEditQuiz && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => onEditQuiz(lesson.id)}
                  >
                    <Edit className="h-3 w-3" />
                    Quiz
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(lesson)}
                  className="hover:bg-blue-50 hover:text-blue-600"
                >
                  <Edit className="h-3.5 w-3.5" />
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
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
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
                  placeholder="YouTube, Vimeo, or direct link"
                />
                {formData.video_url && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200">
                    <iframe
                      src={formData.video_url.includes('youtube.com') || formData.video_url.includes('youtu.be')
                        ? formData.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                        : formData.video_url
                      }
                      className="w-full aspect-video"
                      allowFullScreen
                      title="Video preview"
                    />
                  </div>
                )}
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
                {formData.pdf_url && (
                  <a
                    href={formData.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> Preview PDF
                  </a>
                )}
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
                  placeholder="Write lesson content here (HTML supported)"
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
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formData.is_free}
                    onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                    className="rounded"
                  />
                  Free preview
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formData.is_downloadable}
                    onChange={(e) => setFormData({ ...formData, is_downloadable: e.target.checked })}
                    className="rounded"
                  />
                  Downloadable
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

      {/* Delete Confirmation */}
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
