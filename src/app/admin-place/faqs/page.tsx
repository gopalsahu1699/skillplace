'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import AdminDeleteDialog from '@/components/admin/AdminDeleteDialog'
import { HelpCircle, Trash2, Plus, Edit, EyeOff, GripVertical } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'

interface Faq {
  id: string
  question: string
  answer: string
  display_order: number
  is_active: boolean
  created_at: string
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingFaq, setDeletingFaq] = useState<Faq | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    display_order: 0,
    is_active: true,
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getRecords('faqs')
      setFaqs(
        (data || []).sort(
          (a: Faq, b: Faq) => (a.display_order ?? 0) - (b.display_order ?? 0)
        )
      )
    } catch {
      // handled silently
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => fetchData())
  }, [fetchData])

  function openCreate() {
    setEditingFaq(null)
    setFormData({
      question: '',
      answer: '',
      display_order: faqs.length + 1,
      is_active: true,
    })
    setShowForm(true)
  }

  function openEdit(faq: Faq) {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      display_order: faq.display_order ?? 0,
      is_active: faq.is_active !== false,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.question.trim() || !formData.answer.trim()) return
    setSaving(true)

    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        display_order: formData.display_order,
        is_active: formData.is_active,
      }

      if (editingFaq) {
        await updateRecord('faqs', editingFaq.id, payload)
        notify.faqUpdated()
      } else {
        await createRecord('faqs', payload)
        notify.faqCreated()
      }

      setShowForm(false)
      setEditingFaq(null)
      fetchData()
    } catch {
      notify.genericError()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingFaq) return
    try {
      await deleteRecord('faqs', deletingFaq.id)
      notify.faqDeleted()
      setShowDeleteConfirm(false)
      setDeletingFaq(null)
      fetchData()
    } catch {
      notify.genericError()
    }
  }

  async function toggleActive(id: string, currentValue: boolean) {
    try {
      await updateRecord('faqs', id, { is_active: !currentValue })
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FAQs</h1>
          <p className="text-sm text-slate-500 mt-1">Manage frequently asked questions</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{faqs.length}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {faqs.filter((f) => f.is_active).length}
              </p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <GripVertical className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {faqs.filter((f) => !f.is_active).length}
              </p>
              <p className="text-xs text-slate-500">Hidden</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <HelpCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No FAQs yet.</p>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 font-mono">
                        #{faq.display_order}
                      </span>
                      {!faq.is_active && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-slate-900 text-sm">{faq.question}</p>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(faq)}
                      className="font-medium px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-3 w-3 inline mr-0.5" />Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(faq.id, faq.is_active)}
                      className={`font-medium px-2 py-1 rounded text-xs ${
                        faq.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {faq.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingFaq(faq)
                        setShowDeleteConfirm(true)
                      }}
                      className="font-medium px-2 py-1 rounded text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? 'Edit FAQ' : 'Create FAQ'}
            </DialogTitle>
            <DialogDescription>
              {editingFaq
                ? 'Update the question and answer'
                : 'Add a new frequently asked question'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Display Order
              </label>
              <Input
                type="number"
                min={0}
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                }
                className="border-slate-300 mt-1 w-24"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Question <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Enter the question..."
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                placeholder="Enter the answer..."
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="rounded"
                />
                Active
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
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving
                  ? 'Saving...'
                  : editingFaq
                    ? 'Update'
                    : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AdminDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="FAQ"
        itemName={deletingFaq?.question || 'this item'}
      />
    </div>
  )
}
