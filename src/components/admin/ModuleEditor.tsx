'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, GripVertical, ChevronDown, ChevronRight, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Module } from '@/types'

interface ModuleEditorProps {
  courseId: string
  modules: Module[]
  onRefresh: () => void
}

export default function ModuleEditor({ courseId, modules, onRefresh }: ModuleEditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingModule, setDeletingModule] = useState<Module | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditingModule(null)
    setFormData({ title: '', description: '' })
    setShowForm(true)
  }

  function openEdit(module: Module) {
    setEditingModule(module)
    setFormData({ title: module.title, description: module.description || '' })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    if (editingModule) {
      await supabase.from('modules').update(formData).eq('id', editingModule.id)
    } else {
      const maxOrder = modules.length
      await supabase.from('modules').insert({
        ...formData,
        course_id: courseId,
        order_index: maxOrder + 1,
      })
    }

    setSaving(false)
    setShowForm(false)
    setEditingModule(null)
    setFormData({ title: '', description: '' })
    onRefresh()
  }

  async function handleDelete() {
    if (!deletingModule) return
    await supabase.from('modules').delete().eq('id', deletingModule.id)
    setShowDeleteConfirm(false)
    setDeletingModule(null)
    onRefresh()
  }

  async function handleReorder(moduleId: string, direction: 'up' | 'down') {
    const idx = modules.findIndex((m) => m.id === moduleId)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= modules.length) return

    const current = modules[idx]
    const swap = modules[swapIdx]

    await supabase.from('modules').update({ order_index: swap.order_index }).eq('id', current.id)
    await supabase.from('modules').update({ order_index: current.order_index }).eq('id', swap.id)
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">Modules</h3>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Module
        </Button>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500">No modules yet. Add your first module.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {modules.map((module, idx) => (
            <Card key={module.id} className="border-slate-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleReorder(module.id, 'up')}
                    disabled={idx === 0}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronRight className="h-3 w-3 -rotate-90" />
                  </button>
                  <button
                    onClick={() => handleReorder(module.id, 'down')}
                    disabled={idx === modules.length - 1}
                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronRight className="h-3 w-3 rotate-90" />
                  </button>
                </div>
                <GripVertical className="h-4 w-4 text-slate-300" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{module.title}</p>
                  {module.description && (
                    <p className="text-sm text-slate-500 truncate">{module.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(module)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeletingModule(module)
                      setShowDeleteConfirm(true)
                    }}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
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

      {/* Delete Confirmation */}
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
