'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Search, Loader2 } from 'lucide-react'

interface Student {
  id: string
  full_name: string | null
  email: string
  batch_id: string | null
  batch_name?: string | null
  program_type?: string | null
}

interface QuickIssueStudentProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

export default function QuickIssueStudent({ open, onClose, onComplete }: QuickIssueStudentProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [selectedType, setSelectedType] = useState<CertificateType | ''>('')
  const [selectedTheme, setSelectedTheme] = useState<CertificateTheme | ''>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      fetchStudents()
      resetState()
    }
  }, [open])

  async function fetchStudents() {
    setLoading(true)
    try {
      const [studentsData, batchesData] = await Promise.all([
        getRecords('profiles', undefined, undefined, '*, batches(name, program_type)'),
        getRecords('batches'),
      ])
      const batchMap = new Map<string, { name: string; program_type: string }>()
      if (batchesData) {
        batchesData.forEach((b: { id: string; name: string; program_type: string }) => {
          batchMap.set(b.id, { name: b.name, program_type: b.program_type })
        })
      }

      const studentList = (studentsData || [])
        .filter((s: Record<string, unknown>) => s.role === 'student')
        .map((s: Record<string, unknown>) => {
          const batchId = s.batch_id as string | null
          const batch = batchId ? batchMap.get(batchId) : null
          return {
            id: s.id as string,
            full_name: s.full_name as string | null,
            email: s.email as string,
            batch_id: batchId,
            batch_name: batch?.name || null,
            program_type: batch?.program_type || null,
          }
        })
      setStudents(studentList)
    } catch {
      notify.genericError('Failed to load students')
    }
    setLoading(false)
  }

  function resetState() {
    setSelectedStudentIds(new Set())
    setSelectedType('')
    setSelectedTheme('')
    setSearch('')
  }

  const filteredStudents = students.filter((s) => {
    const query = search.toLowerCase()
    return (
      s.full_name?.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.batch_name?.toLowerCase().includes(query)
    )
  })

  function toggleStudent(studentId: string) {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }
      return next
    })
  }

  function toggleAllStudents() {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set())
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map((s) => s.id)))
    }
  }

  async function handleIssue() {
    if (selectedStudentIds.size === 0 || !selectedType || !selectedTheme) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/certificates/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_ids: Array.from(selectedStudentIds),
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
          <DialogTitle>Issue to Students</DialogTitle>
          <DialogDescription>
            Search and select students to issue certificates to
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or batch..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <p className="text-lg font-medium">No students found</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0}
                      onChange={toggleAllStudents}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Batch</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.has(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {student.full_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{student.email}</td>
                    <td className="px-4 py-3">
                      {student.batch_name ? (
                        <Badge variant="outline" className="text-xs">
                          {student.batch_name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <div>
            <Badge variant="secondary">
              {selectedStudentIds.size} student{selectedStudentIds.size !== 1 ? 's' : ''} selected
            </Badge>
          </div>
          <div className="flex gap-2">
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as CertificateType)}
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Certificate Type</option>
                {CERTIFICATE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as CertificateTheme)}
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Theme</option>
                {CERTIFICATE_THEMES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleIssue}
              disabled={selectedStudentIds.size === 0 || !selectedType || !selectedTheme || submitting}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Issue Certificates
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
