'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Plus, ChevronUp, ChevronDown, Edit, Trash2, Upload, Video, CheckCircle2, XCircle, CloudUpload } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import { toast } from 'sonner'
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog'

interface DbLesson {
  id: string
  module_id: string
  title: string
  content: string | null
  content_type: string | null
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

type VideoUploadState = 'idle' | 'uploading' | 'ready' | 'error'

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

  // Video upload state
  const [videoUploadState, setVideoUploadState] = useState<VideoUploadState>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedKey, setUploadedKey] = useState<string | null>(null)
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null)
  const [uploadedPlaybackUrl, setUploadedPlaybackUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getRecords('modules', 'course_id', courseId, '*,lessons(*)')

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
    Promise.resolve().then(() => fetchModules())
  }, [fetchModules])

  useEffect(() => {
    const mod = modules.find((m) => m.id === selectedModuleId)
    Promise.resolve().then(() => setLessons(mod?.lessons || []))
  }, [selectedModuleId, modules])

  function openCreate() {
    setEditingLesson(null)
    setFormData({ title: '', content: '', video_url: '', duration_minutes: 0, is_free: false })
    resetVideoUpload()
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
    // Set existing video state
    if (lesson.r2_source_key) {
      setUploadedKey(lesson.r2_source_key)
      setUploadedFilename(lesson.r2_original_filename)
      setVideoUploadState('ready')
    } else {
      resetVideoUpload()
    }
    setShowForm(true)
  }

  function resetVideoUpload() {
    setVideoUploadState('idle')
    setUploadProgress(0)
    setUploadError(null)
    setUploadedKey(null)
    setUploadedFilename(null)
    setUploadedPlaybackUrl(null)
  }

  const MULTIPART_THRESHOLD = 500 * 1024 * 1024 // 500MB — use multipart above this

  async function handleVideoUpload(file: File) {
    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a video file (MP4, WebM, MOV)')
      setVideoUploadState('error')
      return
    }

    // Max 10GB per file
    if (file.size > 10 * 1024 * 1024 * 1024) {
      setUploadError('File too large (max 10GB)')
      setVideoUploadState('error')
      return
    }

    setUploadError(null)
    setVideoUploadState('uploading')
    setUploadProgress(0)

    const filename = file.name
    const lessonId = editingLesson?.id || 'temp'

    if (file.size > MULTIPART_THRESHOLD) {
      // MULTIPART UPLOAD for large files (supports 2GB+)
      await handleMultipartUpload(file, filename, lessonId)
    } else {
      // SIMPLE UPLOAD for smaller files
      await handleSimpleUpload(file, filename, lessonId)
    }
  }

  async function handleSimpleUpload(file: File, filename: string, lessonId: string) {
    try {
      const res = await fetch('/api/video/r2-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, filename, contentType: file.type }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to get upload URL' }))
        throw new Error(errData.error || 'Failed to get upload URL')
      }

      const { uploadUrl, key, playbackUrl } = await res.json()

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', uploadUrl)
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100))
        }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)))
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.ontimeout = () => reject(new Error('Upload timed out'))
        xhr.timeout = 600000
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      setUploadedKey(key)
      setUploadedFilename(filename)
      setUploadedPlaybackUrl(playbackUrl)
      setVideoUploadState('ready')
      setUploadProgress(100)
      toast.success('Video uploaded to R2!')
    } catch (err) {
      setVideoUploadState('error')
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  async function handleMultipartUpload(file: File, filename: string, lessonId: string) {
    try {
      // Step 1: Initiate multipart upload
      const initRes = await fetch('/api/video/multipart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, contentType: file.type, lessonId }),
      })

      if (!initRes.ok) {
        const errData = await initRes.json().catch(() => ({ error: 'Failed to initiate upload' }))
        throw new Error(errData.error || 'Failed to initiate upload')
      }

      const { uploadId, key, chunkSize } = await initRes.json()
      const totalParts = Math.ceil(file.size / chunkSize)
      const parts: { PartNumber: number; ETag: string }[] = []
      let uploadedParts = 0

      // Helper: upload a single part
      async function uploadPart(file: File, key: string, uploadId: string, partNumber: number, chunkSize: number) {
        const urlRes = await fetch(`/api/video/multipart?key=${encodeURIComponent(key)}&uploadId=${uploadId}&partNumber=${partNumber}`)
        if (!urlRes.ok) throw new Error(`Failed to get URL for part ${partNumber}`)
        const { url } = await urlRes.json()
        const start = (partNumber - 1) * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        const chunk = file.slice(start, end)
        const uploadRes = await fetch(url, { method: 'PUT', body: chunk, headers: { 'Content-Type': file.type } })
        if (!uploadRes.ok) throw new Error(`Part ${partNumber} failed: ${uploadRes.status}`)
        const etag = uploadRes.headers.get('ETag')?.replace(/"/g, '') || ''
        parts.push({ PartNumber: partNumber, ETag: etag })
      }

      // Step 2: Upload parts in batches of 3 (parallel)
      const CONCURRENT = 3
      for (let i = 1; i <= totalParts; i += CONCURRENT) {
        const batch: Promise<void>[] = []
        for (let j = i; j < i + CONCURRENT && j <= totalParts; j++) {
          batch.push(uploadPart(file, key, uploadId, j, chunkSize))
        }
        await Promise.all(batch)
        uploadedParts = Math.min(i + CONCURRENT - 1, totalParts)
        setUploadProgress(Math.round((uploadedParts / totalParts) * 100))
      }

      // Step 3: Complete multipart upload
      const completeRes = await fetch('/api/video/multipart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, uploadId, parts }),
      })

      if (!completeRes.ok) {
        throw new Error('Failed to complete upload')
      }

      const { playbackUrl } = await completeRes.json()

      setUploadedKey(key)
      setUploadedFilename(filename)
      setUploadedPlaybackUrl(playbackUrl)
      setVideoUploadState('ready')
      setUploadProgress(100)
      toast.success(`Video uploaded! (${(file.size / 1024 / 1024 / 1024).toFixed(1)}GB across ${totalParts} chunks)`)
    } catch (err) {
      setVideoUploadState('error')
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleVideoUpload(file)
    }
    // Reset file input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) return
    setSaving(true)

    try {
      const payload: Record<string, unknown> = {
        title: formData.title.trim(),
        content: formData.content.trim() || null,
        content_type: 'video',
        duration_minutes: formData.duration_minutes || null,
        is_free: formData.is_free,
      }

      // If video was uploaded to R2, store the key
      if (uploadedKey && videoUploadState === 'ready') {
        payload.r2_source_key = uploadedKey
        payload.r2_original_filename = uploadedFilename
        payload.video_url = uploadedPlaybackUrl || null
      } else if (formData.video_url.trim()) {
        // Legacy: plain video URL
        payload.video_url = formData.video_url.trim() || null
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

      // If video was uploaded to R2, store the key
      if (uploadedKey && videoUploadState === 'ready') {
        payload.content_type = 'video'
        payload.r2_source_key = uploadedKey
        payload.r2_original_filename = uploadedFilename
        payload.video_url = uploadedPlaybackUrl || null
      } else if (formData.video_url.trim()) {
        // Legacy: plain video URL
        payload.content_type = 'video'
        payload.video_url = formData.video_url.trim() || null
      } else {
        payload.content_type = 'text'
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
      resetVideoUpload()
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

  function getVideoBadge(lesson: DbLesson) {
    if (lesson.r2_source_key) {
      return <Badge variant="secondary" className="bg-green-50 text-green-600 border-0 text-xs gap-1"><CheckCircle2 className="h-3 w-3" />R2 Video</Badge>
    }
    if (lesson.video_url) {
      return <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 text-xs gap-1"><Video className="h-3 w-3" />URL</Badge>
    }
    return null
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
                      {/* Video icon */}
                      {lesson.r2_source_key ? (
                        <div className="h-10 w-16 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                          <Video className="h-4 w-4 text-green-500" />
                        </div>
                      ) : lesson.video_url ? (
                        <div className="h-10 w-16 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Video className="h-4 w-4 text-blue-400" />
                        </div>
                      ) : null}
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
                          {getVideoBadge(lesson)}
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

      {/* Create/Edit Lesson Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetVideoUpload(); setShowForm(open) }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Create Lesson'}</DialogTitle>
            <DialogDescription>
              {editingLesson ? 'Update lesson details and upload video content' : 'Add a new lesson to this module'}
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

            {/* Video Upload Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Video Content</label>

              {/* Upload area */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {videoUploadState === 'idle' && !uploadedKey && (
                  <div
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CloudUpload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600">Click to upload video</p>
                    <p className="text-xs text-slate-400 mt-1">MP4, WebM, MOV up to 10GB</p>
                    <p className="text-xs text-slate-400">Uploaded to Cloudflare R2 storage — large files use chunked upload</p>
                  </div>
                )}

                {videoUploadState === 'uploading' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="h-5 w-5 text-blue-600 animate-pulse" />
                      <p className="text-sm font-medium text-slate-600">Uploading to R2...</p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">{uploadProgress}% uploaded</p>
                  </div>
                )}

                {videoUploadState === 'ready' && uploadedKey && (
                  <div className="space-y-3">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="text-sm font-medium text-green-600">Video uploaded successfully!</p>
                    {uploadedFilename && (
                      <p className="text-xs text-slate-500 truncate max-w-xs mx-auto">{uploadedFilename}</p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-300 text-xs"
                      onClick={() => { resetVideoUpload() }}
                    >
                      Replace Video
                    </Button>
                  </div>
                )}

                {videoUploadState === 'error' && (
                  <div className="space-y-3">
                    <XCircle className="h-8 w-8 text-red-500 mx-auto" />
                    <p className="text-sm font-medium text-red-600">Upload failed</p>
                    {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-300 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>

              {/* Existing video info (when editing) */}
              {editingLesson?.r2_source_key && videoUploadState === 'idle' && !uploadedKey && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <Video className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-700">Video stored on R2</p>
                    <p className="text-xs text-green-600 truncate">{editingLesson.r2_original_filename || editingLesson.r2_source_key}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-xs shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                </div>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400">or enter video URL manually</span>
                </div>
              </div>

              <div>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="border-slate-300"
                  placeholder="https://youtube.com/watch?v=... (fallback for external videos)"
                  disabled={!!uploadedKey}
                />
                <p className="text-xs text-slate-400 mt-1">Optional: Use for YouTube or external video links only. Uploading above is preferred.</p>
              </div>
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
              <Button type="button" variant="outline" onClick={() => { resetVideoUpload(); setShowForm(false) }} className="border-slate-300">
                Cancel
              </Button>
              <Button type="submit" disabled={saving || videoUploadState === 'uploading'} className="bg-blue-600 hover:bg-blue-700">
                {saving ? 'Saving...' : editingLesson ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Lesson"
        itemName={deletingLesson?.title || 'this item'}
      />
    </div>
  )
}
