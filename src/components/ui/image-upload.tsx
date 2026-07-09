'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, X, FolderOpen, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ImageFolder } from '@/lib/supabase/storage'
import ImagePicker from './image-picker'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder: ImageFolder
  className?: string
}

export default function ImageUpload({ value, onChange, folder, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(value || '')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return

    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      const result = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText)
            resolve(data.url)
          } else {
            try {
              const data = JSON.parse(xhr.responseText)
              reject(new Error(data.error || 'Upload failed'))
            } catch {
              reject(new Error('Upload failed'))
            }
          }
        }
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.open('POST', '/api/storage/upload')
        xhr.send(formData)
      })

      onChange(result)
    } catch {
      setPreview(value || '')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [onChange, value, folder])

  function handleFile(file: File | undefined) {
    if (!file) return
    uploadFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  function clearImage() {
    setPreview('')
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  function handlePickerSelect(url: string) {
    setPreview(url)
    onChange(url)
  }

  const hasImage = preview || value

  return (
    <>
      <div className={cn('space-y-2', className)}>
        {hasImage ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview || value}
              alt="Preview"
              className="h-32 w-48 rounded-xl object-cover border border-slate-200"
              onError={() => {
                if (preview && preview !== value) {
                  URL.revokeObjectURL(preview)
                }
                setPreview('')
              }}
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-sm"
            >
              <X className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 shadow-sm"
              title="Browse existing"
            >
              <FolderOpen className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex flex-col items-center justify-center h-32 w-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors',
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              )}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 px-3 w-full">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{progress}%</span>
                </div>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500 text-center px-2">
                    Upload new
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex flex-col items-center justify-center h-32 w-48 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <FolderOpen className="h-6 w-6 text-blue-500 mb-1" />
              <span className="text-xs text-blue-600 font-medium">Select image</span>
              <span className="text-[10px] text-slate-400 mt-0.5">from existing</span>
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <ImagePicker
        open={showPicker}
        onOpenChange={setShowPicker}
        folder={folder}
        onSelect={handlePickerSelect}
      />
    </>
  )
}
