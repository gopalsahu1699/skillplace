'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Plus, Download, RefreshCw } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'

interface Certificate {
  id: string
  certificate_number: string
  issued_at: string
  profiles: { full_name: string | null } | null
  courses: { title: string } | null
}

interface Student {
  id: string
  full_name: string | null
  email: string
}

interface Course {
  id: string
  title: string
}

// Generate unique certificate number: SP-YYYY-XXXXX
function generateCertificateNumber(existingNumbers: string[]): string {
  const year = new Date().getFullYear()
  let sequential: number

  // Find the highest sequential number for current year
  const yearPrefix = `SP-${year}-`
  const yearNumbers = existingNumbers
    .filter(n => n.startsWith(yearPrefix))
    .map(n => parseInt(n.replace(yearPrefix, ''), 10))
    .filter(n => !isNaN(n))

  if (yearNumbers.length > 0) {
    sequential = Math.max(...yearNumbers) + 1
  } else {
    sequential = 1
  }

  // Pad with zeros to ensure 5 digits
  const certNumber = `${yearPrefix}${sequential.toString().padStart(5, '0')}`

  // Ensure uniqueness (in case of collision, increment)
  if (existingNumbers.includes(certNumber)) {
    sequential += 1
    return `${yearPrefix}${sequential.toString().padStart(5, '0')}`
  }

  return certNumber
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    certificate_number: '',
  })
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [certsData, studentsData, coursesData] = await Promise.all([
      getRecords('certificates', undefined, undefined, '*,profiles(full_name),courses(title,duration_hours)'),
      getRecords('profiles'),
      getRecords('courses'),
    ])
    setCertificates((certsData || []).sort((a: Certificate, b: Certificate) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()))
    setStudents((studentsData || []).filter((s: any) => s.role === 'student').map((s: any) => ({ id: s.id, full_name: s.full_name, email: s.email })))
    setCourses((coursesData || []).filter((c: any) => c.is_active !== false).map((c: any) => ({ id: c.id, title: c.title })))
    setLoading(false)
  }

  // Auto-generate certificate number
  function handleGenerateNumber() {
    setGenerating(true)
    const existingNumbers = certificates.map(c => c.certificate_number)
    const newNumber = generateCertificateNumber(existingNumbers)
    setFormData({ ...formData, certificate_number: newNumber })
    setGenerating(false)
  }

  // Generate on form open
  function handleOpenForm() {
    const existingNumbers = certificates.map(c => c.certificate_number)
    const newNumber = generateCertificateNumber(existingNumbers)
    setFormData({ student_id: '', course_id: '', certificate_number: newNumber })
    setShowForm(true)
  }

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault()

    // Check for duplicate certificate number
    const existingNumbers = certificates.map(c => c.certificate_number)
    if (existingNumbers.includes(formData.certificate_number)) {
      // Regenerate if duplicate
      const newNumber = generateCertificateNumber(existingNumbers)
      setFormData({ ...formData, certificate_number: newNumber })
      return
    }

    await createRecord('certificates', {
      user_id: formData.student_id,
      course_id: formData.course_id,
      certificate_number: formData.certificate_number,
      issued_at: new Date().toISOString(),
    })
    setShowForm(false)
    setFormData({ student_id: '', course_id: '', certificate_number: '' })
    fetchData()
  }

  const filteredCertificates = certificates.filter((c) =>
    c.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificate_number.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Certificate Management</h1>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleOpenForm}>
          <Plus className="h-4 w-4" /> Issue Certificate
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Issue New Certificate</h2>
          <form onSubmit={handleIssue} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="student" className="text-slate-700">Student</Label>
              <select
                id="student"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="course" className="text-slate-700">Course</Label>
              <select
                id="course"
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="certNumber" className="text-slate-700">Certificate Number</Label>
              <div className="flex gap-2">
                <Input
                  id="certNumber"
                  placeholder="SP-2024-XXXXX"
                  value={formData.certificate_number}
                  onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value.toUpperCase() })}
                  className="border-slate-300 font-mono"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateNumber}
                  disabled={generating}
                  className="shrink-0 border-slate-300"
                >
                  <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Issue</Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search certificates..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Student</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Course</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Certificate #</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Issued</th>
              <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredCertificates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-500">No certificates found.</td>
              </tr>
            ) : (
              filteredCertificates.map((cert) => (
                <tr key={cert.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-blue-600">{(cert.profiles?.full_name || 'U').charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{cert.profiles?.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{cert.courses?.title || 'Unknown'}</td>
                  <td className="px-5 py-3.5 text-sm font-mono font-medium text-slate-900">{cert.certificate_number}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <a href={`/api/certificates/${cert.id}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="gap-1 hover:bg-blue-50 hover:text-blue-600">
                        <Download className="h-4 w-4" /> PDF
                      </Button>
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
