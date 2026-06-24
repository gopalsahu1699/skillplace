'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Video, FileText, BookOpen } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import type { Lesson } from '@/types'

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const fetchLesson = useCallback(async () => {
    setLoading(true)
    const data = await getRecord('lessons', lessonId)

    if (data) {
      setLesson(data)
      setFormData({
        title: data.title,
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    await updateRecord('lessons', lessonId, {
      title: formData.title,
      content_type: formData.content_type,
      video_url: formData.content_type === 'video' ? formData.video_url : null,
      pdf_url: formData.content_type === 'pdf' ? formData.pdf_url : null,
      text_content: formData.content_type === 'text' ? formData.text_content : null,
      duration_minutes: formData.duration_minutes || null,
      is_free: formData.is_free,
      is_downloadable: formData.is_downloadable,
    })

    setSaving(false)
    fetchLesson()
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
        <Link href={`/admin-place/content/${courseId}/lessons`}>
          <Button variant="outline" className="mt-4 border-slate-300">Back to Lessons</Button>
        </Link>
      </div>
    )
  }

  const contentTypeIcon = {
    video: Video,
    pdf: FileText,
    text: BookOpen,
    quiz: FileText,
  }[formData.content_type]
  const Icon = contentTypeIcon

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin-place/content/${courseId}/lessons`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Lessons
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Lesson</h1>
              <p className="text-sm text-slate-500">{lesson.title}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Lesson Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-slate-300"
                  placeholder="Lesson title"
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
                    rows={10}
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
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.content_type === 'video' && formData.video_url && (
                <div className="rounded-xl overflow-hidden border border-slate-200">
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

              {formData.content_type === 'pdf' && formData.pdf_url && (
                <a
                  href={formData.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <FileText className="h-4 w-4" /> Open PDF in new tab
                </a>
              )}

              {formData.content_type === 'text' && formData.text_content && (
                <div
                  className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: formData.text_content }}
                />
              )}

              {!formData.video_url && !formData.pdf_url && !formData.text_content && (
                <p className="text-sm text-slate-400 text-center py-8">
                  No content to preview. Add a URL or text content.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
