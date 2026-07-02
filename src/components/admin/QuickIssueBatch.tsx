'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { getRecords } from '@/lib/admin-api'
import { PROGRAM_TYPES, PROGRAM_TYPE_COLORS } from '@/lib/constants'
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_THEMES,
  type CertificateType,
  type CertificateTheme,
} from '@/lib/certificate-types'
import { notify } from '@/lib/notifications'
import { Search, Users, Loader2, ChevronRight } from 'lucide-react'

interface Batch {
  id: string
  name: string
  program_type: string
  course_id: string | null
  is_active: boolean
  student_count?: number
  courses?: { title: string } | null
}

interface QuickIssueBatchProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

export default function QuickIssueBatch({ open, onClose, onComplete }: QuickIssueBatchProps) {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterProgramType, setFilterProgramType] = useState('')
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [selectedType, setSelectedType] = useState<CertificateType | ''>('')
  const [selectedTheme, setSelectedTheme] = useState<CertificateTheme | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<'select' | 'configure'>('select')

  useEffect(() => {
    if (open) {
      fetchBatches()
      resetState()
    }
  }, [open])

  async function fetchBatches() {
    setLoading(true)
    try {
      const data = await getRecords('batches', undefined, undefined, '*, courses(title)')
      if (data) {
        const withCounts = data.map((b: { id: string; name?: string; program_type?: string; is_active?: boolean; courses?: { title: string } | null }) => ({
          ...b,
          student_count: 0,
        }))
        setBatches(withCounts.filter((b: Batch) => b.is_active !== false))
      }
    } catch {
      notify.genericError('Failed to load batches')
    }
    setLoading(false)
  }

  function resetState() {
    setSelectedBatch(null)
    setSelectedType('')
    setSelectedTheme('')
    setSearch('')
    setFilterProgramType('')
    setStep('select')
  }

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.courses?.title?.toLowerCase().includes(search.toLowerCase())
    const matchesType = !filterProgramType || b.program_type === filterProgramType
    return matchesSearch && matchesType
  })

  async function handleIssue() {
    if (!selectedBatch || !selectedType || !selectedTheme) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/certificates/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: selectedBatch.id,
          certificate_type: selectedType,
          theme: selectedTheme,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to issue certificates')
      notify.certificatesIssued(data.count || 0)
      onComplete()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to issue certificates'
      notify.genericError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); resetState() } }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Issue by Batch</DialogTitle>
          <DialogDescription>
            Select a batch to issue certificates to all students in it
          </DialogDescription>
        </DialogHeader>

        {step === 'select' ? (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search batches..."
                  className="pl-10 border-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={filterProgramType}
                onChange={(e) => setFilterProgramType(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Program Types</option>
                {PROGRAM_TYPES.map((pt) => (
                  <option key={pt.id} value={pt.id}>{pt.icon} {pt.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading batches...
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="text-lg font-medium">No batches found</p>
                <p className="text-sm mt-1">Create batches first to issue certificates by batch</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredBatches.map((batch) => {
                  const ptColor = PROGRAM_TYPE_COLORS[batch.program_type] || 'bg-slate-100 text-slate-700'
                  return (
                    <button
                      key={batch.id}
                      onClick={() => { setSelectedBatch(batch); setStep('configure') }}
                      className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-900 truncate">{batch.name}</span>
                            <Badge variant="outline" className={`text-xs ${ptColor}`}>
                              {PROGRAM_TYPES.find((p) => p.id === batch.program_type)?.label || batch.program_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            {batch.courses?.title && <span>{batch.courses.title}</span>}
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {batch.student_count || 0} students
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{selectedBatch?.name}</span>
                <Badge variant="outline" className="text-xs">
                  {selectedBatch?.student_count || 0} students
                </Badge>
              </div>
              {selectedBatch?.courses?.title && (
                <p className="text-xs text-slate-500 mt-1">{selectedBatch.courses.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-slate-700 font-medium">Certificate Type</Label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as CertificateType)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  {CERTIFICATE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-700 font-medium">Theme</Label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value as CertificateTheme)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select theme</option>
                  {CERTIFICATE_THEMES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep('select')} className="gap-2">
                Back
              </Button>
              <Button
                onClick={handleIssue}
                disabled={!selectedType || !selectedTheme || submitting}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Issue to {selectedBatch?.student_count || 0} Students
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
