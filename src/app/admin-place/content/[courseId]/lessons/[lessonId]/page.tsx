'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import { getRecord, updateRecord } from '@/lib/admin-api'
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

export default function LessonDetailPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string
  const [lesson, setLesson] = useState<DbLesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    video_url: '',
    duration_minutes: 0,
    is_free: false,
    is_active: true,
  })

  const fetchLesson = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRecord('lessons', lessonId)

      if (data) {
        setLesson(data)
        setFormData({
          title: data.title || '',
          content: data.content || '',
          video_url: data.video_url || '',
          duration_minutes: data.duration_minutes || 0,
          is_free: data.is_free || false,
          is_active: data.is_active !== false,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lesson')
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    fetchLesson()
  }, [fetchLesson])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) return
    setSaving(true)

    try {
      await updateRecord('lessons', lessonId, {
        title: formData.title.trim(),
        content: formData.content.trim() || null,
        video_url: formData.video_url.trim() || null,
        duration_minutes: formData.duration_minutes || null,
        is_free: formData.is_free,
        is_active: formData.is_active,
      })
      notify.lessonUpdated()
      fetchLesson()
    } catch {
      notify.genericError()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">{error || 'Lesson not found'}</p>
        <Link href={`/admin-place/content/${courseId}/lessons`}>
          <Button variant="outline" className="mt-4 border-slate-300">Back to Lessons</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin-place/content/${courseId}/lessons`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Lessons
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Lesson</h1>
            <p className="text-sm text-slate-500">{lesson.title}</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
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
                <label className="text-sm font-medium text-slate-700">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={10}
                  placeholder="Write lesson content here"
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

              <div>
                <label className="text-sm font-medium text-slate-700">Duration (minutes)</label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, duration_minutes: Number(e.target.value) })
                  }
                  className="border-slate-300"
                  min={0}
                />
              </div>

              <div className="flex items-center gap-6">
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

        <div className="lg:col-span-1">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.video_url ? (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <iframe
                    src={
                      formData.video_url.includes('youtube.com') ||
                      formData.video_url.includes('youtu.be')
                        ? formData.video_url
                            .replace('watch?v=', 'embed/')
                            .replace('youtu.be/', 'youtube.com/embed/')
                        : formData.video_url
                    }
                    className="w-full aspect-video"
                    allowFullScreen
                    title="Video preview"
                  />
                </div>
              ) : formData.content ? (
                <div className="text-sm text-slate-700 whitespace-pre-wrap">{formData.content}</div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">
                  No content to preview. Add a video URL or text content.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
