'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Star, Trash2, Eye, EyeOff, Plus, Edit } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'

interface Testimonial {
  id: string
  student_name: string
  student_photo: string | null
  course_name: string | null
  rating: number | null
  review: string
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingTestimonial, setDeletingTestimonial] = useState<Testimonial | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    student_name: '',
    student_photo: '',
    course_name: '',
    rating: 5,
    review: '',
    is_featured: false,
    is_active: true,
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getRecords('testimonials')
      setTestimonials(
        (data || []).sort(
          (a: Testimonial, b: Testimonial) =>
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
    Promise.resolve().then(() => fetchData())
  }, [fetchData])

  function openCreate() {
    setEditingTestimonial(null)
    setFormData({
      student_name: '',
      student_photo: '',
      course_name: '',
      rating: 5,
      review: '',
      is_featured: false,
      is_active: true,
    })
    setShowForm(true)
  }

  function openEdit(testimonial: Testimonial) {
    setEditingTestimonial(testimonial)
    setFormData({
      student_name: testimonial.student_name,
      student_photo: testimonial.student_photo || '',
      course_name: testimonial.course_name || '',
      rating: testimonial.rating || 5,
      review: testimonial.review,
      is_featured: testimonial.is_featured || false,
      is_active: testimonial.is_active !== false,
    })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.student_name.trim() || !formData.review.trim()) return
    setSaving(true)

    try {
      const payload = {
        student_name: formData.student_name.trim(),
        student_photo: formData.student_photo.trim() || null,
        course_name: formData.course_name.trim() || null,
        rating: formData.rating || 5,
        review: formData.review.trim(),
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      }

      if (editingTestimonial) {
        await updateRecord('testimonials', editingTestimonial.id, payload)
        notify.testimonialUpdated()
      } else {
        await createRecord('testimonials', payload)
        notify.testimonialCreated()
      }

      setShowForm(false)
      setEditingTestimonial(null)
      fetchData()
    } catch {
      notify.genericError()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingTestimonial) return
    try {
      await deleteRecord('testimonials', deletingTestimonial.id)
      notify.testimonialDeleted()
      setShowDeleteConfirm(false)
      setDeletingTestimonial(null)
      fetchData()
    } catch {
      notify.genericError()
    }
  }

  async function toggleFeatured(id: string, currentValue: boolean) {
    try {
      await updateRecord('testimonials', id, { is_featured: !currentValue })
      fetchData()
    } catch {
      // handled silently
    }
  }

  async function toggleActive(id: string, currentValue: boolean) {
    try {
      await updateRecord('testimonials', id, { is_active: !currentValue })
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
          <h1 className="text-2xl font-bold text-slate-900">Testimonials</h1>
          <p className="text-sm text-slate-500 mt-1">Manage student reviews and ratings</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Star className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{testimonials.length}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Eye className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {testimonials.filter((t) => t.is_featured).length}
              </p>
              <p className="text-xs text-slate-500">Featured</p>
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
                {testimonials.filter((t) => t.is_active).length}
              </p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {testimonials.length > 0
                  ? (
                      testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) /
                      testimonials.length
                    ).toFixed(1)
                  : '0'}
              </p>
              <p className="text-xs text-slate-500">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {testimonials.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <Star className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No testimonials yet.</p>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Testimonial
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {testimonial.student_photo ? (
                      <img
                        src={testimonial.student_photo}
                        alt={testimonial.student_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-blue-600">
                          {testimonial.student_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {testimonial.student_name}
                      </p>
                      {testimonial.course_name && (
                        <p className="text-xs text-slate-500">{testimonial.course_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {testimonial.is_featured && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs px-1.5">
                        Featured
                      </Badge>
                    )}
                    {!testimonial.is_active && (
                      <Badge className="bg-slate-100 text-slate-500 border-0 text-xs px-1.5">
                        Hidden
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < (testimonial.rating || 0)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-sm text-slate-600 line-clamp-3">{testimonial.review}</p>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openEdit(testimonial)}
                    className="font-medium px-2 py-0.5 rounded text-xs text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="h-3 w-3 inline mr-0.5" />Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFeatured(testimonial.id, testimonial.is_featured)}
                    className={`font-medium px-2 py-0.5 rounded text-xs ${
                      testimonial.is_featured
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {testimonial.is_featured ? 'Featured' : 'Feature'}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(testimonial.id, testimonial.is_active)}
                    className={`font-medium px-2 py-0.5 rounded text-xs ${
                      testimonial.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {testimonial.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingTestimonial(testimonial)
                      setShowDeleteConfirm(true)
                    }}
                    className="ml-auto font-medium px-2 py-0.5 rounded text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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
              {editingTestimonial ? 'Edit Testimonial' : 'Create Testimonial'}
            </DialogTitle>
            <DialogDescription>
              {editingTestimonial
                ? 'Update testimonial details'
                : 'Add a new student testimonial'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Student Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.student_name}
                onChange={(e) =>
                  setFormData({ ...formData, student_name: e.target.value })
                }
                className="border-slate-300 mt-1"
                placeholder="Student name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Student Photo URL</label>
              <Input
                value={formData.student_photo}
                onChange={(e) =>
                  setFormData({ ...formData, student_photo: e.target.value })
                }
                className="border-slate-300 mt-1"
                placeholder="https://... (optional)"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Course Name</label>
              <Input
                value={formData.course_name}
                onChange={(e) =>
                  setFormData({ ...formData, course_name: e.target.value })
                }
                className="border-slate-300 mt-1"
                placeholder="Course name (optional)"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Rating (1-5)</label>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: i + 1 })}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        i < formData.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-slate-500 ml-2">{formData.rating}/5</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.review}
                onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Student review text..."
                required
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({ ...formData, is_featured: e.target.checked })
                  }
                  className="rounded"
                />
                Featured
              </label>
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
                  : editingTestimonial
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
        title="Testimonial"
        itemName={deletingTestimonial?.student_name || 'this item'}
      />
    </div>
  )
}
