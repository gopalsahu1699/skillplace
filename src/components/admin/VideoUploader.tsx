'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Video, ExternalLink, X } from 'lucide-react'

interface VideoUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

function getEmbedUrl(url: string): string {
  if (!url) return ''
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v')
    return `https://www.youtube.com/embed/${videoId}`
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
    return `https://player.vimeo.com/video/${videoId}`
  }
  return url
}

function getVideoType(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
  if (url.includes('vimeo.com')) return 'Vimeo'
  return 'Direct'
}

export default function VideoUploader({ value, onChange, label = 'Video URL' }: VideoUploaderProps) {
  const [showPreview, setShowPreview] = useState(false)
  const embedUrl = getEmbedUrl(value)

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-2 mt-1">
        <div className="relative flex-1">
          <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10 border-slate-300"
            placeholder="YouTube, Vimeo, or direct video URL"
          />
        </div>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="border-slate-300"
          >
            {showPreview ? <X className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {value && showPreview && embedUrl && (
        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
          <iframe
            src={embedUrl}
            className="w-full aspect-video"
            allowFullScreen
            title="Video preview"
          />
        </div>
      )}

      {value && (
        <p className="text-xs text-slate-400 mt-1">
          Type: {getVideoType(value)}
        </p>
      )}
    </div>
  )
}
