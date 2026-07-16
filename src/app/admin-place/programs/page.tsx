'use client'
import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, Loader2, AlertCircle, Star, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord, getCombinedProgramsData, batchUpdateProgramCourses } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import type { TrainingProgram, ProgramCourse, Branch, Course, ProgramFee } from '@/types'
import dynamic from 'next/dynamic'

const ProgramFormDialog = dynamic(() => import('@/components/admin/ProgramFormDialog'), { ssr: false })
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog'

interface ProgramFormData {
  name: string
  slug: string
  description: string
  short_description: string
  program_type: string
  branch_id: string
  duration_weeks: number
  is_featured: boolean
  skill_level: string
  career_outcome: string
  student_count: number
  rating: number
  display_order: number
  is_active: boolean
}

const INITIAL_FORM_DATA: ProgramFormData = {
  name: '',
  slug: '',
  description: '',
  short_description: '',
  program_type: 'offline',
  branch_id: '',
  duration_weeks: 0,
  is_featured: false,
  skill_level: '',
  career_outcome: '',
  student_count: 0,
  rating: 0,
  display_order: 0,
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
  const [programFees, setProgramFees] = useState<Record<string, ProgramFee[]>>({})
  const [feeData, setFeeData] = useState<Record<string, { price: number; discount_price: number; is_active: boolean; is_popular: boolean; display_order: number }>>({
    online: { price: 0, discount_price: 0, is_active: false, is_popular: false, display_order: 0 },
    offline: { price: 0, discount_price: 0, is_active: false, is_popular: false, display_order: 0 },
    hybrid: { price: 0, discount_price: 0, is_active: false, is_popular: false, display_order: 0 },
  })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  const PAGE_SIZE = 10
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
      const data = await getCombinedProgramsData()
      if (!data) throw new Error('Session expired')

      const sortedPrograms = (data.programs || []).sort((a: TrainingProgram, b: TrainingProgram) =>
        (a.created_at || '').localeCompare(b.created_at || '')
      )
      setPrograms(sortedPrograms)
      setBranches((data.branches || []).filter((b: Branch) => b.is_active !== false))
      setCourses(data.courses || [])

      const pcMap: Record<string, string[]> = {}
      const rawPc: ProgramCourse[] = (data.programCourses || []).sort(
        (a: ProgramCourse, b: ProgramCourse) => (a.order_index || 0) - (b.order_index || 0)
      )
      for (const pc of rawPc) {
        if (!pcMap[pc.program_id]) pcMap[pc.program_id] = []
        pcMap[pc.program_id].push(pc.course_id)
      }
      setProgramCourses(pcMap)
      setAllProgramCourses(rawPc)

      const feesMap: Record<string, ProgramFee[]> = {}
      for (const fee of (data.programFees || []) as ProgramFee[]) {
        if (!feesMap[fee.program_id]) feesMap[fee.program_id] = []
        feesMap[fee.program_id].push(fee)
      }
      setProgramFees(feesMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load programs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => fetchData())
  }, [fetchData])

  async function saveProgramFees(programId: string) {
    for (const [mode, data] of Object.entries(feeData)) {
      if (!data.is_active) {
        const existing = programFees[programId]?.find((f) => f.program_type === mode)
        if (existing) {
          await updateRecord('program_fees', existing.id, { is_active: false })
        }
        continue
      }

      const existing = programFees[programId]?.find((f) => f.program_type === mode)
      const payload = {
        program_id: programId,
        program_type: mode,
        price: data.price,
        discount_price: data.discount_price || null,
        is_active: true,
        is_popular: data.is_popular ?? false,
        display_order: data.display_order ?? 0,
      }

      if (existing) {
        await updateRecord('program_fees', existing.id, payload)
      } else {
        await createRecord('program_fees', payload)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const features = featuresText
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean)

      const activeModes = Object.entries(feeData).filter(([, d]) => d.is_active).map(([mode]) => mode)
      const body = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        short_description: formData.short_description || null,
        program_type: activeModes.length > 0 ? activeModes[0] : 'offline',
        branch_id: formData.branch_id || null,
        duration_weeks: formData.duration_weeks || null,
        features,
        is_featured: formData.is_featured,
        skill_level: formData.skill_level || null,
        career_outcome: formData.career_outcome || null,
        student_count: formData.student_count,
        rating: formData.rating,
        display_order: formData.display_order,
        is_active: formData.is_active,
      }

      let programId: string
      let updatedProgram: TrainingProgram

      if (editingProgram) {
        const updated = await updateRecord('training_programs', editingProgram.id, body)
        programId = updated.id || editingProgram.id
        updatedProgram = updated

        const oldCourseIds = allProgramCourses
          .filter((pc) => pc.program_id === programId)
          .map((pc) => pc.course_id)

        const changed = oldCourseIds.length !== selectedCourses.length ||
          !oldCourseIds.every((id, i) => id === selectedCourses[i])

        if (changed) {
          await batchUpdateProgramCourses(programId, selectedCourses)
        }

        notify.courseUpdated()
      } else {
        const created = await createRecord('training_programs', body)
        programId = created.id
        updatedProgram = created

        if (selectedCourses.length > 0) {
          await batchUpdateProgramCourses(programId, selectedCourses)
        }

        notify.courseCreated()
      }

      await saveProgramFees(programId)

      setPrograms((prev) => {
        const idx = prev.findIndex((p) => p.id === programId)
        const updated = { ...body, id: programId, branches: null } as unknown as TrainingProgram
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = { ...copy[idx], ...updated }
          return copy
        }
        return [updated, ...prev]
      })

      setProgramCourses((prev) => ({ ...prev, [programId]: selectedCourses }))

      setShowForm(false)
      setEditingProgram(null)
      resetForm()
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Failed to save program')
      setPrograms((prev) => [...prev])
      setProgramCourses((prev) => ({ ...prev }))
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
    const deletedId = deletingProgram.id
    try {
      setPrograms((prev) => prev.filter((p) => p.id !== deletedId))
      setShowDeleteConfirm(false)
      setDeletingProgram(null)
      await deleteRecord('training_programs', deletedId)
      notify.courseDeleted()
    } catch (err) {
      fetchData()
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
      duration_weeks: program.duration_weeks || 0,
      is_featured: program.is_featured ?? false,
      skill_level: program.skill_level || '',
      career_outcome: program.career_outcome || '',
      student_count: program.student_count || 0,
      rating: program.rating || 0,
      display_order: program.display_order || 0,
      is_active: program.is_active ?? true,
    })
    setFeaturesText((program.features || []).join(', '))
    setSelectedCourses(programCourses[program.id] || [])

    const existingFees = programFees[program.id] || []
    const newFeeData: Record<string, { price: number; discount_price: number; is_active: boolean; is_popular: boolean; display_order: number }> = {
      online: { price: 0, discount_price: 0, is_active: false, is_popular: false, display_order: 0 },
      offline: { price: 0, discount_price: 0, is_active: false, is_popular: false, display_order: 0 },
      hybrid: { price: 0, discount_price: 0, is_active: false, is_popular: false, display_order: 0 },
    }
    for (const fee of existingFees) {
      if (newFeeData[fee.program_type]) {
        newFeeData[fee.program_type] = {
          price: fee.price,
          discount_price: fee.discount_price || 0,
          is_active: fee.is_active,
          is_popular: fee.is_popular ?? false,
          display_order: fee.display_order ?? 0,
        }
      }
    }
    setFeeData(newFeeData)
    setShowForm(true)
  }

  function resetForm() {
    setFormData(INITIAL_FORM_DATA)
    setFeaturesText('')
    setSelectedCourses([])
    setFeeData({
      online: { price: 0, discount_price: 0, is_active: false, is_popular: false, display_order: 0 },
      offline: { price: 0, discount_price: 0, is_active: false, is_popular: false, display_order: 0 },
      hybrid: { price: 0, discount_price: 0, is_active: false, is_popular: false, display_order: 0 },
    })
  }

  function toggleCourse(courseId: string) {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((c) => c !== courseId) : [...prev, courseId]
    )
  }

  function moveCourse(index: number, direction: 'up' | 'down') {
    setSelectedCourses((prev) => {
      const arr = [...prev]
      const swapIndex = direction === 'up' ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= arr.length) return prev
      ;[arr[index], arr[swapIndex]] = [arr[swapIndex], arr[index]]
      return arr
    })
  }

  async function toggleFeatured(program: TrainingProgram) {
    const newValue = !program.is_featured
    try {
      await updateRecord('training_programs', program.id, { is_featured: newValue })
      setPrograms((prev) =>
        prev.map((p) => (p.id === program.id ? { ...p, is_featured: newValue } : p))
      )
      notify.statusToggled(newValue)
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Failed to update featured status')
    }
  }

  const filteredPrograms = programs.filter((p) =>
    (p.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPrograms.length / PAGE_SIZE)
  const pagedPrograms = filteredPrograms.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

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

      <ProgramFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        formData={formData}
        onChange={setFormData}
        featuresText={featuresText}
        onFeaturesChange={setFeaturesText}
        selectedCourses={selectedCourses}
        onToggleCourse={toggleCourse}
        onMoveCourse={moveCourse}
        submitting={submitting}
        editingProgram={editingProgram}
        branches={branches}
        courses={courses}
        onSubmit={handleSubmit}
        feeData={feeData}
        onFeeChange={setFeeData}
      />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search programs..."
            className="pl-10 border-slate-300"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
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
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Featured</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading programs...
                  </td>
                </tr>
              ) : filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    {search ? 'No programs match your search.' : 'No training programs found. Create your first program!'}
                  </td>
                </tr>
              ) : (
                pagedPrograms.map((program) => (
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
                    <td className="px-5 py-3.5 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {(programFees[program.id] || []).filter(f => f.is_active).length > 0
                          ? (programFees[program.id] || []).filter(f => f.is_active).map(f => (
                              <span key={f.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{
                                  backgroundColor: f.program_type === 'online' ? '#f3e8ff' : f.program_type === 'offline' ? '#dbeafe' : '#fef3c7',
                                  color: f.program_type === 'online' ? '#7c3aed' : f.program_type === 'offline' ? '#2563eb' : '#d97706',
                                }}
                              >
                                {f.program_type === 'online' ? 'Online' : f.program_type === 'offline' ? 'Offline' : 'Hybrid'}
                                : ₹{(f.discount_price || f.price).toLocaleString()}
                              </span>
                            ))
                          : <span className="text-slate-400">—</span>
                        }
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {program.duration_weeks ? `${program.duration_weeks}w` : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {(programCourses[program.id] || []).length}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleFeatured(program)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                        title={program.is_featured ? 'Click to remove from featured' : 'Click to mark as featured'}
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            program.is_featured
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-300 fill-transparent'
                          }`}
                        />
                        <span className={
                          program.is_featured ? 'text-amber-700 bg-amber-50' : 'text-slate-400 bg-slate-100'
                        }>
                          {program.is_featured ? 'Featured' : 'Not Featured'}
                        </span>
                      </button>
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
        {filteredPrograms.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredPrograms.length)} of{' '}
              {filteredPrograms.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="border-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600 font-medium px-2">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="border-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AdminDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDelete}
        title="Program"
        itemName={deletingProgram?.name || 'this item'}
      />
    </div>
  )
}
