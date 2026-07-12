'use client'
import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Loader2, GripVertical, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
import type { CareerDiscipline } from '@/types'
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog'

interface FormData {
  name: string
  slug: string
  color: string
  gradient_from: string
  gradient_to: string
  roles: string
  skills: string
  demand: string
  salary: string
  growth: string
  popular: boolean
  display_order: number
  is_active: boolean
}

const INITIAL_FORM: FormData = {
  name: '',
  slug: '',
  color: 'border-blue-500',
  gradient_from: 'from-blue-500',
  gradient_to: 'to-indigo-600',
  roles: '',
  skills: '',
  demand: '',
  salary: '',
  growth: '',
  popular: false,
  display_order: 0,
  is_active: true,
}

export default function AdminCareersPage() {
  const [disciplines, setDisciplines] = useState<CareerDiscipline[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CareerDiscipline | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState<CareerDiscipline | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)

  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await getRecords('career_disciplines')
      if (!data) {
        setFetchError('Request returned no data — session may be expired')
        return
      }
      const sorted = (data as CareerDiscipline[]).sort(
        (a, b) => a.display_order - b.display_order
      )
      setDisciplines(sorted)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load disciplines')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => fetchData())
  }, [fetchData])

  function openCreate() {
    setEditing(null)
    setFormData(INITIAL_FORM)
    setShowForm(true)
  }

  function openEdit(d: CareerDiscipline) {
    setEditing(d)
    setFormData({
      name: d.name,
      slug: d.slug,
      color: d.color,
      gradient_from: d.gradient_from,
      gradient_to: d.gradient_to,
      roles: d.roles.join(', '),
      skills: d.skills.join(', '),
      demand: d.demand,
      salary: d.salary,
      growth: d.growth,
      popular: d.popular,
      display_order: d.display_order,
      is_active: d.is_active,
    })
    setShowForm(true)
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim() || !formData.slug.trim()) return
    setSubmitting(true)
    try {
      const body = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        color: formData.color,
        gradient_from: formData.gradient_from,
        gradient_to: formData.gradient_to,
        roles: formData.roles.split(',').map((s) => s.trim()).filter(Boolean),
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        demand: formData.demand,
        salary: formData.salary,
        growth: formData.growth,
        popular: formData.popular,
        display_order: formData.display_order,
        is_active: formData.is_active,
      }

      if (editing) {
        await updateRecord('career_disciplines', editing.id, { ...body, updated_at: new Date().toISOString() })
        notify.careerUpdated()
      } else {
        await createRecord('career_disciplines', body)
        notify.careerCreated()
      }

      setShowForm(false)
      setEditing(null)
      setFormData(INITIAL_FORM)
      fetchData()
    } catch (err) {
      notify.genericError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  function handleDeleteClick(d: CareerDiscipline) {
    setDeleting(d)
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      setDisciplines((prev) => prev.filter((d) => d.id !== deleting.id))
      setShowDeleteConfirm(false)
      setDeleting(null)
      await deleteRecord('career_disciplines', deleting.id)
      notify.careerDeleted()
    } catch (err) {
      fetchData()
      notify.genericError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Career Disciplines</h1>
          <p className="text-sm text-slate-500 mt-1">Manage career paths, roles, and skills</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Discipline
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editing ? 'Edit Discipline' : 'Add New Discipline'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData({
                      ...formData,
                      name,
                      slug: editing ? formData.slug : autoSlug(name),
                    })
                  }}
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
                <Input
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Border Color</label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="border-blue-500"
                  className="border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gradient From</label>
                <Input
                  value={formData.gradient_from}
                  onChange={(e) => setFormData({ ...formData, gradient_from: e.target.value })}
                  placeholder="from-blue-500"
                  className="border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gradient To</label>
                <Input
                  value={formData.gradient_to}
                  onChange={(e) => setFormData({ ...formData, gradient_to: e.target.value })}
                  placeholder="to-indigo-600"
                  className="border-slate-300 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Demand</label>
                <Input
                  value={formData.demand}
                  onChange={(e) => setFormData({ ...formData, demand: e.target.value })}
                  placeholder="High - Infrastructure boom..."
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                <Input
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="₹3.5L - ₹12L / year"
                  className="border-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Growth</label>
                <Input
                  value={formData.growth}
                  onChange={(e) => setFormData({ ...formData, growth: e.target.value })}
                  placeholder="15% annual growth"
                  className="border-slate-300"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Job Roles <span className="text-slate-400 font-normal">(comma separated)</span>
                </label>
                <Input
                  value={formData.roles}
                  onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                  placeholder="Site Engineer, Quantity Surveyor, Billing Engineer"
                  className="border-slate-300"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Required Skills <span className="text-slate-400 font-normal">(comma separated)</span>
                </label>
                <Input
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="AutoCAD, Revit, Staad Pro"
                  className="border-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                  className="rounded border-slate-300"
                />
                Popular (shows HOT badge)
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-300"
                />
                Active
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                ) : (
                  editing ? 'Update Discipline' : 'Create Discipline'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setEditing(null); setFormData(INITIAL_FORM) }}
                className="border-slate-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{fetchError}</p>
          <Button variant="outline" size="sm" onClick={fetchData} className="border-red-300 text-red-700 hover:bg-red-50">
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Order</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Name</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Roles</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Skills</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left px-5 py-3.5 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading disciplines...
                  </td>
                </tr>
              ) : disciplines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    No disciplines found. Add your first career discipline!
                  </td>
                </tr>
              ) : (
                disciplines.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-3.5 w-3.5 text-slate-300" />
                        {d.display_order}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-8 rounded-full ${d.color}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">{d.name}</span>
                            {d.popular && (
                              <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5">
                                HOT
                              </Badge>
                            )}
                          </div>
                          {expandedId === d.id && (
                            <div className="mt-2 space-y-1 text-xs text-slate-500">
                              <p><span className="font-medium">Slug:</span> {d.slug}</p>
                              <p><span className="font-medium">Demand:</span> {d.demand}</p>
                              <p><span className="font-medium">Salary:</span> {d.salary}</p>
                              <p><span className="font-medium">Growth:</span> {d.growth}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {d.roles.slice(0, expandedId === d.id ? d.roles.length : 2).map((role, i) => (
                          <Badge key={i} className="bg-slate-100 text-slate-600 border-0 text-[10px]">
                            {role}
                          </Badge>
                        ))}
                        {d.roles.length > 2 && expandedId !== d.id && (
                          <span className="text-[10px] text-slate-400">+{d.roles.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {d.skills.slice(0, expandedId === d.id ? d.skills.length : 2).map((skill, i) => (
                          <Badge key={i} className="bg-blue-50 text-blue-600 border-0 text-[10px]">
                            {skill}
                          </Badge>
                        ))}
                        {d.skills.length > 2 && expandedId !== d.id && (
                          <span className="text-[10px] text-slate-400">+{d.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        className={
                          d.is_active
                            ? 'bg-green-100 text-green-700 border-0'
                            : 'bg-slate-100 text-slate-600 border-0'
                        }
                      >
                        {d.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                          className="hover:bg-slate-100 hover:text-slate-600"
                        >
                          {expandedId === d.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(d)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteClick(d)}
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

      <AdminDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDelete}
        title="Career Discipline"
        itemName={deleting?.name || 'this item'}
      />
    </div>
  )
}
