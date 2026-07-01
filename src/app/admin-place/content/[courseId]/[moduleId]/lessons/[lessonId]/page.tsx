'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Save, Trash2, Upload, Film, CheckCircle, Loader2, X, AlertCircle } from 'lucide-react'
import { getRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
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

export default function LessonEditorPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<DbLesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    video_url: '',
    duration_minutes: 0,
    is_free: false,
    is_active: true,
  })
  // Video upload state
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'ready' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [streamVideoId, setStreamVideoId] = useState<string | null>(null)
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
    fetchLesson()
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
      // Step 1: Get presigned R2 upload URL
      const presignRes = await fetch('/api/video/r2-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          filename: file.name,
          contentType: file.type || 'video/mp4',
        }),
      })

      if (!presignRes.ok) {
        const err = await presignRes.json()
        throw new Error(err.error || 'Failed to get upload URL')
      }

      const { uploadUrl, key, playbackUrl } = await presignRes.json()

      // Step 2: Upload directly to R2 via presigned URL (with progress)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl, true)
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.ontimeout = () => reject(new Error('Upload timed out'))
        xhr.timeout = 3600000
        xhr.send(file)
      })

      // Step 3: Save R2 key to lesson record
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

  async function handleSave() {
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

  async function handleDelete() {
    try {
      await deleteRecord('lessons', lessonId)
      notify.lessonDeleted()
      setShowDeleteConfirm(false)
      router.push(`/admin-place/content/${courseId}`)
    } catch {
      notify.genericError()
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
        <Link href={`/admin-place/content/${courseId}`}>
          <Button variant="outline" className="mt-4 border-slate-300">Back to Course</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
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
            <label className="text-sm font-medium text-slate-700">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
              rows={10}
              placeholder="Write lesson content here"
            />
          </div>

          {/* Video Upload - R2 + Cloudflare Stream */}
          <div>
            <label className="text-sm font-medium text-slate-700">Course Video</label>
            <div className="mt-1 space-y-3">
              {/* Current video status */}
              {streamVideoId && uploadState === 'ready' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm text-green-700">Video uploaded to R2</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-red-500 hover:text-red-700 h-6"
                    onClick={async () => {
                      await updateRecord('lessons', lessonId, {
                        video_id: null,
                        r2_source_key: null,
                        r2_original_filename: null,
                        stream_status: 'pending',
                        video_url: null,
                      })
                      setStreamVideoId(null)
                      setUploadState('idle')
                    }}
                  >
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
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadState === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span className="text-sm text-red-700">{uploadError}</span>
                </div>
              )}

              {/* Upload button */}
              {(uploadState === 'idle' || uploadState === 'error') && (
                <div
                  className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const file = e.dataTransfer.files[0]
                    if (file) handleVideoUpload(file)
                  }}
                >
                  <Film className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-600">
                    <span className="text-blue-600 font-medium">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-xs text-slate-400 mt-1">MP4, MOV, WebM up to 2GB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleVideoUpload(file)
                    }}
                  />
                </div>
              )}
            </div>
          </div>

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
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                Active
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">{lesson.title}</span>?
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
