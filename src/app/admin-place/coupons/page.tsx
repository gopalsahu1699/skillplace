'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tag,
  Plus,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Percent,
  DollarSign,
  Calendar,
  Hash,
} from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'

interface Coupon {
  id: string
  code: string
  discount_type: 'percent' | 'amount'
  discount_rate: number
  max_discount_amount: number | null
  min_order_amount: number | null
  max_uses: number | null
  used_count: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null)
  const [saving, setSaving] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'amount',
    discount_rate: '',
    max_discount_amount: '',
    min_order_amount: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getRecords('coupons')
      setCoupons(
        (data || []).sort(
          (a: Coupon, b: Coupon) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      )
    } catch {
      // handled silently
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code })
  }

  function openCreate() {
    setEditingCoupon(null)
    setFormData({
      code: '',
      discount_type: 'percent',
      discount_rate: '',
      max_discount_amount: '',
      min_order_amount: '',
      max_uses: '',
      valid_from: '',
      valid_until: '',
      is_active: true,
    })
    setShowForm(true)
  }

  function openEdit(coupon: Coupon) {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_rate: coupon.discount_rate.toString(),
      max_discount_amount: coupon.max_discount_amount?.toString() || '',
      min_order_amount: coupon.min_order_amount?.toString() || '',
      max_uses: coupon.max_uses?.toString() || '',
      valid_from: coupon.valid_from?.split('T')[0] || '',
      valid_until: coupon.valid_until?.split('T')[0] || '',
      is_active: coupon.is_active !== false,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.code.trim() || !formData.discount_rate) return
    setSaving(true)

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discount_type: formData.discount_type,
        discount_rate: parseFloat(formData.discount_rate),
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : new Date().toISOString(),
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        is_active: formData.is_active,
      }

      if (editingCoupon) {
        await updateRecord('coupons', editingCoupon.id, payload)
      } else {
        await createRecord('coupons', { ...payload, used_count: 0 })
      }

      setShowForm(false)
      setEditingCoupon(null)
      fetchData()
    } catch {
      // handled silently
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingCoupon) return
    try {
      await deleteRecord('coupons', deletingCoupon.id)
      setShowDeleteConfirm(false)
      setDeletingCoupon(null)
      fetchData()
    } catch {
      // handled silently
    }
  }

  async function toggleActive(id: string, currentValue: boolean) {
    try {
      await updateRecord('coupons', id, { is_active: !currentValue })
      fetchData()
    } catch {
      // handled silently
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  function getCouponStatus(coupon: Coupon) {
    if (!coupon.is_active) return { label: 'Inactive', color: 'bg-slate-100 text-slate-600' }
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return { label: 'Expired', color: 'bg-red-100 text-red-700' }
    }
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return { label: 'Exhausted', color: 'bg-orange-100 text-orange-700' }
    }
    return { label: 'Active', color: 'bg-green-100 text-green-700' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const activeCoupons = coupons.filter((c) => {
    if (!c.is_active) return false
    if (c.valid_until && new Date(c.valid_until) < new Date()) return false
    if (c.max_uses && c.used_count >= c.max_uses) return false
    return true
  }).length

  const totalUses = coupons.reduce((sum, c) => sum + c.used_count, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Coupon Codes</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage discount coupons for purchases</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Tag className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{coupons.length}</p>
            <p className="text-xs text-slate-500">Total Coupons</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{activeCoupons}</p>
            <p className="text-xs text-slate-500">Active</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Hash className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalUses}</p>
            <p className="text-xs text-slate-500">Total Uses</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {coupons.length - activeCoupons}
            </p>
            <p className="text-xs text-slate-500">Inactive / Expired</p>
          </div>
        </div>
      </div>

      {/* Coupon List */}
      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <Tag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No coupons created yet.</p>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create Coupon
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => {
            const status = getCouponStatus(coupon)
            return (
              <div
                key={coupon.id}
                className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    {coupon.discount_type === 'percent' ? (
                      <Percent className="h-6 w-6 text-blue-600" />
                    ) : (
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {coupon.code}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyCode(coupon.code)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? (
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <Badge className={`border-0 text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium text-green-700">
                        {coupon.discount_type === 'percent'
                          ? `${coupon.discount_rate}% OFF${coupon.max_discount_amount ? ` (upto ₹${coupon.max_discount_amount})` : ''}`
                          : `₹${coupon.discount_rate} OFF`}
                      </span>
                      {coupon.min_order_amount && coupon.min_order_amount > 0 && (
                        <span className="text-xs text-slate-500">
                          Min order: ₹{coupon.min_order_amount}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">
                        Used: {coupon.used_count}
                        {coupon.max_uses ? ` / ${coupon.max_uses}` : ''} times
                      </span>
                      {coupon.valid_until && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(coupon.valid_until).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleActive(coupon.id, coupon.is_active)}
                      className={`p-1.5 rounded-lg text-xs ${
                        coupon.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={coupon.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {coupon.is_active ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(coupon)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      title="Edit"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingCoupon(coupon)
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
            )
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon
                ? 'Update coupon details'
                : 'Create a new discount coupon for students'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="border-slate-300 mt-1 font-mono"
                  placeholder="SUMMER20"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-300"
                  onClick={generateCode}
                >
                  <Hash className="h-4 w-4 mr-1" /> Generate
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Discount Type</label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, discount_type: value as 'percent' | 'amount' })
                  }
                >
                  <SelectTrigger className="border-slate-300 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="amount">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {formData.discount_type === 'percent' ? '%' : '₹'}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount_rate}
                    onChange={(e) => setFormData({ ...formData, discount_rate: e.target.value })}
                    className="pl-8 border-slate-300"
                    placeholder="20"
                    required
                  />
                </div>
              </div>
            </div>
            {formData.discount_type === 'percent' && (
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Max Discount Cap (optional)
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <Input
                    type="number"
                    step="1"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                    className="pl-8 border-slate-300"
                    placeholder="e.g. 4000 (leave empty for no cap)"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">E.g., 20% upto ₹4,000 means max discount is ₹4,000 even if 20% of price is higher</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Min Order Amount</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <Input
                    type="number"
                    step="1"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    className="pl-8 border-slate-300"
                    placeholder="0 (no minimum)"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Max Uses</label>
                <Input
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  className="border-slate-300 mt-1"
                  placeholder="Unlimited"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Valid From</label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="border-slate-300 mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Valid Until</label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="border-slate-300 mt-1"
                  placeholder="No expiry"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
                id="coupon-active"
              />
              <label htmlFor="coupon-active" className="text-sm text-slate-600">
                Active (can be used immediately)
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
                  : editingCoupon
                    ? 'Update'
                    : 'Create Coupon'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete coupon{' '}
              <span className="font-semibold text-slate-900">{deletingCoupon?.code}</span>?
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
