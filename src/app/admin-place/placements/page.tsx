'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  GraduationCap,
  Building2,
  Star,
  Plus,
  Trash2,
  Eye,
  DollarSign,
  Briefcase,
  Search,
  X,
} from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { displayPhone } from '@/lib/validation/phone'

interface StudentRecord {
  id: string
  full_name: string
  email: string
  phone: string | null
}

interface Placement {
  id: string
  student_id: string
  course_id: string | null
  company_name: string | null
  role: string | null
  package_lpa: number | null
  placed_at: string
  notes: string | null
  is_featured: boolean
  created_at: string
}

interface PlacementWithStudent extends Placement {
  student?: StudentRecord | null
}

export default function AdminPlacementsPage() {
  const [placements, setPlacements] = useState<PlacementWithStudent[]>([])
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlacement, setEditingPlacement] = useState<PlacementWithStudent | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingPlacement, setDeletingPlacement] = useState<PlacementWithStudent | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    company_name: '',
    role: '',
    package_lpa: '',
    notes: '',
    is_featured: false,
  })

  // Student search state
  const [studentSearch, setStudentSearch] = useState('')
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null)
  const studentSearchRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      const [placementsData, studentsData] = await Promise.all([
        getRecords('placements'),
        getRecords('students'),
      ])

      const studentList: StudentRecord[] = (studentsData || []).map((s: any) => ({
        id: s.id,
        full_name: s.full_name || '',
        email: s.email || '',
        phone: s.phone,
      }))
      setStudents(studentList)

      const studentMap = new Map(studentList.map((s) => [s.id, s]))

      const enrichedPlacements: PlacementWithStudent[] = (placementsData || []).map((p: any) => ({
        ...p,
        student: studentMap.get(p.student_id) || null,
      }))

      enrichedPlacements.sort(
        (a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime()
      )
      setPlacements(enrichedPlacements)
    } catch {
      // handled silently
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (studentSearchRef.current && !studentSearchRef.current.contains(event.target as Node)) {
        setStudentDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredStudents = students.filter((s) => {
    const search = studentSearch.toLowerCase().trim()
    if (!search) return true
    return (
      s.full_name.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      (s.phone && s.phone.includes(search))
    )
  })

  function selectStudent(student: StudentRecord) {
    setSelectedStudent(student)
    setFormData({ ...formData, student_id: student.id })
    setStudentSearch('')
    setStudentDropdownOpen(false)
  }

  function clearStudentSelection() {
    setSelectedStudent(null)
    setFormData({ ...formData, student_id: '' })
    setStudentSearch('')
  }

  function openCreate() {
    setEditingPlacement(null)
    setFormData({
      student_id: '',
      course_id: '',
      company_name: '',
      role: '',
      package_lpa: '',
      notes: '',
      is_featured: false,
    })
    setSelectedStudent(null)
    setStudentSearch('')
    setShowForm(true)
  }

  function openEdit(placement: PlacementWithStudent) {
    setEditingPlacement(placement)
    setFormData({
      student_id: placement.student_id,
      course_id: placement.course_id || '',
      company_name: placement.company_name || '',
      role: placement.role || '',
      package_lpa: placement.package_lpa?.toString() || '',
      notes: placement.notes || '',
      is_featured: placement.is_featured || false,
    })
    if (placement.student) {
      setSelectedStudent({
        id: placement.student_id,
        full_name: placement.student.full_name || '',
        email: placement.student.email || '',
        phone: placement.student.phone,
      })
    }
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.student_id) return
    setSaving(true)

    try {
      const payload = {
        student_id: formData.student_id,
        course_id: formData.course_id || null,
        company_name: formData.company_name.trim() || null,
        role: formData.role.trim() || null,
        package_lpa: formData.package_lpa ? parseFloat(formData.package_lpa) : null,
        notes: formData.notes.trim() || null,
        is_featured: formData.is_featured,
        placed_at: new Date().toISOString(),
      }

      if (editingPlacement) {
        await updateRecord('placements', editingPlacement.id, payload)
      } else {
        await createRecord('placements', payload)
      }

      setShowForm(false)
      setEditingPlacement(null)
      fetchData()
    } catch {
      // handled silently
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingPlacement) return
    try {
      await deleteRecord('placements', deletingPlacement.id)
      setShowDeleteConfirm(false)
      setDeletingPlacement(null)
      fetchData()
    } catch {
      // handled silently
    }
  }

  async function toggleFeatured(id: string, currentValue: boolean) {
    try {
      await updateRecord('placements', id, { is_featured: !currentValue })
      fetchData()
    } catch {
      // handled silently
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const totalPackages = placements.filter((p) => p.package_lpa).length
  const avgPackage = totalPackages > 0
    ? (placements.reduce((sum, p) => sum + (p.package_lpa || 0), 0) / totalPackages).toFixed(1)
    : '0'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recent Placements</h1>
          <p className="text-sm text-slate-500 mt-1">Track student placements and mark new ones</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Mark Placement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{placements.length}</p>
            <p className="text-xs text-slate-500">Total Placed</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{avgPackage} LPA</p>
            <p className="text-xs text-slate-500">Avg Package</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Star className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {placements.filter((p) => p.is_featured).length}
            </p>
            <p className="text-xs text-slate-500">Featured</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{students.length}</p>
            <p className="text-xs text-slate-500">Total Students</p>
          </div>
        </div>
      </div>

      {/* Placement Records */}
      {placements.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-slate-900 mb-3">Placement Records</h2>
          <div className="space-y-3">
            {placements.map((placement) => (
              <div
                key={placement.id}
                className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {placement.student?.full_name || 'Unknown'}
                      </p>
                      {placement.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{placement.student?.email || '-'}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {placement.company_name && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                          <Building2 className="h-3 w-3" /> {placement.company_name}
                        </span>
                      )}
                      {placement.role && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                          <Briefcase className="h-3 w-3" /> {placement.role}
                        </span>
                      )}
                      {placement.package_lpa && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                          <DollarSign className="h-3 w-3" /> {placement.package_lpa} LPA
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(placement.placed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(placement.id, placement.is_featured)}
                      className={`p-1.5 rounded-lg text-xs ${
                        placement.is_featured
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={placement.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star className={`h-4 w-4 ${placement.is_featured ? 'fill-yellow-400' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(placement)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      title="Edit"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingPlacement(placement)
                        setShowDeleteConfirm(true)
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPlacement ? 'Edit Placement' : 'Mark Student as Placed'}
            </DialogTitle>
            <DialogDescription>
              {editingPlacement
                ? 'Update placement details'
                : 'Search student by name, email, or mobile number'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingPlacement && (
              <div ref={studentSearchRef} className="relative">
                <label className="text-sm font-medium text-slate-700">
                  Student <span className="text-red-500">*</span>
                </label>
                {selectedStudent ? (
                  <div className="mt-1 flex items-center gap-2 p-3 border border-blue-300 bg-blue-50 rounded-xl">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-600">
                        {selectedStudent.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {selectedStudent.full_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {selectedStudent.email}
                        {selectedStudent.phone && ` • ${displayPhone(selectedStudent.phone)}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearStudentSelection}
                      className="p-1 rounded hover:bg-blue-100 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={studentSearch}
                        onChange={(e) => {
                          setStudentSearch(e.target.value)
                          setStudentDropdownOpen(true)
                        }}
                        onFocus={() => setStudentDropdownOpen(true)}
                        className="pl-10 border-slate-300"
                        placeholder="Search by name, email, or mobile..."
                      />
                    </div>
                    {studentDropdownOpen && filteredStudents.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg">
                        {filteredStudents.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => selectStudent(student)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
                          >
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-blue-600">
                                {student.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {student.full_name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {student.email}
                                {student.phone && ` • ${displayPhone(student.phone)}`}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {studentDropdownOpen && filteredStudents.length === 0 && studentSearch && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
                        <p className="text-sm text-slate-500">No students found matching &quot;{studentSearch}&quot;</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-slate-700">Company Name</label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="border-slate-300 mt-1"
                placeholder="e.g. Tata Technologies"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Role / Position</label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="border-slate-300 mt-1"
                placeholder="e.g. Junior Design Engineer"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Package (LPA)</label>
              <Input
                type="number"
                step="0.1"
                value={formData.package_lpa}
                onChange={(e) => setFormData({ ...formData, package_lpa: e.target.value })}
                className="border-slate-300 mt-1"
                placeholder="e.g. 4.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border-slate-300 mt-1"
                placeholder="Optional notes about the placement"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded"
                id="featured-placement"
              />
              <label htmlFor="featured-placement" className="text-sm text-slate-600">
                Show as featured on website
              </label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.student_id}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving
                  ? 'Saving...'
                  : editingPlacement
                    ? 'Update'
                    : 'Mark Placed'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Placement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">
                {deletingPlacement?.student?.full_name || 'this'}
              </span>
              &apos;s placement record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
