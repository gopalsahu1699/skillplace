'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import PhoneInput from '@/components/ui/phone-input'
import { Loader2, X } from 'lucide-react'

interface StudentFormDialogProps {
  open: boolean
  onClose: () => void
  formData: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  submitting: boolean
  editingStudent: string | null
  branches: { id: string; name: string }[]
  batches: { id: string; name: string }[]
  onSubmit: (e: React.FormEvent) => void
}

export default function StudentFormDialog({
  open,
  onClose,
  formData,
  onChange,
  submitting,
  editingStudent,
  branches,
  batches,
  onSubmit,
}: StudentFormDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {editingStudent ? 'Edit Student' : 'Add Student'}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Full Name *</label>
            <Input
              value={formData.full_name as string}
              onChange={(e) => onChange({ ...formData, full_name: e.target.value })}
              placeholder="Enter full name"
              className="border-slate-300 mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email *</label>
            <Input
              type="email"
              value={formData.email as string}
              onChange={(e) => onChange({ ...formData, email: e.target.value })}
              placeholder="Enter email"
              className="border-slate-300 mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <div className="mt-1">
              <PhoneInput
                value={formData.phone as string}
                onChange={(num) => onChange({ ...formData, phone: num })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Program Type</label>
            <Input
              value={formData.program_type as string}
              onChange={(e) => onChange({ ...formData, program_type: e.target.value })}
              placeholder="e.g. Online Course, Offline, Hybrid"
              className="border-slate-300 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Branch</label>
            <select
              value={formData.branch_id as string}
              onChange={(e) => onChange({ ...formData, branch_id: e.target.value })}
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
              value={formData.batch_id as string}
              onChange={(e) => onChange({ ...formData, batch_id: e.target.value })}
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
              onClick={() => onChange({ ...formData, is_active: !formData.is_active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.is_active ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.is_active ? 'translate-x-6' : 'translate-x-1'
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
              {editingStudent ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-300"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
