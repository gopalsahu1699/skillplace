'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_THEMES,
  type CertificateType,
  type CertificateTheme,
} from '@/lib/certificate-types'
import { generateCertificateHTML } from '@/lib/certificate-templates'
import { getRecords } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Download,
  Loader2,
  RotateCw,
} from 'lucide-react'

interface Student {
  id: string
  full_name: string | null
  email: string
}

interface Course {
  id: string
  title: string
  duration_hours: number | null
}

interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: string
  profiles: Student | null
}

interface BulkCertificateIssuerProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

function generateCertificateNumber(existingNumbers: string[]): string {
  const year = new Date().getFullYear()
  const yearPrefix = `SP-${year}-`
  const yearNumbers = existingNumbers
    .filter((n) => n.startsWith(yearPrefix))
    .map((n) => parseInt(n.replace(yearPrefix, ''), 10))
    .filter((n) => !isNaN(n))
  const sequential = yearNumbers.length > 0 ? Math.max(...yearNumbers) + 1 : 1
  return `${yearPrefix}${sequential.toString().padStart(5, '0')}`
}

export default function BulkCertificateIssuer({ open, onClose, onComplete }: BulkCertificateIssuerProps) {
  const [step, setStep] = useState(1)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())
  const [selectedType, setSelectedType] = useState<CertificateType | ''>('')
  const [selectedTheme, setSelectedTheme] = useState<CertificateTheme | ''>('')
  const [certificateNumber, setCertificateNumber] = useState('')
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0])
  const [organizationName, setOrganizationName] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [loadingData, setLoadingData] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null)

  useEffect(() => {
    async function loadCourses() {
      const data = await getRecords('courses')
      setCourses(
        (data || [])
          .filter((c: Record<string, unknown>) => c.is_active !== false)
          .map((c: Record<string, unknown>) => ({
            id: c.id as string,
            title: c.title as string,
            duration_hours: c.duration_hours as number | null,
          }))
      )
    }
    if (open) {
      loadCourses()
      resetState()
    }
  }, [open])

  useEffect(() => {
    async function loadEnrollments() {
      if (!selectedCourseId) {
        setEnrollments([])
        return
      }
      setLoadingData(true)
      const data = await getRecords('enrollments', 'course_id', selectedCourseId, 'profiles(full_name,email)')
      const rawEnrollments = (data || []).map((e: Record<string, unknown>) => ({
        id: e.id as string,
        user_id: e.user_id as string,
        course_id: e.course_id as string,
        status: e.status as string,
        profiles: e.profiles as Student | null,
      }))
      // Deduplicate by user_id (keep first entry per student)
      const seen = new Set<string>()
      const deduped = rawEnrollments.filter((e: { user_id: string }) => {
        if (seen.has(e.user_id)) return false
        seen.add(e.user_id)
        return true
      })
      setEnrollments(deduped)
      setSelectedStudentIds(new Set())
      setLoadingData(false)
    }
    if (selectedCourseId) loadEnrollments()
  }, [selectedCourseId])

  function resetState() {
    setStep(1)
    setSelectedCourseId('')
    setEnrollments([])
    setSelectedStudentIds(new Set())
    setSelectedType('')
    setSelectedTheme('')
    setCertificateNumber('')
    setIssuedDate(new Date().toISOString().split('T')[0])
    setOrganizationName('')
    setCustomMessage('')
    setResults(null)
  }

  function toggleStudent(userId: string) {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  function toggleAllStudents() {
    if (selectedStudentIds.size === enrollments.length) {
      setSelectedStudentIds(new Set())
    } else {
      setSelectedStudentIds(new Set(enrollments.map((e) => e.user_id)))
    }
  }

  function getPreviewHTML() {
    if (!selectedType || !selectedTheme || selectedStudentIds.size === 0) return ''
    const firstStudent = enrollments.find((e) => selectedStudentIds.has(e.user_id))
    const studentName = firstStudent?.profiles?.full_name || firstStudent?.profiles?.email || 'Student'
    const course = courses.find((c) => c.id === selectedCourseId)
    const issuedDateFormatted = new Date(issuedDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    return generateCertificateHTML({
      studentName,
      courseName: course?.title || 'Course',
      certNumber: certificateNumber || 'SP-2026-00001',
      issuedDate: issuedDateFormatted,
      duration: course?.duration_hours?.toString() || 'N/A',
      typeId: selectedType as CertificateType,
      themeId: selectedTheme as CertificateTheme,
      organizationName,
      customMessage,
    })
  }

  async function handleIssue() {
    if (selectedStudentIds.size === 0 || !selectedType || !selectedTheme) return
    setSubmitting(true)
    setResults(null)
    try {
      const selectedStudents = enrollments.filter((e) => selectedStudentIds.has(e.user_id))
      const issuedDateISO = new Date(issuedDate).toISOString()

      const certificates = selectedStudents.map((enrollment) => ({
        user_id: enrollment.user_id,
        course_id: selectedCourseId || null,
        certificate_number: certificateNumber || '',
        certificate_type: selectedType,
        theme: selectedTheme,
        organization_name: organizationName || null,
        custom_message: customMessage || null,
        issued_at: issuedDateISO,
      }))

      const res = await fetch('/api/certificates/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificates }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to issue certificates')
      }

      setResults({ success: data.count || certificates.length, errors: [] })
      notify.certificateDownloaded()
      onComplete()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to issue certificates'
      setResults({ success: 0, errors: [msg] })
      notify.genericError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)
  const showOrgField = ['internship', 'training', 'experience'].includes(selectedType)
  const showCustomField = ['achievement', 'excellence', 'other'].includes(selectedType)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); resetState() } }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Issue Certificates</DialogTitle>
          <DialogDescription>
            Issue certificates to multiple students at once
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div>
            <Label className="text-slate-700 font-medium">Select Course</Label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            {selectedCourse && (
              <p className="text-sm text-slate-500 mt-2">
                {enrollments.length} student{enrollments.length !== 1 ? 's' : ''} enrolled
              </p>
            )}
            <div className="flex justify-end mt-6">
              <Button onClick={() => setStep(2)} disabled={!selectedCourseId} className="gap-2 bg-blue-600 hover:bg-blue-700">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-slate-700 font-medium">
                Select Students ({selectedStudentIds.size}/{enrollments.length})
              </Label>
              <Button variant="outline" size="sm" onClick={toggleAllStudents} className="text-xs">
                {selectedStudentIds.size === enrollments.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            {loadingData ? (
              <div className="py-8 text-center text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading enrollments...
              </div>
            ) : enrollments.length === 0 ? (
              <div className="py-8 text-center text-slate-500">No enrollments found for this course.</div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.size === enrollments.length && enrollments.length > 0}
                          onChange={toggleAllStudents}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Name</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Email</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.has(enrollment.user_id)}
                            onChange={() => toggleStudent(enrollment.user_id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {enrollment.profiles?.full_name || enrollment.profiles?.email || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{enrollment.profiles?.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${enrollment.status === 'completed' ? 'bg-green-50 text-green-700' : ''}`}>
                            {enrollment.status || 'active'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={selectedStudentIds.size === 0} className="gap-2 bg-blue-600 hover:bg-blue-700">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-slate-700">Certificate Type</Label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as CertificateType)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  {CERTIFICATE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-700">Theme</Label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value as CertificateTheme)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select theme</option>
                  {CERTIFICATE_THEMES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-slate-700">Date Issued</Label>
                <Input
                  type="date"
                  value={issuedDate}
                  onChange={(e) => setIssuedDate(e.target.value)}
                  className="border-slate-300 mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-700">Certificate Number (auto-generated if blank)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="SP-2026-XXXXX"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value.toUpperCase())}
                    className="border-slate-300 font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCertificateNumber(generateCertificateNumber([]))}
                    className="shrink-0 border-slate-300"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {showOrgField && (
                <div className="sm:col-span-2">
                  <Label className="text-slate-700">Organization Name</Label>
                  <Input
                    placeholder="Enter organization name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="border-slate-300 mt-1"
                  />
                </div>
              )}
              {showCustomField && (
                <div className="sm:col-span-2">
                  <Label className="text-slate-700">Custom Message</Label>
                  <Textarea
                    placeholder="Enter custom message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="border-slate-300 mt-1"
                    rows={2}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!selectedType || !selectedTheme} className="gap-2 bg-blue-600 hover:bg-blue-700">
                Preview <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="secondary">{selectedStudentIds.size} student{selectedStudentIds.size !== 1 ? 's' : ''}</Badge>
              {selectedType && <Badge variant="outline">{CERTIFICATE_TYPES.find((t) => t.id === selectedType)?.label}</Badge>}
              {selectedTheme && <Badge variant="outline">{CERTIFICATE_THEMES.find((t) => t.id === selectedTheme)?.label}</Badge>}
            </div>

            {results ? (
              <div className={`p-6 rounded-xl text-center ${results.errors.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {results.errors.length === 0 ? (
                  <>
                    <Check className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-green-800">{results.success} certificate{results.success !== 1 ? 's' : ''} issued!</p>
                    <p className="text-sm text-green-600 mt-1">All certificates have been saved to the database.</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-red-800">Error</p>
                    <p className="text-sm text-red-600 mt-1">{results.errors[0]}</p>
                  </>
                )}
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '1056 / 748' }}>
                {getPreviewHTML() ? (
                  <iframe srcDoc={getPreviewHTML()} className="w-full h-full border-0" title="Certificate Preview" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">No preview available</div>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)} className="gap-2" disabled={submitting || !!results}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              {!results && (
                <Button onClick={handleIssue} disabled={submitting} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {submitting ? 'Issuing...' : `Issue ${selectedStudentIds.size} Certificate${selectedStudentIds.size !== 1 ? 's' : ''}`}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
