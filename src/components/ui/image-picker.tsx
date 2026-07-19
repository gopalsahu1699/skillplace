'use client'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, Loader2, Trash2 } from 'lucide-react'
import type { ImageFolder } from '@/lib/supabase/storage'
import { notify } from '@/lib/notification'

interface ImageItem {
  name: string
  url: string
  created_at: string
  size: number
}

interface ImagePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder: ImageFolder
  onSelect: (url: string) => void
}

export default function ImagePicker({ open, onOpenChange, folder, onSelect }: ImagePickerProps) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  function loadImages() {
    setLoading(true)
    setSearch('')
    fetch(`/api/storage/list?folder=${folder}`)
      .then((r) => r.json())
      .then((data) => setImages(data.images || []))
      .catch(() => setImages([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (open) loadImages()
  }, [open, folder])

  async function handleDelete(name: string) {
    if (!confirm('Delete this image?')) return
    setDeleting(name)
    try {
      const res = await fetch(`/api/storage/delete?folder=${folder}&filename=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      setImages((prev) => prev.filter((img) => img.name !== name))
    } catch {
      notify.error('Failed to delete image. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = search
    ? images.filter((img) => img.name.toLowerCase().includes(search.toLowerCase()))
    : images

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Image — {folder}</DialogTitle>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search images..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No images found. Upload one first.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filtered.map((img) => (
              <div
                key={img.name}
                className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-blue-500 hover:ring-2 hover:ring-blue-200 transition-all"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelect(img.url)
                    onOpenChange(false)
                  }}
                  className="h-full w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{img.name}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(img.name)}
                  disabled={deleting === img.name}
                  className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-sm disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
