'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, ChevronUp, ChevronDown, Edit, Trash2, X } from 'lucide-react'
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'

interface DbLesson {
  id: string
  module_id: string
  title: string
  content: string | null
  video_url: string | null
  duration_minutes: number | null
  order_index: number | null
  is_free: boolean | null
  is_active: boolean | null
  created_at: string | null
}

interface DbModule {
  id: string
  course_id: string
  title: string
  description: string | null
  order_index: number | null
  is_active: boolean | null
  created_at: string | null
  lessons?: DbLesson[]
}

export default function ModulesPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [modules, setModules] = useState<DbModule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingModule, setEditingModule] = useState<DbModule | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingModule, setDeletingModule] = useState<DbModule | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '' })

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRecords('modules', 'course_id', courseId, '*,lessons(*)')
      if (data) {
        const sorted = [...data].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        setModules(sorted)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load modules')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => { Promise.resolve().then(() => fetchModules()) }, [fetchModules])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) return
    try {
      if (editingModule) {
        await updateRecord('modules', editingModule.id, { title: formData.title.trim(), description: formData.description.trim() || null })
        notify.moduleUpdated()
      } else {
        await createRecord('modules', { title: formData.title.trim(), description: formData.description.trim() || null, course_id: courseId, order_index: modules.length + 1, is_active: true })
        notify.moduleCreated()
      }
      setShowForm(false)
      setEditingModule(null)
      setFormData({ title: '', description: '' })
      fetchModules()
    } catch { notify.genericError() }
  }

  async function handleDelete() {
    if (!deletingModule) return
    try {
      await deleteRecord('modules', deletingModule.id)
      notify.moduleDeleted()
      setShowDeleteConfirm(false)
      setDeletingModule(null)
      fetchModules()
    } catch { notify.genericError() }
  }

  async function handleReorder(moduleId: string, direction: 'up' | 'down') {
    const idx = modules.findIndex(m => m.id === moduleId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= modules.length) return
    try {
      const current = modules[idx]
      const swap = modules[swapIdx]
      await updateRecord('modules', current.id, { order_index: swap.order_index })
      await updateRecord('modules', swap.id, { order_index: current.order_index })
      fetchModules()
    } catch { notify.genericError() }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin-place/content/${courseId}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Modules</h1>
            <p className="text-sm text-slate-500 mt-1">Organize your course into modules</p>
          </div>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => { setEditingModule(null); setFormData({ title: '', description: '' }); setShowForm(true) }}>
            <Plus className="h-4 w-4" /> Add Module
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : error ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={fetchModules} className="border-slate-300">Retry</Button>
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <p className="text-slate-500 mb-4">No modules yet. Add your first module.</p>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => { setEditingModule(null); setFormData({ title: '', description: '' }); setShowForm(true) }}>
            <Plus className="h-4 w-4" /> Add Module
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, idx) => (
            <React.Fragment key={mod.id}>
              <div className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => handleReorder(mod.id, 'up')} disabled={idx === 0} className="text-slate-400 hover:text-slate-600 disabled:opacity-30 p-0.5">
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => handleReorder(mod.id, 'down')} disabled={idx === modules.length - 1} className="text-slate-400 hover:text-slate-600 disabled:opacity-30 p-0.5">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{mod.title}</p>
                    {mod.description && <p className="text-sm text-slate-500 truncate mt-0.5">{mod.description}</p>}
                    <p className="text-xs text-slate-400 mt-1">{(mod.lessons || []).length} lesson{(mod.lessons || []).length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingModule(mod); setFormData({ title: mod.title, description: mod.description || '' }); setShowForm(true) }} className="hover:bg-blue-50 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setDeletingModule(mod); setShowDeleteConfirm(true) }} className="hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">{editingModule ? 'Edit Module' : 'Create Module'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">{editingModule ? 'Update module details' : 'Add a new module to this course'}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Title</label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="border-slate-300 mt-1" placeholder="Module title" required />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1" rows={3} placeholder="Optional description" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-300">Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{editingModule ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Module"
        itemName={deletingModule?.title || 'this item'}
      />
    </div>
  )
}
