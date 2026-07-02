'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Film, CheckCircle, Loader2, X, AlertCircle } from 'lucide-react'
import { getRecord, updateRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'

interface DbLesson {
  id: string
  module_id: string
  title: string
  content: string | null
  video_url: string | null
  video_id: string | null
  r2_source_key: string | null
  r2_original_filename: string | null
  stream_status: string | null
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
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'ready' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [, setStreamVideoId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        setStreamVideoId(data.video_id || null)
        if (data.r2_source_key && (data.stream_status === 'uploaded' || data.stream_status === 'ready')) {
          setUploadState('ready')
        } else if (data.stream_status === 'processing') {
          setUploadState('processing')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lesson')
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    Promise.resolve().then(() => fetchLesson())
  }, [fetchLesson])

  async function handleVideoUpload(file: File) {
    if (!file) return
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setUploadError('File too large (max 2GB)')
      return
    }
    setUploadState('uploading')
    setUploadProgress(0)
    setUploadError('')
    try {
      const presignRes = await fetch('/api/video/r2-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, filename: file.name, contentType: file.type || 'video/mp4' }),
      })
      if (!presignRes.ok) {
        const err = await presignRes.json()
        throw new Error(err.error || 'Failed to get upload URL')
      }
      const { uploadUrl, key, playbackUrl } = await presignRes.json()
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl, true)
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) resolve(); else reject(new Error(`Upload failed (${xhr.status})`)) }
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.ontimeout = () => reject(new Error('Upload timed out'))
        xhr.timeout = 3600000
        xhr.send(file)
      })
      // Save R2 key to lesson record
      await updateRecord('lessons', lessonId, {
        r2_source_key: key,
        r2_original_filename: file.name,
        stream_status: 'uploaded',
        video_url: playbackUrl,
      })
      setUploadState('ready')
      fetchLesson()
      notify.lessonUpdated()
    } catch (err: unknown) {
      setUploadState('error')
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) return
    setSaving(true)

    try {
      await updateRecord('lessons', lessonId, {
        title: formData.title.trim(),
        content: formData.content.trim() || null,
        content_type: 'video',
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

              {/* Video Upload - R2 + Cloudflare Stream */}
              <div>
                <label className="text-sm font-medium text-slate-700">Course Video</label>
                <div className="mt-1 space-y-3">
                  {uploadState === 'ready' && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="text-sm text-green-700">Video uploaded to R2</span>
                      <Button type="button" variant="ghost" size="sm" className="ml-auto text-red-500 hover:text-red-700 h-6"
                        onClick={async () => {
                          await updateRecord('lessons', lessonId, { video_id: null, r2_source_key: null, r2_original_filename: null, stream_status: 'pending', video_url: null })
                          setStreamVideoId(null); setUploadState('idle')
                        }}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {uploadState === 'processing' && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
                      <span className="text-sm text-blue-700">Uploading video...</span>
                    </div>
                  )}
                  {uploadState === 'uploading' && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Uploading to R2...</span>
                        <span className="text-sm font-medium text-slate-700">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                  {uploadState === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                      <span className="text-sm text-red-700">{uploadError}</span>
                    </div>
                  )}
                  {(uploadState === 'idle' || uploadState === 'error') && (
                    <div
                      className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files[0]; if (f) handleVideoUpload(f) }}
                    >
                      <Film className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-600">
                        <span className="text-blue-600 font-medium">Click to upload</span> or drag & drop
                      </p>
                      <p className="text-xs text-slate-400 mt-1">MP4, MOV, WebM up to 2GB</p>
                      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f) }} />
                    </div>
                  )}
                </div>
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
              {uploadState === 'ready' && lesson?.r2_source_key ? (
                <div className="rounded-xl border border-slate-200 p-4 text-center">
                  <Film className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700">{lesson.r2_original_filename || 'Video'}</p>
                  <p className="text-xs text-slate-400 mt-1">Stored in R2</p>
                </div>
              ) : formData.video_url && !formData.video_url.startsWith('r2://') ? (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <iframe
                    src={formData.video_url}
                    className="w-full aspect-video"
                    allowFullScreen
                    title="Video preview"
                  />
                </div>
              ) : formData.content ? (
                <div className="text-sm text-slate-700 whitespace-pre-wrap">{formData.content}</div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">
                  No content to preview. Upload a video or add text content.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
