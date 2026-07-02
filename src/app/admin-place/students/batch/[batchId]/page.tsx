'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { PROGRAM_TYPES, PROGRAM_TYPE_COLORS } from '@/lib/constants'
import { getRecords, createRecord, updateRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import { ArrowLeft, Plus, Trash2, Users, Calendar, BookOpen, Eye } from 'lucide-react'
import Link from 'next/link'
import { displayPhone } from '@/lib/validation/phone'
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog'

interface BatchInfo {
  id: string
  name: string
  description: string | null
  course_id: string | null
  program_type: string
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  courses?: { title: string } | null
}

interface BatchStudent {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  is_active: boolean
  created_at: string
  enrollments: { id: string; status: string; courses: { title: string } | null }[]
}

export default function BatchDetailPage() {
  const params = useParams()
  const batchId = params.batchId as string

  const [batch, setBatch] = useState<BatchInfo | null>(null)
  const [students, setStudents] = useState<BatchStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingStudent, setDeletingStudent] = useState<BatchStudent | null>(null)
  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [newStudentName, setNewStudentName] = useState('')
  const [search, setSearch] = useState('')
  const [showDetail, setShowDetail] = useState(false)
  const [detailStudent, setDetailStudent] = useState<BatchStudent | null>(null)

  const fetchBatchData = useCallback(async () => {
    setLoading(true)
    try {
      const batchData = await getRecords('batches', 'id', batchId)
      if (batchData && batchData.length > 0) {
        const batch = batchData[0]
        if (batch.course_id) {
          const courseData = await getRecords('courses', 'id', batch.course_id, 'title')
          batch.courses = courseData?.[0] ? { title: courseData[0].title } : null
        }
        setBatch(batch)
      }

      const studentData = await getRecords('profiles', 'batch_id', batchId, '*,enrollments(*,training_programs(*))')
      if (studentData) {
        setStudents(studentData.filter((s: { role: string }) => s.role === 'student'))
      }
    } catch {
      notify.genericError('Failed to load batch data')
    }
    setLoading(false)
  }, [batchId])

  useEffect(() => {
    fetchBatchData()
  }, [fetchBatchData])

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault()
    if (!newStudentEmail.trim()) return

    try {
      const existing = await getRecords('profiles', 'email', newStudentEmail.trim())
      if (existing && existing.length > 0) {
        const existingStudent = existing[0]
        if (existingStudent.batch_id === batchId) {
          notify.genericError('Student is already in this batch')
          return
        }
        await updateRecord('profiles', existingStudent.id, { batch_id: batchId })
        notify.studentUpdated()
      } else {
        await createRecord('profiles', {
          id: crypto.randomUUID(),
          full_name: newStudentName.trim() || null,
          email: newStudentEmail.trim(),
          role: 'student',
          batch_id: batchId,
          program_type: batch?.program_type || 'online_course',
          is_active: true,
        })
        notify.studentAdded()
      }
      setShowAddStudent(false)
      setNewStudentEmail('')
      setNewStudentName('')
      fetchBatchData()
    } catch {
      notify.genericError('Failed to add student')
    }
  }

  async function handleRemoveStudent() {
    if (!deletingStudent) return
    try {
      await updateRecord('profiles', deletingStudent.id, { batch_id: null })
      notify.studentUpdated()
    } catch {
      notify.genericError('Failed to remove student from batch')
    }
    setShowDeleteConfirm(false)
    setDeletingStudent(null)
    fetchBatchData()
  }

  const filteredStudents = students.filter((s) =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500">Loading batch...</p>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium text-slate-900">Batch not found</p>
        <Link href="/admin-place/students" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Students
        </Link>
      </div>
    )
  }

  const ptColor = PROGRAM_TYPE_COLORS[batch.program_type] || 'bg-slate-100 text-slate-700'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin-place/students" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{batch.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={`text-xs ${ptColor}`}>
              {PROGRAM_TYPES.find((p) => p.id === batch.program_type)?.label || batch.program_type}
            </Badge>
            {batch.courses?.title && (
              <span className="text-sm text-slate-500">{batch.courses.title}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{students.length}</p>
                <p className="text-xs text-slate-500">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {batch.start_date || 'Not set'}
                </p>
                <p className="text-xs text-slate-500">Start Date</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {batch.end_date || 'Not set'}
                </p>
                <p className="text-xs text-slate-500">End Date</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search students..."
              className="pl-4 border-slate-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowAddStudent(true)}
          >
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Name</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Email</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Phone</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Enrollments</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    {students.length === 0 ? 'No students in this batch yet.' : 'No students match your search.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-blue-600">{(student.full_name || 'U').charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{student.full_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{student.email}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{displayPhone(student.phone) || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">{student.enrollments?.length || 0}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={student.is_active ? 'default' : 'destructive'} className={student.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-700 border-0'}>
                        {student.is_active ? 'active' : 'inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setDetailStudent(student); setShowDetail(true) }}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setDeletingStudent(student); setShowDeleteConfirm(true) }}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Student to Batch</DialogTitle>
            <DialogDescription>
              Add an existing student or create a new one in this batch
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email *</label>
              <Input
                type="email"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                placeholder="student@example.com"
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name (optional)</label>
              <Input
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Student name"
                className="border-slate-300"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddStudent(false)} className="border-slate-300">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AdminDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleRemoveStudent}
        title="Student"
        itemName={deletingStudent?.full_name || deletingStudent?.email || 'this item'}
      />

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {detailStudent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Full Name</p>
                  <p className="text-sm font-medium text-slate-900">{detailStudent.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-slate-900">{detailStudent.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{displayPhone(detailStudent.phone) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Status</p>
                  <Badge className={detailStudent.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-700 border-0'}>
                    {detailStudent.is_active ? 'active' : 'inactive'}
                  </Badge>
                </div>
              </div>
              {detailStudent.enrollments && detailStudent.enrollments.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Enrolled Courses</p>
                  <div className="space-y-1">
                    {detailStudent.enrollments.map((enroll, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-slate-700">{enroll.courses?.title || 'Unknown Course'}</span>
                        <Badge variant="outline" className="text-xs">{enroll.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetail(false)} className="border-slate-300">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
