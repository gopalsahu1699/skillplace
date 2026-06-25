'use client'
import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Search, Plus, Edit, Trash2, X, Loader2, AlertCircle } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import type { TrainingProgram, ProgramCourse, Branch, Course } from '@/types'

interface ProgramFormData {
  name: string
  slug: string
  description: string
  short_description: string
  program_type: string
  branch_id: string
  price: number
  discount_price: number
  duration_weeks: number
  is_active: boolean
}

const INITIAL_FORM_DATA: ProgramFormData = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  program_type: 'offline',
  branch_id: '',
  price: 0,
  discount_price: 0,
  duration_weeks: 0,
  is_active: true,
}

const PROGRAM_TYPE_BADGE: Record<string, string> = {
  offline: 'bg-blue-100 text-blue-700 border-0',
  online: 'bg-purple-100 text-purple-700 border-0',
  hybrid: 'bg-amber-100 text-amber-700 border-0',
}

const PROGRAM_TYPE_LABEL: Record<string, string> = {
  offline: 'Offline',
  online: 'Online',
  hybrid: 'Hybrid',
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [programCourses, setProgramCourses] = useState<Record<string, string[]>>({})
  const [allProgramCourses, setAllProgramCourses] = useState<ProgramCourse[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [featuresText, setFeaturesText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingProgram, setDeletingProgram] = useState<TrainingProgram | null>(null)
  const [formData, setFormData] = useState<ProgramFormData>(INITIAL_FORM_DATA)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [programsData, branchesData, coursesData, pcData] = await Promise.all([
        getRecords('training_programs', undefined, undefined, '*,branches(name)'),
        getRecords('branches'),
        getRecords('courses'),
        getRecords('program_courses'),
      ])

      const sortedPrograms = (programsData || []).sort((a: TrainingProgram, b: TrainingProgram) =>
        (a.created_at || '').localeCompare(b.created_at || '')
      )
      setPrograms(sortedPrograms)
      setBranches((branchesData || []).filter((b: Branch) => b.is_active !== false))
      setCourses(coursesData || [])

      const pcMap: Record<string, string[]> = {}
      const rawPc: ProgramCourse[] = pcData || []
      for (const pc of rawPc) {
        if (!pcMap[pc.program_id]) pcMap[pc.program_id] = []
        pcMap[pc.program_id].push(pc.course_id)
      }
      setProgramCourses(pcMap)
      setAllProgramCourses(rawPc)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load programs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const features = featuresText
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean)

      const body = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        short_description: formData.short_description || null,
        program_type: formData.program_type,
        branch_id: formData.branch_id || null,
        price: formData.price,
        discount_price: formData.discount_price || null,
        duration_weeks: formData.duration_weeks || null,
        features,
        is_active: formData.is_active,
      }

      let programId: string

      if (editingProgram) {
        const updated = await updateRecord('training_programs', editingProgram.id, body)
        programId = updated.id || editingProgram.id

        const existingCourses = programCourses[editingProgram.id] || []
        const toAdd = selectedCourses.filter((c) => !existingCourses.includes(c))
        const toRemove = existingCourses.filter((c) => !selectedCourses.includes(c))

        for (const courseId of toAdd) {
          await createRecord('program_courses', { program_id: programId, course_id: courseId })
        }
        for (const courseId of toRemove) {
          const pcRecord = allProgramCourses.find(
            (pc) => pc.program_id === programId && pc.course_id === courseId
          )
          if (pcRecord) {
            await deleteRecord('program_courses', pcRecord.id)
          }
        }

        notify.courseUpdated()
      } else {
        const created = await createRecord('training_programs', body)
        programId = created.id

        for (const courseId of selectedCourses) {
          await createRecord('program_courses', { program_id: programId, course_id: courseId })
        }

        notify.courseCreated()
      }

      setShowForm(false)
      setEditingProgram(null)
      resetForm()
      fetchData()
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Failed to save program')
    } finally {
      setSubmitting(false)
    }
  }

  function handleDeleteClick(program: TrainingProgram) {
    setDeletingProgram(program)
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    if (!deletingProgram) return
    try {
      await deleteRecord('training_programs', deletingProgram.id)
      notify.courseDeleted()
      setShowDeleteConfirm(false)
      setDeletingProgram(null)
      fetchData()
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Failed to delete program')
    }
  }

  function handleEdit(program: TrainingProgram) {
    setEditingProgram(program)
    setFormData({
      name: program.name || '',
      slug: program.slug || '',
      description: program.description || '',
      short_description: program.short_description || '',
      program_type: program.program_type || 'offline',
      branch_id: program.branch_id || '',
      price: program.price || 0,
      discount_price: program.discount_price || 0,
      duration_weeks: program.duration_weeks || 0,
      is_active: program.is_active ?? true,
    })
    setFeaturesText((program.features || []).join(', '))
    setSelectedCourses(programCourses[program.id] || [])
    setShowForm(true)
  }

  function resetForm() {
    setFormData(INITIAL_FORM_DATA)
    setFeaturesText('')
    setSelectedCourses([])
  }

  function toggleCourse(courseId: string) {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((c) => c !== courseId) : [...prev, courseId]
    )
  }

  const filteredPrograms = programs.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Training Programs</h1>
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            resetForm()
            setEditingProgram(null)
            setShowForm(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add Program
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData} className="border-red-300 text-red-700 hover:bg-red-50">
            Retry
          </Button>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingProgram ? 'Edit Program' : 'Add New Program'}
            </h2>
            <Button variant="ghost" size="icon-sm" onClick={() => setShowForm(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-slate-300"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Slug *</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="border-slate-300"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="border-slate-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Short Description</label>
              <Input
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="border-slate-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Program Type *</label>
              <select
                value={formData.program_type}
                onChange={(e) => setFormData({ ...formData, program_type: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Branch</label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Price *</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="border-slate-300"
                required
                min={0}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Discount Price</label>
              <Input
                type="number"
                value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: Number(e.target.value) })}
                className="border-slate-300"
                min={0}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Duration (weeks)</label>
              <Input
                type="number"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({ ...formData, duration_weeks: Number(e.target.value) })}
                className="border-slate-300"
                min={0}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Features (comma-separated)</label>
              <Input
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder="100% Job Assistance, Resume Building, Mock Interviews"
                className="border-slate-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Link Courses to Program</label>
              <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                {courses.length === 0 ? (
                  <p className="text-sm text-slate-400">No courses available</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {courses.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 p-1.5 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => toggleCourse(course.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{course.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
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
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {editingProgram ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingProgram ? 'Update Program' : 'Create Program'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search programs..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Name</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Type</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Branch</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Price</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Duration</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Courses</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading programs...
                  </td>
                </tr>
              ) : filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    {search ? 'No programs match your search.' : 'No training programs found. Create your first program!'}
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((program) => (
                  <tr
                    key={program.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">{program.name || 'N/A'}</td>
                    <td className="px-5 py-3.5">
                      <Badge className={PROGRAM_TYPE_BADGE[program.program_type] || 'bg-slate-100 text-slate-700 border-0'}>
                        {PROGRAM_TYPE_LABEL[program.program_type] || program.program_type || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {program.branches?.name || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-900">
                      ₹{(program.price || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {program.duration_weeks ? `${program.duration_weeks}w` : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {(programCourses[program.id] || []).length}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={program.is_active ? 'default' : 'secondary'}
                        className={
                          program.is_active
                            ? 'bg-green-100 text-green-700 border-0'
                            : 'bg-slate-100 text-slate-600 border-0'
                        }
                      >
                        {program.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(program)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(program)}
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

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">{deletingProgram?.name}</span>?
              This action cannot be undone.
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
              onClick={confirmDelete}
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
