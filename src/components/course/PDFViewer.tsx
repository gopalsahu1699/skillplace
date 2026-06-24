'use client'
import { useState } from 'react'
import { Download, Maximize, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PDFViewerProps {
  url: string
  title?: string
  isDownloadable?: boolean
  className?: string
}

export default function PDFViewer({ url, title, isDownloadable = true, className }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    const container = document.getElementById(`pdf-container-${title?.replace(/\s/g, '-')}`)
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
        setIsFullscreen(false)
      } else {
        container.requestFullscreen()
        setIsFullscreen(true)
      }
    }
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 truncate">{title || 'Document'}</h3>
        <div className="flex items-center gap-2 shrink-0">
          {isDownloadable && (
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 border-slate-300">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </a>
          )}
          <Button variant="outline" size="sm" className="gap-2 border-slate-300" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" />
            Fullscreen
          </Button>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="gap-1 text-slate-500">
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </Button>
          </a>
        </div>
      </div>
      <div
        id={`pdf-container-${title?.replace(/\s/g, '-')}`}
        className="w-full bg-white border border-slate-200 rounded-2xl overflow-hidden"
        style={{ height: isFullscreen ? '100vh' : '80vh' }}
      >
        <iframe
          src={url}
          className="w-full h-full border-0"
          title={title || 'PDF Document'}
        />
      </div>
    </div>
  )
}
