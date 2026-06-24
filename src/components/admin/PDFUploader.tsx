'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FileText, ExternalLink, X } from 'lucide-react'

interface PDFUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export default function PDFUploader({ value, onChange, label = 'PDF URL' }: PDFUploaderProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-2 mt-1">
        <div className="relative flex-1">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10 border-slate-300"
            placeholder="URL to PDF document"
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

      {value && showPreview && (
        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
          <iframe
            src={value}
            className="w-full h-96"
            title="PDF preview"
          />
        </div>
      )}

      {value && (
        <div className="flex items-center gap-2 mt-2">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" /> Open PDF in new tab
          </a>
        </div>
      )}
    </div>
  )
}
