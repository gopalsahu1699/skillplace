'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Plus } from 'lucide-react'
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import ModuleCard from '@/components/admin/ModuleCard'
import type { Module, Lesson } from '@/types'

interface ModuleWithLessons extends Module {
  lessons: Lesson[]
}

export default function ModulesPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingModule, setEditingModule] = useState<ModuleWithLessons | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingModule, setDeletingModule] = useState<ModuleWithLessons | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)

  const fetchModules = useCallback(async () => {
    setLoading(true)
    const data = await getRecords('modules', 'course_id', courseId)

    if (data) {
      setModules(data.sort((a: any, b: any) => a.order_index - b.order_index).map((m: any) => ({
        ...m,
        lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index),
      })))
    }
    setLoading(false)
  }, [courseId])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  function openCreate() {
    setEditingModule(null)
    setFormData({ title: '', description: '' })
    setShowForm(true)
  }

  function openEdit(mod: ModuleWithLessons) {
    setEditingModule(mod)
    setFormData({ title: mod.title, description: mod.description || '' })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    if (editingModule) {
      await updateRecord('modules', editingModule.id, formData)
    } else {
      await createRecord('modules', {
        ...formData,
        course_id: courseId,
        order_index: modules.length + 1,
      })
    }

    setSaving(false)
    setShowForm(false)
    setEditingModule(null)
    setFormData({ title: '', description: '' })
    fetchModules()
  }

  async function handleDelete() {
    if (!deletingModule) return
    await deleteRecord('modules', deletingModule.id)
    setShowDeleteConfirm(false)
    setDeletingModule(null)
    fetchModules()
  }

  async function handleReorder(moduleId: string, direction: 'up' | 'down') {
    const idx = modules.findIndex(m => m.id === moduleId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= modules.length) return

    const current = modules[idx]
    const swap = modules[swapIdx]

    await updateRecord('modules', current.id, { order_index: swap.order_index })
    await updateRecord('modules', swap.id, { order_index: current.order_index })
    fetchModules()
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
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Module
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <p className="text-slate-500 mb-4">No modules yet. Add your first module.</p>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Module
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, idx) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              index={idx}
              total={modules.length}
              onSelect={() => {}}
              onEdit={() => openEdit(mod)}
              onDelete={() => { setDeletingModule(mod); setShowDeleteConfirm(true) }}
              onMoveUp={() => handleReorder(mod.id, 'up')}
              onMoveDown={() => handleReorder(mod.id, 'down')}
            />
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Edit Module' : 'Create Module'}</DialogTitle>
            <DialogDescription>
              {editingModule ? 'Update module details' : 'Add a new module to this course'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-slate-300"
                placeholder="Module title"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Optional description"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-slate-300">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? 'Saving...' : editingModule ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-900">{deletingModule?.title}</span>?
              All lessons in this module will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-slate-300">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
