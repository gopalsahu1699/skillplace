'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import PhoneInput from '@/components/ui/phone-input'
import { sanitizePhone, displayPhone } from '@/lib/validation/phone'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
} from 'lucide-react'

interface Student {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  program_type: string | null
  batch_id: string | null
  branch_id: string | null
  is_active: boolean | null
  enrolled_at: string | null
  created_at: string | null
  updated_at: string | null
  branches?: { name: string } | null
  batches?: { name: string } | null
}

interface Branch {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  is_active: boolean | null
  created_at: string | null
}

interface Batch {
  id: string
  name: string
  description: string | null
  course_id: string | null
  program_type: string
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

interface StudentForm {
  full_name: string
  email: string
  phone: string
  program_type: string
  branch_id: string
  batch_id: string
  is_active: boolean
}

const PAGE_SIZE = 20

const EMPTY_FORM: StudentForm = {
  full_name: '',
  email: '',
  phone: '',
  program_type: '',
  branch_id: '',
  batch_id: '',
  is_active: true,
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterBranch, setFilterBranch] = useState('')
  const [filterBatch, setFilterBatch] = useState('')
  const [filterProgram, setFilterProgram] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<StudentForm>({ ...EMPTY_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkBatchId, setBulkBatchId] = useState('')
  const [showBulkBatch, setShowBulkBatch] = useState(false)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const data = await getRecords('students', undefined, undefined, '*,branches(name),batches(name)')
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a: Student, b: Student) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )
      setStudents(sorted)
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const data = await getRecords('branches')
      setBranches(Array.isArray(data) ? data : [])
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Failed to load branches')
    }
  }

  const fetchBatches = async () => {
    try {
      const data = await getRecords('batches')
      setBatches(Array.isArray(data) ? data : [])
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Failed to load batches')
    }
  }

  useEffect(() => {
    Promise.all([fetchStudents(), fetchBranches(), fetchBatches()])
  }, [])

  const programTypes = Array.from(
    new Set(students.map((s) => (s.program_type || '').trim()).filter(Boolean))
  ).sort()

  const filtered = students.filter((s) => {
    const q = (search || '').toLowerCase()
    const matchSearch =
      !q ||
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q)
    const matchBranch = !filterBranch || s.branch_id === filterBranch
    const matchBatch = !filterBatch || s.batch_id === filterBatch
    const matchProgram = !filterProgram || (s.program_type || '') === filterProgram
    return matchSearch && matchBranch && matchBatch && matchProgram
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  useEffect(() => {
    setPage(0)
  }, [search, filterBranch, filterBatch, filterProgram])

  const resetForm = () => {
    setForm({ ...EMPTY_FORM })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (student: Student) => {
    const phoneDigits = (student.phone || '').replace(/[^\d]/g, '')
    setForm({
      full_name: student.full_name || '',
      email: student.email || '',
      phone: phoneDigits,
      program_type: student.program_type || '',
      branch_id: student.branch_id || '',
      batch_id: student.batch_id || '',
      is_active: student.is_active ?? true,
    })
    setEditingId(student.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim()) return
    setSubmitting(true)
    try {
      const fullPhone = form.phone ? sanitizePhone(form.phone) || null : null

      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: fullPhone,
        program_type: form.program_type.trim() || null,
        branch_id: form.branch_id || null,
        batch_id: form.batch_id || null,
        is_active: form.is_active,
      }
      if (editingId) {
        await updateRecord('students', editingId, payload)
        notify.studentUpdated()
      } else {
        await createRecord('students', payload)
        notify.studentAdded()
      }
      resetForm()
      await fetchStudents()
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmId) return
    setDeleting(true)
    try {
      await deleteRecord('students', deleteConfirmId)
      notify.studentDeleted()
      setDeleteConfirmId(null)
      await fetchStudents()
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (student: Student) => {
    try {
      await updateRecord('students', student.id, { is_active: !(student.is_active ?? true) })
      notify.statusToggled(!(student.is_active ?? true))
      await fetchStudents()
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Failed to toggle status')
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paged.length && paged.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paged.map((s) => s.id)))
    }
  }

  const handleBulkAssignBatch = async () => {
    if (selectedIds.size === 0 || !bulkBatchId) return
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          updateRecord('students', id, { batch_id: bulkBatchId })
        )
      )
      notify.studentsAssignedToBatch(selectedIds.size)
      setSelectedIds(new Set())
      setBulkBatchId('')
      setShowBulkBatch(false)
      await fetchStudents()
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Batch assignment failed')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => deleteRecord('students', id))
      )
      notify.studentsDeleted(selectedIds.size)
      setSelectedIds(new Set())
      await fetchStudents()
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Bulk delete failed')
    }
  }

  const getBranchName = (student: Student): string => {
    if (student.branches && typeof student.branches === 'object' && 'name' in student.branches) {
      return student.branches.name
    }
    return ''
  }

  const getBatchName = (student: Student): string => {
    if (student.batches && typeof student.batches === 'object' && 'name' in student.batches) {
      return student.batches.name
    }
    return ''
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-sm text-slate-500 mt-1">{filtered.length} students total</p>
        </div>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Student' : 'Add Student'}
              </h2>
              <Button variant="ghost" size="icon-sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Full Name *</label>
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Enter full name"
                  className="border-slate-300 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter email"
                  className="border-slate-300 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <div className="mt-1">
                  <PhoneInput
                    value={form.phone}
                    onChange={(num) => setForm({ ...form, phone: num })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Program Type</label>
                <Input
                  value={form.program_type}
                  onChange={(e) => setForm({ ...form, program_type: e.target.value })}
                  placeholder="e.g. Online Course, Offline, Hybrid"
                  className="border-slate-300 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Branch</label>
                <select
                  value={form.branch_id}
                  onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Batch</label>
                <select
                  value={form.batch_id}
                  onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Batch</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Active</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.is_active ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-300"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Student</h2>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this student? This action cannot be undone.
            </p>
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                className="border-slate-300"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-slate-300"
          />
        </div>
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={filterBatch}
          onChange={(e) => setFilterBatch(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        {programTypes.length > 0 && (
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Programs</option>
            {programTypes.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={() => setShowBulkBatch(!showBulkBatch)}
          >
            Assign Batch
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleBulkDelete}
          >
            Delete Selected
          </Button>
          {showBulkBatch && (
            <div className="flex items-center gap-2 ml-2">
              <select
                value={bulkBatchId}
                onChange={(e) => setBulkBatchId(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm"
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleBulkAssignBatch}
                disabled={!bulkBatchId}
              >
                Confirm
              </Button>
            </div>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users className="h-12 w-12 mb-3" />
            <p className="text-sm">No students found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600 w-10">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="flex items-center justify-center"
                    >
                      {selectedIds.size === paged.length && paged.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                    Name
                  </th>
                  <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                    Email
                  </th>
                  <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                    Phone
                  </th>
                  <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                    Branch
                  </th>
                  <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                    Batch
                  </th>
                  <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                    Program Type
                  </th>
                  <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="text-right px-5 py-3.5 text-sm font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.map((student) => (
                  <React.Fragment key={student.id}>
                    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => toggleSelect(student.id)}
                          className="flex items-center justify-center"
                        >
                          {selectedIds.has(student.id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-900">
                        {student.full_name || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {student.email || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {displayPhone(student.phone) || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {getBranchName(student) || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {getBatchName(student) || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {student.program_type || '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          className={
                            student.is_active
                              ? 'bg-green-100 text-green-700 border-0'
                              : 'bg-slate-100 text-slate-500 border-0'
                          }
                        >
                          {student.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleEdit(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="hover:bg-amber-50 hover:text-amber-600"
                            onClick={() => handleToggleActive(student)}
                          >
                            {student.is_active ? '●' : '○'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeleteConfirmId(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
