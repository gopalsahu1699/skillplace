'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import VideoUploader from '@/components/admin/VideoUploader'
import PDFUploader from '@/components/admin/PDFUploader'
import type { Lesson } from '@/types'

export default function LessonEditorPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const moduleId = params.moduleId as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'video' as Lesson['content_type'],
    video_url: '',
    pdf_url: '',
    text_content: '',
    duration_minutes: 0,
    is_free: false,
    is_downloadable: true,
  })

  const fetchLesson = useCallback(async () => {
    setLoading(true)
    const data = await getRecord('lessons', lessonId)

    if (data) {
      setLesson(data)
      setFormData({
        title: data.title,
        description: data.description || '',
        content_type: data.content_type || 'video',
        video_url: data.video_url || '',
        pdf_url: data.pdf_url || '',
        text_content: data.text_content || '',
        duration_minutes: data.duration_minutes || 0,
        is_free: data.is_free,
        is_downloadable: data.is_downloadable,
      })
    }
    setLoading(false)
  }, [lessonId])

  useEffect(() => {
    fetchLesson()
  }, [fetchLesson])

  async function handleSave() {
    setSaving(true)
    await updateRecord('lessons', lessonId, {
      title: formData.title,
      description: formData.description || null,
      content_type: formData.content_type,
      video_url: formData.content_type === 'video' ? formData.video_url : null,
      pdf_url: formData.content_type === 'pdf' ? formData.pdf_url : null,
      text_content: formData.content_type === 'text' ? formData.text_content : null,
      duration_minutes: formData.duration_minutes || null,
      is_free: formData.is_free,
      is_downloadable: formData.is_downloadable,
    })
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this lesson?')) return
    await deleteRecord('lessons', lessonId)
    router.push(`/admin-place/content/${courseId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Lesson not found</p>
        <Link href={`/admin-place/content/${courseId}`}>
          <Button variant="outline" className="mt-4 border-slate-300">Back to Course</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin-place/content/${courseId}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Edit Lesson</h1>
          <p className="text-sm text-slate-500">Module: {moduleId}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="border-slate-300 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Lesson Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-700">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border-slate-300 mt-1"
              placeholder="Lesson title"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
              rows={2}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Content Type</label>
            <select
              value={formData.content_type}
              onChange={(e) => setFormData({ ...formData, content_type: e.target.value as Lesson['content_type'] })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
            >
              <option value="video">Video</option>
              <option value="pdf">PDF Notes</option>
              <option value="text">Text Content</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          {formData.content_type === 'video' && (
            <VideoUploader
              value={formData.video_url}
              onChange={(url) => setFormData({ ...formData, video_url: url })}
            />
          )}

          {formData.content_type === 'pdf' && (
            <PDFUploader
              value={formData.pdf_url}
              onChange={(url) => setFormData({ ...formData, pdf_url: url })}
            />
          )}

          {formData.content_type === 'text' && (
            <div>
              <label className="text-sm font-medium text-slate-700">Text Content</label>
              <textarea
                value={formData.text_content}
                onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                rows={10}
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
                className="border-slate-300 mt-1"
                min={0}
              />
            </div>
            <div className="flex items-end gap-6">
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link href={`/admin-place/content/${courseId}`}>
              <Button variant="outline" className="border-slate-300">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
